import ReactMarkdown from "react-markdown";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  return (
    <div
      className={`markdown-content overflow-x-auto overflow-y-visible wrap-break-word ${className}`}
      style={{ wordWrap: "break-word", overflowWrap: "break-word" }}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground">{children}</h1>,
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mt-7 mb-3 text-foreground">{children}</h2>
          ),
          h3: ({ children }) => <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">{children}</h3>,
          h4: ({ children }) => <h4 className="text-lg font-semibold mt-5 mb-2 text-foreground">{children}</h4>,
          h5: ({ children }) => (
            <h5 className="text-base font-semibold mt-4 mb-2 text-foreground">{children}</h5>
          ),
          h6: ({ children }) => <h6 className="text-sm font-semibold mt-3 mb-2 text-foreground">{children}</h6>,
          p: ({ children }) => <p className="mb-4 leading-7 text-foreground">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc list-outside mb-4 ml-6 space-y-2 text-foreground">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside mb-4 ml-6 space-y-2 text-foreground">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-7">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
                {children}
              </code>
            ) : (
              <code className="block bg-muted p-4 rounded-lg text-sm font-mono text-foreground overflow-x-auto mb-4">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-muted p-4 rounded-lg text-sm font-mono text-foreground overflow-x-auto mb-4">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-6 border-border" />,
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-primary underline hover:text-primary/80"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-border">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
          th: ({ children }) => (
            <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border border-border px-4 py-2 text-foreground">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

