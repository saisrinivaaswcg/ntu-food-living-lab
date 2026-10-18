import type { LogFormSlug } from '../log/logFormKinds'

/**
 * Small line illustrations for the four log forms, in the same hand-drawn style as PlantSprite:
 * a basket (harvest), a seedling (planting), a watering can (weekly inputs) and a drooping leaf (losses).
 */
export default function FormIllustration({ kind, className = '' }: { kind: LogFormSlug; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {kind === 'harvest' && (
        <>
          <path d="M7 21.5h34l-3.2 15.2c-.4 1.9-2 3.3-4 3.3H14.2c-2 0-3.6-1.4-4-3.3L7 21.5z" fill="currentColor" fillOpacity={0.1} />
          <path d="M14 21.5c0-6.5 4.6-11 10-11s10 4.5 10 11" />
          <path d="M12.5 27.5l23 0M13.8 33.2h20.6" opacity={0.6} />
          <path d="M18 21c-1.6-3.4-.6-6.4 2-8 1 3-.2 5.6-2 8zM27.5 21c.4-3.6 2.8-5.6 5.8-5.6-.4 3-2.6 5-5.8 5.6z" fill="currentColor" fillOpacity={0.15} />
        </>
      )}
      {kind === 'planting' && (
        <>
          <path d="M8 39c5-1.5 11-1.8 16-1.2 5.5.6 11 .5 16-.8" />
          <path d="M24 38.5c-.4-6 .2-11.5 0-17" />
          <path d="M24 26c-1.5-5.5-6.5-8.5-12-7.5 1 5.5 6 8.6 12 7.5z" fill="currentColor" fillOpacity={0.12} />
          <path d="M24 21.5c1.6-5.8 6.6-8.6 12.2-7.4-1.2 5.6-6.4 8.6-12.2 7.4z" fill="currentColor" fillOpacity={0.12} />
          <path d="M16 43c2-.6 4-.7 6-.4M28 43.2c1.8-.3 3.6-.3 5 0" opacity={0.5} />
        </>
      )}
      {kind === 'weekly' && (
        <>
          <path d="M11 20.5h20.5l-1.6 16.4c-.2 1.7-1.6 3.1-3.4 3.1H16c-1.8 0-3.2-1.4-3.4-3.1L11 20.5z" fill="currentColor" fillOpacity={0.1} />
          <path d="M14 20.5c0-4.2 3.2-7 7.2-7s7.3 2.8 7.3 7" />
          <path d="M31 25l8.5-6.5 2 2.6" />
          <path d="M41 23.5c.4 1.6 0 3.4.6 5M43.6 22.4c.6 1.8.2 3.6.9 5.2" opacity={0.6} />
        </>
      )}
      {kind === 'losses' && (
        <>
          <path d="M8 40c5-1.5 11-1.8 16-1.2 5.5.6 11 .5 16-.8" />
          <path d="M22 39.5c.2-7 1.2-12.5 4.8-17.5 2.2-3 5.4-4.6 8.4-4.2" />
          <path d="M35.2 17.8c2.6 3.8 2.4 9.6-1.6 13.4-2.8-4.4-1.6-10 1.6-13.4z" fill="currentColor" fillOpacity={0.12} />
          <path d="M25 29c-4.6-.6-8.6 1.6-10.4 6 4.6.8 8.6-1.4 10.4-6z" fill="currentColor" fillOpacity={0.12} />
          <circle cx={31.5} cy={24.5} r={0.9} fill="currentColor" />
          <circle cx={34} cy={27.2} r={0.7} fill="currentColor" />
        </>
      )}
    </svg>
  )
}
