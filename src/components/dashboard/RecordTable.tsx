import { useState } from 'react'
import SortableTable, { type Column } from '../ui/SortableTable'

interface Props<T> {
  caption: string
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  initialSort: { key: string; direction: 'asc' | 'desc' }
  /** Rows shown before "Show all" */
  limit?: number
  noun: string
}

/** A sortable table that shows the first rows and expands on request. Sorting applies to every row. */
export default function RecordTable<T>({ caption, columns, rows, rowKey, initialSort, limit = 15, noun }: Props<T>) {
  const [all, setAll] = useState(false)
  return (
    <div>
      <SortableTable
        caption={caption}
        columns={columns}
        rows={rows}
        rowKey={rowKey}
        initialSort={initialSort}
        limit={all ? undefined : limit}
      />
      {rows.length > limit && (
        <button
          type="button"
          onClick={() => setAll((v) => !v)}
          aria-expanded={all}
          className="mt-4 min-h-12 rounded-sm border border-line-strong px-4 font-semibold transition-colors hover:bg-sunken"
        >
          {all ? `Show the first ${limit}` : `Show all ${rows.length} ${noun}`}
        </button>
      )}
    </div>
  )
}
