'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { ArrowDownIcon, Command } from './icons';
import { cn } from '@/lib/utils';

interface ConsoleLog {
  id: string;
  type: 'stdout' | 'stderr' | 'output';
  message: string;
}

const consoleStorage: { [key: string]: ConsoleLog[] } = {};

type ConsoleProps = {
  id: string;
};

function PureConsole({ id }: ConsoleProps) {
  const [consoleOutputs, setConsoleOutputs] = useLocalStorage<
    Record<string, Array<ConsoleLog>>
  >('console-outputs', {});
  const [isMinimized, setIsMinimized] = useState(false);
  const [internalOutputs, setInternalOutputs] = useState<
    Array<ConsoleLog> | null
  >(consoleStorage[id] || null);
  const consoleRef = useRef<HTMLDivElement>(null);

  const outputs = useMemo(() => {
    const fromLocalStorage = consoleOutputs[id] || [];
    const fromMemoryStorage = internalOutputs || [];

    return [...fromLocalStorage, ...fromMemoryStorage].slice(-50);
  }, [consoleOutputs, id, internalOutputs]);

  const registerConsoleListener = useCallback(
    (id: string) => {
      // Set up console listener
      if (!consoleStorage[id]) {
        consoleStorage[id] = [];
      }

      const listener = (event: MessageEvent) => {
        if (event.data.type === 'console' && event.data.codeId === id) {
          const { level, args, codeId } = event.data;
          const message = typeof args === 'string' ? args : args[0];

          consoleStorage[codeId] = [
            ...(consoleStorage[codeId] || []),
            {
              id: Math.random().toString(36).substring(7),
              message,
              type: level === 'error' ? 'stderr' : 'stdout',
            },
          ];

          setInternalOutputs([...(consoleStorage[codeId] || [])]);
        }
      };

      window.addEventListener('message', listener);

      return {
        destroy: () => {
          window.removeEventListener('message', listener);
        },
      };
    },
    [],
  );

  // Register console listener
  useEffect(() => {
    const controller = registerConsoleListener(id);
    
    return () => {
      controller.destroy();
    };
  }, [id, registerConsoleListener]);

  // Scroll to bottom when new logs are added
  useEffect(() => {
    if (consoleRef.current && !isMinimized) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [outputs, isMinimized]);

  const setOutput = (message: string) => {
    const newOutput = {
      id: Math.random().toString(36).substring(7),
      message,
      type: 'output' as const,
    };

    setConsoleOutputs((currentOutputs) => {
      const currentId = id;
      const current = currentOutputs[currentId] || [];
      return {
        ...currentOutputs,
        [currentId]: [...current, newOutput],
      };
    });
  };

  if (outputs.length === 0) {
    return null;
  }

  if (isMinimized) {
    return (
      <motion.div
        data-testid="console-minimized"
        layoutId={id}
        className="fixed bottom-0 inset-x-0 p-2 z-20 flex flex-row items-center"
        onClick={() => setIsMinimized(false)}
      >
        <motion.div
          className="cursor-pointer bg-background/95 backdrop-blur-sm flex flex-row items-center gap-2 p-2 px-3 rounded-full border"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Command size={14} />
          <div className="text-xs text-muted-foreground">
            {outputs.length} console outputs
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        data-testid="console"
        layoutId={id}
        className="fixed bottom-0 z-20 max-h-[300px] w-full border-t bg-background/90 backdrop-blur-sm"
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        exit={{ y: 300 }}
      >
        <div className="flex flex-row justify-between items-center p-2 border-b">
          <div className="flex flex-row items-center">
            <Command size={14} />
            <div className="text-sm font-mono text-muted-foreground ml-2">
              Console
            </div>
          </div>

          <div className="flex flex-row items-center gap-2">
            <button
              type="button"
              className="p-1 hover:bg-accent hover:text-accent-foreground rounded"
              onClick={() => {
                setConsoleOutputs((curr) => ({ ...curr, [id]: [] }));
                consoleStorage[id] = [];
                setInternalOutputs(null);
              }}
            >
              <div className="text-xs">Clear</div>
            </button>

            <button
              type="button"
              className="p-1 hover:bg-accent hover:text-accent-foreground rounded"
              onClick={() => setIsMinimized(true)}
            >
              <div className="text-muted-foreground">
                <ArrowDownIcon size={14} />
              </div>
            </button>
          </div>
        </div>

        <div
          ref={consoleRef}
          className="overflow-y-auto max-h-[240px] p-2 font-mono text-xs"
        >
          {outputs.map((output) => (
            <div
              key={output.id}
              className={cn('whitespace-pre-wrap mb-1', {
                'text-red-500': output.type === 'stderr',
                'text-muted-foreground': output.type === 'stdout',
                'text-green-500': output.type === 'output',
              })}
            >
              {output.message}
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export const Console = memo(PureConsole);
