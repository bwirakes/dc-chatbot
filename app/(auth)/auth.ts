import { compare } from 'bcrypt-ts';
import NextAuth, { type User, type Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { getUser } from '@/lib/db/queries';

import { authConfig } from './auth.config';

interface ExtendedSession extends Session {
  user: User;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  session: {
    // Use JWT strategy for session handling
    strategy: 'jwt',
    // 30 days max session age
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        try {
          // Check if email exists
          if (!email || !password) {
            console.log("Missing credentials");
            return null;
          }
          
          const users = await getUser(email);
          if (users.length === 0) {
            console.log("User not found");
            return null;
          }
          
          // Verify password
          if (!users[0].password) {
            console.log("User has no password");
            return null;
          }
          
          const passwordsMatch = await compare(password, users[0].password);
          if (!passwordsMatch) {
            console.log("Password doesn't match");
            return null;
          }
          
          // Return user without password
          const { password: _, ...userWithoutPassword } = users[0];
          return userWithoutPassword as any;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // When user signs in, add their data to the token
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: any;
    }) {
      // Add token data to the session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  // Debug mode - only enable in development
  debug: process.env.NODE_ENV === 'development',
});
