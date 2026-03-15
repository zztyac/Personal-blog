import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownContent({ source }: { source: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ ...props }) => <a {...props} target="_blank" rel="noreferrer" />,
        img: ({ src, alt, ...props }) => {
          const normalizedSrc = typeof src === "string" ? src.trim() : "";

          if (!normalizedSrc) {
            return null;
          }

          return <img src={normalizedSrc} alt={alt || ""} loading="lazy" referrerPolicy="no-referrer" {...props} />;
        },
        code: ({ className, children, ...props }) => (
          <code className={className} {...props}>
            {children}
          </code>
        )
      }}
    >
      {source}
    </ReactMarkdown>
  );
}
