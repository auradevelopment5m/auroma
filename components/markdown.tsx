"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"

export function Markdown({ content, className }: { content: string; className?: string }) {
  const safeContent = content ?? ""

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-serif font-bold text-foreground mt-6 mb-3">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-serif font-semibold text-foreground mt-5 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">{children}</h3>,
          p: ({ children }) => <p className="text-muted-foreground leading-relaxed">{children}</p>,
          a: ({ children, href }) => (
            <a href={href} className="text-primary underline underline-offset-4 hover:opacity-80">
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="list-disc pl-5 text-muted-foreground space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 text-muted-foreground space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-border pl-4 italic text-muted-foreground">{children}</blockquote>
          ),
          hr: () => <hr className="border-border my-6" />,
          strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
          code: ({ children }) => (
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground">{children}</code>
          ),
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  )
}
