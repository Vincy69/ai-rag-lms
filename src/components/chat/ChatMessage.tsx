import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export function ChatMessage({ content, isUser, timestamp }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex w-full gap-4 px-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2 rounded-lg p-4",
          isUser
            ? "bg-primary text-primary-foreground"
            : "glass"
        )}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        ) : (
          <ReactMarkdown 
            className="text-sm prose prose-sm dark:prose-invert max-w-none"
            components={{
              pre: ({ node, ...props }) => (
                <div className="overflow-auto rounded-lg bg-background/50 p-2 my-2">
                  <pre {...props} />
                </div>
              ),
              code: ({ node, ...props }) => (
                <code className="rounded bg-background/50 px-1 py-0.5" {...props} />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        )}
        <span className="text-xs opacity-70">
          {timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}