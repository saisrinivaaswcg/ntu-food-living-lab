/** A plant seen from above, in the same line style: a small leaf rosette. Size and colour come from the parent. */
export default function PlantTopView({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" fillOpacity={0.18} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 10c-1.6-2.4-1.4-5.6 0-7.6 1.4 2 1.6 5.2 0 7.6z" />
      <path d="M10 10c2.4-1.6 5.6-1.4 7.6 0-2 1.4-5.2 1.6-7.6 0z" />
      <path d="M10 10c1.6 2.4 1.4 5.6 0 7.6-1.4-2-1.6-5.2 0-7.6z" />
      <path d="M10 10c-2.4 1.6-5.6 1.4-7.6 0 2-1.4 5.2-1.6 7.6 0z" />
      <circle cx={10} cy={10} r={1.2} fillOpacity={1} />
    </svg>
  )
}
