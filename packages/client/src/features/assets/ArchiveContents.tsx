export const ArchiveContents = ({ data = [] }: { data: string[] }) => {
  if (!data.length) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">No archive contents</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <ul className="m-0 list-none overflow-hidden rounded-md border border-border bg-card p-0 text-sm text-foreground">
        <li className="border-b border-border bg-muted/40 px-3.5 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Files Only
        </li>
        {data.map(path => (
          <li
            key={path}
            className="border-b border-border px-3.5 py-2.5 font-mono text-sm text-foreground last:border-b-0"
          >
            {path}
          </li>
        ))}
      </ul>
    </div>
  )
}
