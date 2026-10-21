import qrcode from 'qrcode-generator'
import { useMemo } from 'react'

interface Props {
  value: string
  /** Accessible name, e.g. "QR code for Planter box A" */
  label: string
  className?: string
}

/** A QR code drawn as one SVG path (crisp when printed). Error correction M survives a little mud. */
export default function QrCode({ value, label, className = 'size-32' }: Props) {
  const { d, size } = useMemo(() => {
    const qr = qrcode(0, 'M')
    qr.addData(value)
    qr.make()
    const n = qr.getModuleCount()
    let path = ''
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) path += `M${c + 2} ${r + 2}h1v1h-1z`
    return { d: path, size: n + 4 }
  }, [value])
  return (
    <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} className={className} shapeRendering="crispEdges">
      <rect width={size} height={size} fill="#fff" />
      <path d={d} fill="#000" />
    </svg>
  )
}
