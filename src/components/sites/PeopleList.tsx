import type { Person } from '../../types'

/** Names, roles and contacts. Empty lists say so instead of rendering nothing. */
export default function PeopleList({ people, emptyText }: { people: Person[]; emptyText: string }) {
  if (people.length === 0) return <p className="text-sm text-ink-muted">{emptyText}</p>
  return (
    <ul className="space-y-2">
      {people.map((p) => (
        <li key={`${p.name}-${p.role}`} className="text-sm">
          <span className="font-semibold">{p.name}</span>
          <span className="text-ink-muted"> · {p.role}</span>
          <a
            href={`mailto:${p.contact}`}
            className="block w-fit break-all py-1 text-brand-800 underline underline-offset-2 hover:text-brand-900"
          >
            {p.contact}
          </a>
        </li>
      ))}
    </ul>
  )
}
