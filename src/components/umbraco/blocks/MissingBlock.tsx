interface MissingBlockProps {
  alias: string;
  content?: unknown;
}

export default function MissingBlock({ alias, content }: MissingBlockProps) {
  if (import.meta.env.PROD) return null;
  return (
    <div className="my-4 rounded-md border border-dashed border-destructive/60 bg-destructive/5 p-4 text-sm">
      <p className="font-medium text-destructive">
        Missing block: <code className="font-mono">{alias}</code>
      </p>
      {content !== undefined && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-muted-foreground">
            Show payload
          </summary>
          <pre className="mt-2 max-h-64 overflow-auto rounded bg-muted p-2 text-xs">
            {JSON.stringify(content, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
