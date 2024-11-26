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
          "flex max-w-[80%] flex-col gap-2 rounded-lg p-4 shadow-lg",
          isUser
            ? "bg-primary/90 text-primary-foreground backdrop-blur-sm"
            : "glass border border-white/10"
        )}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        ) : (
          <ReactMarkdown 
            className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:my-0"
            components={{
              pre: ({ node, ...props }) => (
                <div className="overflow-auto my-2 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
                  <pre {...props} className="p-2" />
                </div>
              ),
              code: ({ node, inline, ...props }) => (
                <code 
                  className={cn(
                    "bg-black/20 rounded px-1.5 py-0.5 border border-white/10",
                    inline && "text-xs"
                  )} 
                  {...props} 
                />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        )}
        <span className="text-xs opacity-50">
          {timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}