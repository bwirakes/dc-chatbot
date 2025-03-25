'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import type { UseChatHelpers } from '@ai-sdk/react';

interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers['append'];
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: 'What documents',
      label: 'are needed for probate in DC?',
      action: '[DC PROBATE DOCUMENTS QUERY] What documents are needed for probate in DC?',
    },
    {
      title: 'What are important',
      label: 'deadlines for the probate process?',
      action: '[DC PROBATE DEADLINES QUERY] What are important deadlines in the DC probate process?',
    },
    {
      title: 'I have a will',
      label: 'can you help me analyze it?',
      action: '[DC PROBATE WILL ANALYSIS QUERY] I have a will, can you help me analyze it to understand what\'s going on with it?',
    },
    {
      title: 'Speak to Alex',
      label: 'our probate agent for personalized help',
      action: '[DC PROBATE ALEX CONSULTATION QUERY] I would like to speak to Alex, the probate agent who can help work through issues and set up a meeting with an attorney.',
    },
  ];

  const handleActionClick = (suggestedAction: typeof suggestedActions[0]) => {
    window.history.replaceState({}, '', `/chat/${chatId}`);

    // Send the user message with a special prefix that the AI will recognize
    append({
      role: 'user',
      content: suggestedAction.action,
    });
  };

  return (
    <div className="mx-auto max-w-3xl mb-8 mt-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">DC Probate Assistant</h1>
        <p className="text-muted-foreground">Select an option below to get started with your probate process</p>
      </div>
      <div
        data-testid="suggested-actions"
        className="grid sm:grid-cols-2 gap-4 w-full"
      >
        {suggestedActions.map((suggestedAction, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1 * index }}
            key={`suggested-action-${suggestedAction.title}-${index}`}
            className="block" // Show all options on all screen sizes
          >
            <Button
              variant="outline"
              onClick={() => handleActionClick(suggestedAction)}
              className="text-left border-2 rounded-xl p-5 text-sm flex-1 gap-2 flex flex-col w-full h-auto justify-start items-start hover:bg-muted/50 hover:border-primary/50 transition-all"
            >
              <span className="font-bold text-primary text-base">{suggestedAction.title}</span>
              <span className="text-muted-foreground">
                {suggestedAction.label}
              </span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export const SuggestedActions = PureSuggestedActions;
