import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'

export interface Column<T> {
  key: string
  label: string
  /** Value used for sorting; null always sorts last. */
  sortValue: (row: T) => number | string | null
  render: (row: T) => ReactNode
  numeric?: boolean
}

interface Props<T> {
  caption: string
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  initialSort: { key: string; direction: 'asc' | 'desc' }
  /** Show only the first rows after sorting */
  limit?: number
}

/** Table sortable by any column. Header buttons announce the sort order via aria-sort. */
export default function SortableTable<T>({ caption, columns, rows, rowKey, initialSort, limit }: Props<T>) {
  const [sort, setSort] = useState(initialSort)
  const column = columns.find((c) => c.key === sort.key) ?? columns[0]

  const sorted = [...rows].sort((a, b) => {
    const va = column.sortValue(a)
    const vb = column.sortValue(b)
    if (va === null || vb === null) return va === vb ? 0 : va === null ? 1 : -1
    const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb))
    return sort.direction === 'asc' ? cmp : -cmp
  })

  const toggle = (key: string, numeric?: boolean) =>
    setSort((s) =>
      s.key === key
        ? { key, direction: s.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: numeric ? 'desc' : 'asc' },
    )

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem]">
        <caption className="sr-only">{caption}, sortable by any column</caption>
        <thead>
          <tr className="border-b border-ink text-left text-sm text-ink-muted">
            {columns.map((c) => {
              const active = c.key === sort.key
              const Icon = !active ? ArrowUpDown : sort.direction === 'asc' ? ArrowUp : ArrowDown
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  className={`p-0 font-medium ${c.numeric ? 'text-right' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(c.key, c.numeric)}
                    className={`inline-flex min-h-12 w-full items-center gap-1 px-3 hover:text-ink ${
                      c.numeric ? 'justify-end' : ''
                    } ${active ? 'text-ink' : ''}`}
                  >
                    {c.label}
                    <Icon className={`size-3.5 shrink-0 ${active ? '' : 'opacity-40'}`} aria-hidden />
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {(limit === undefined ? sorted : sorted.slice(0, limit)).map((row) => (
            <tr key={rowKey(row)} className="border-b border-line last:border-0">
              {columns.map((c, i) => {
                const Cell = i === 0 ? 'th' : 'td'
                return (
                  <Cell
                    key={c.key}
                    scope={i === 0 ? 'row' : undefined}
                    className={`px-3 py-3 ${i === 0 ? 'text-left font-semibold' : ''} ${c.numeric ? 'text-right tabular-nums' : ''}`}
                  >
                    {c.render(row)}
                  </Cell>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
