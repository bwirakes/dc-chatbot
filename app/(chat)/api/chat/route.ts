import {
  UIMessage,
  appendResponseMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';
import { auth } from '@/app/(auth)/auth';
import { 
  systemPrompt, 
  createMessagesWithFiles, 
  documentAnalysisPrompt, 
  loadDCProbateGuidePrompt,
  createSimpleProbatePrompt
} from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  getTrailingMessageId,
} from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const {
      id,
      messages,
      selectedChatModel,
    }: {
      id: string;
      messages: Array<UIMessage>;
      selectedChatModel: string;
    } = await request.json();

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message: userMessage,
      });

      await saveChat({ id, userId: session.user.id, title });
    } else {
      if (chat.userId !== session.user.id) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: userMessage.id,
          role: 'user',
          parts: userMessage.parts,
          attachments: userMessage.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });

    // Check if there are file attachments and process them
    const attachments = (userMessage.experimental_attachments || []) as Array<{ contentType: string, url: string }>;
    const hasAttachments = attachments.length > 0;
    
    // Prepare attachments for Gemini if they exist
    const fileAttachments = hasAttachments
      ? attachments.map(attachment => ({
          mimeType: attachment.contentType || 'application/octet-stream', // Provide default if undefined
          uri: attachment.url
        }))
      : [];
    
    // Check if the message content contains DC Probate related keywords
    const messageContent = typeof userMessage.content === 'string' ? userMessage.content : '';
    
    // We'll only load the PDF if specifically requested with the [LOAD_DC_PROBATE_PDF] tag
    // This prevents the PDF loading from causing issues on regular queries
    const shouldLoadProbatePDF = messageContent.includes('[LOAD_DC_PROBATE_PDF]');
    
    const isProbateRelated = messageContent.toLowerCase().includes('probate') || 
                             messageContent.toLowerCase().includes('estate') ||
                             messageContent.toLowerCase().includes('will') ||
                             messageContent.toLowerCase().includes('dc') ||
                             messageContent.toLowerCase().includes('columbia');

    // Determine which messaging approach to use
    let messagingConfig;
    
    try {
      if (shouldLoadProbatePDF && isProbateRelated) {
        try {
          // Only try to load PDF if explicitly requested
          console.log("Explicitly requested to load DC Probate Guide PDF");
          const dcProbateMessages = await loadDCProbateGuidePrompt({
            // Remove the tag from the message
            userMessage: messageContent.replace('[LOAD_DC_PROBATE_PDF]', '').trim(),
            files: fileAttachments
          });
          messagingConfig = { messages: dcProbateMessages };
          console.log("Successfully loaded PDF content");
        } catch (pdfError) {
          console.error("Error loading DC Probate Guide PDF, falling back to standard prompt:", pdfError);
          // Use the simple version that doesn't try to load the PDF
          const simpleProbateMessages = createSimpleProbatePrompt({
            userMessage: messageContent.replace('[LOAD_DC_PROBATE_PDF]', '').trim(),
            files: fileAttachments
          });
          messagingConfig = { messages: simpleProbateMessages };
        }
      } else if (isProbateRelated) {
        // For probate-related queries that don't explicitly request PDF loading,
        // use the simpler prompt with hardcoded DC probate information
        const simpleProbateMessages = createSimpleProbatePrompt({
          userMessage: messageContent,
          files: fileAttachments
        });
        messagingConfig = { messages: simpleProbateMessages };
      } else if (hasAttachments) {
        // Use standard file handling for non-probate queries with attachments
        messagingConfig = { 
          messages: createMessagesWithFiles({
            userMessage: messageContent,
            systemPromptText: fileAttachments.length > 0 ? documentAnalysisPrompt : systemPrompt({ selectedChatModel }),
            files: fileAttachments,
            previousMessages: messages.slice(0, -1)
          }) 
        };
      } else {
        // Use standard approach for other queries
        messagingConfig = { 
          system: systemPrompt({ selectedChatModel }),
          messages 
        };
      }
    } catch (configError) {
      console.error("Error setting up messaging config, using default:", configError);
      // Final fallback to the most basic configuration
      messagingConfig = { 
        system: systemPrompt({ selectedChatModel }),
        messages 
      };
    }

    return createDataStreamResponse({
      execute: (dataStream) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          ...messagingConfig,
          maxSteps: 5,
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          onFinish: async ({ response }) => {
            if (session.user?.id) {
              try {
                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter(
                    (message) => message.role === 'assistant',
                  ),
                });

                if (!assistantId) {
                  throw new Error('No assistant message found!');
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [userMessage],
                  responseMessages: response.messages,
                });

                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role,
                      parts: assistantMessage.parts,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });
              } catch (_) {
                console.error('Failed to save chat');
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: () => {
        return 'Oops, an error occured!';
      },
    });
  } catch (error) {
    return new Response('An error occurred while processing your request!', {
      status: 404,
    });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}
