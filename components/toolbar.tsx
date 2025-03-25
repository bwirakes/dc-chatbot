'use client';

import { UseChatHelpers } from '@ai-sdk/react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import {
  type Dispatch,
  memo,
  ReactNode,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { nanoid } from 'nanoid';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { ArrowUpIcon, StopIcon, SummarizeIcon } from './icons';

type ToolProps = {
  description: string;
  icon: ReactNode;
  selectedTool: string | null;
  setSelectedTool: Dispatch<SetStateAction<string | null>>;
  isToolbarVisible?: boolean;
  setIsToolbarVisible?: Dispatch<SetStateAction<boolean>>;
  isAnimating: boolean;
  append: UseChatHelpers['append'];
  onClick: ({
    appendMessage,
  }: {
    appendMessage: UseChatHelpers['append'];
  }) => void;
};

function Tool({
  description,
  icon,
  selectedTool,
  setSelectedTool,
  isToolbarVisible,
  setIsToolbarVisible,
  isAnimating,
  append,
  onClick,
}: ToolProps) {
  // Function to execute the click action
  const executeClick = () => {
    onClick({ appendMessage: append });
    if (setIsToolbarVisible) {
      setIsToolbarVisible(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="transition-all p-2 rounded-xl flex items-center justify-center gap-2 hover:bg-black/5 dark:hover:bg-white/5"
            onClick={executeClick}
          >
            {icon}
          </button>
        </TooltipTrigger>
        <TooltipContent>{description}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Simplified toolbar component
export function Toolbar({
  isToolbarVisible,
  setIsToolbarVisible,
  append,
  status,
  stop,
  setMessages,
}: {
  isToolbarVisible: boolean;
  setIsToolbarVisible: Dispatch<SetStateAction<boolean>>;
  append: UseChatHelpers['append'];
  status: UseChatHelpers['status'];
  stop: UseChatHelpers['stop'];
  setMessages: UseChatHelpers['setMessages'];
}) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close toolbar when clicking outside
  useOnClickOutside(toolbarRef, () => {
    if (isToolbarVisible) {
      setIsToolbarVisible(false);
    }
  });

  return (
    <motion.div
      ref={toolbarRef}
      className="flex flex-row justify-center fixed bottom-24 w-full pointer-events-none"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
    >
      <motion.div className="bg-card border shadow-md rounded-xl pointer-events-auto">
        <div className="flex flex-row gap-2 p-1 items-center">
          {status === 'in_progress' ? (
            <Tool
              description="Stop generating"
              icon={<StopIcon />}
              selectedTool={selectedTool}
              setSelectedTool={setSelectedTool}
              isAnimating={isAnimating}
              append={append}
              onClick={() => {
                stop();
              }}
            />
          ) : (
            <>
              <Tool
                description="Summarize conversation"
                icon={<SummarizeIcon />}
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
                isAnimating={isAnimating}
                append={append}
                onClick={({ appendMessage }) => {
                  const messageId = nanoid();
                  appendMessage({
                    id: messageId,
                    role: 'user',
                    content: 'Summarize this conversation',
                  });
                }}
              />
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export const MemoizedToolbar = memo(Toolbar, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.isToolbarVisible !== nextProps.isToolbarVisible) return false;
  return true;
});
