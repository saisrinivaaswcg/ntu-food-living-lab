interface Props {
  caption: string
  headers: [string, string]
  rows: [label: string, value: string][]
}

/** The table view behind a chart: every value, no hovering needed. */
export default function SeriesTable({ caption, headers, rows }: Props) {
  return (
    <div className="max-h-72 overflow-y-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 bg-surface">
          <tr className="border-b border-line text-ink-muted">
            <th scope="col" className="py-2 text-left font-medium">
              {headers[0]}
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              {headers[1]}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-line last:border-0">
              <th scope="row" className="py-2 text-left font-normal">
                {label}
              </th>
              <td className="py-2 text-right tabular-nums">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
