import 'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import { and, asc, desc, eq, gt, gte, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getOrSetCache, deleteCache, deleteCacheByPattern } from '../redis/cache';

import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  message,
  vote,
  type DBMessage,
} from './schema';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// Configuration for Supabase Postgres connection
if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is not defined');
}

const client = postgres(process.env.POSTGRES_URL, {
  ssl: { rejectUnauthorized: false }, // Allow self-signed certificates
  max: 10, // Connection pool size
  idle_timeout: 20, // Idle connection timeout in seconds
  connect_timeout: 10, // Connection timeout in seconds
});

// Export the db instance for use in health checks and other utilities
export const db = drizzle(client);

// Cache TTL constants (in seconds)
const CACHE_TTL = {
  USER: 60 * 60, // 1 hour
  CHAT: 60 * 5, // 5 minutes
  MESSAGES: 60 * 2, // 2 minutes
  DOCUMENT: 60 * 10, // 10 minutes
  VOTES: 60 * 5, // 5 minutes
};

export async function getUser(email: string): Promise<Array<User>> {
  const cacheKey = `user:${email}`;
  
  return getOrSetCache(
    cacheKey,
    async () => {
      try {
        return await db.select().from(user).where(eq(user.email, email));
      } catch (error) {
        console.error('Failed to get user from database');
        throw error;
      }
    },
    CACHE_TTL.USER
  );
}

export async function getUserById(id: string): Promise<User | null> {
  const cacheKey = `user:id:${id}`;
  
  return getOrSetCache(
    cacheKey,
    async () => {
      try {
        const users = await db.select().from(user).where(eq(user.id, id));
        return users.length > 0 ? users[0] : null;
      } catch (error) {
        console.error('Failed to get user by id from database', error);
        return null;
      }
    },
    CACHE_TTL.USER
  );
}

export async function ensureUserExists(id: string, email: string): Promise<boolean> {
  try {
    // Check if user exists
    const existingUser = await getUserById(id);
    
    // If user already exists, return true
    if (existingUser) {
      return true;
    }
    
    // Create a temporary user with basic information
    await db.insert(user).values({
      id, // Use the provided ID
      email: email || `temporary-${id}@example.com`,
      // No password is set, this user can only be accessed via session
    });
    
    // Invalidate cache
    await deleteCache(`user:id:${id}`);
    if (email) {
      await deleteCache(`user:${email}`);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to ensure user exists in database', error);
    return false;
  }
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    const result = await db.insert(user).values({ email, password: hash });
    // Invalidate any cached user data
    await deleteCache(`user:${email}`);
    return result;
  } catch (error) {
    console.error('Failed to create user in database');
    throw error;
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    const result = await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
    });
    
    // Invalidate chat cache
    await deleteCache(`chat:${id}`);
    await deleteCacheByPattern(`chats:user:${userId}*`);
    
    return result;
  } catch (error) {
    console.error('Failed to save chat in database');
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    // Get chat to access userId for cache invalidation
    const chatData = await getChatById({ id });
    
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    const result = await db.delete(chat).where(eq(chat.id, id));
    
    // Invalidate caches
    await deleteCache(`chat:${id}`);
    await deleteCacheByPattern(`messages:chat:${id}*`);
    await deleteCacheByPattern(`votes:chat:${id}*`);
    if (chatData?.userId) {
      await deleteCacheByPattern(`chats:user:${chatData.userId}*`);
    }
    
    return result;
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  const cacheKey = `chats:user:${id}`;
  
  return getOrSetCache(
    cacheKey,
    async () => {
      try {
        return await db
          .select()
          .from(chat)
          .where(eq(chat.userId, id))
          .orderBy(desc(chat.createdAt));
      } catch (error) {
        console.error('Failed to get chats by user from database');
        throw error;
      }
    },
    CACHE_TTL.CHAT
  );
}

export async function getChatById({ id }: { id: string }) {
  const cacheKey = `chat:${id}`;
  
  return getOrSetCache(
    cacheKey,
    async () => {
      try {
        const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
        return selectedChat;
      } catch (error) {
        console.error('Failed to get chat by id from database');
        throw error;
      }
    },
    CACHE_TTL.CHAT
  );
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    const result = await db.insert(message).values(messages);
    
    // Invalidate messages cache for each affected chat
    const chatIds = [...new Set(messages.map(m => m.chatId))];
    for (const chatId of chatIds) {
      await deleteCacheByPattern(`messages:chat:${chatId}*`);
    }
    
    return result;
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  const cacheKey = `messages:chat:${id}`;
  
  return getOrSetCache(
    cacheKey,
    async () => {
      try {
        return await db
          .select()
          .from(message)
          .where(eq(message.chatId, id))
          .orderBy(asc(message.createdAt));
      } catch (error) {
        console.error('Failed to get messages by chat id from database', error);
        throw error;
      }
    },
    CACHE_TTL.MESSAGES
  );
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    console.error('Failed to upvote message in database', error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  const cacheKey = `votes:chat:${id}`;
  
  return getOrSetCache(
    cacheKey,
    async () => {
      try {
        return await db.select().from(vote).where(eq(vote.chatId, id));
      } catch (error) {
        console.error('Failed to get votes by chat id from database', error);
        throw error;
      }
    },
    CACHE_TTL.VOTES
  );
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: string;
  content: string;
  userId: string;
}) {
  try {
    return await db.insert(document).values({
      id,
      title,
      kind,
      content,
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    console.error('Failed to get message by id from database');
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
  } catch (error) {
    console.error(
      'Failed to delete messages by id after timestamp from database',
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    console.error('Failed to update chat visibility in database');
    throw error;
  }
}
