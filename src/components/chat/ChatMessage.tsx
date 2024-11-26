import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  // Remove node from destructuring since it's not needed
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
            ? "bg-primary text-primary-foreground"
            : "glass border border-white/20 shadow-xl"
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        ) : (
          <ReactMarkdown 
            className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:my-0 prose-headings:text-foreground prose-a:text-primary text-white"
            components={{
              pre: ({ ...props }) => (
                <div className="overflow-auto my-2 rounded-lg bg-black/30 backdrop-blur-sm border border-white/20">
                  <pre {...props} className="p-3" />
                </div>
              ),
              code: ({ inline, ...props }: CodeProps) => (
                <code 
                  className={cn(
                    "bg-black/30 rounded px-1.5 py-0.5 border border-white/20",
                    inline && "text-xs"
                  )} 
                  {...props} 
                />
              ),
              p: ({ children }) => (
                <p className="leading-relaxed mb-4 last:mb-0 text-white">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-4 mb-4 space-y-2 last:mb-0 text-white">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-4 mb-4 space-y-2 last:mb-0 text-white">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed text-white">{children}</li>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        )}
        <span className="text-xs text-white/60">
          {timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}