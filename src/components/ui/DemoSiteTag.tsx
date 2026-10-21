/** Marks an invented demo site (not a real NTU garden) wherever its status shows. */
export default function DemoSiteTag({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className={`ml-2 inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold ${onDark ? 'bg-demo-bg/90 text-demo' : 'bg-demo-bg text-demo'}`}>
      Demo hall site
    </span>
  )
}
