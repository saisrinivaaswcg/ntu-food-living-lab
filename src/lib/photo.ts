/**
 * Browser-side photo compression. localStorage holds about 5 MB, and a phone photo
 * is 3–8 MB, so every upload is shrunk to ~1024px JPEG (typically 80–200 KB) first.
 */

const MAX_SIDE = 1024
const JPEG_QUALITY = 0.7

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not read that image.'))
    img.src = src
  })
}

/** Returns a compressed JPEG data URL. Browsers apply EXIF rotation when drawing, so phone photos stay upright. */
export async function compressPhoto(file: File): Promise<string> {
  if (file.type && !file.type.startsWith('image/')) {
    throw new Error('That file is not an image.')
  }
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('This browser cannot process photos.')
    // JPEG has no transparency: paint white first so transparent PNGs don't turn black.
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Approximate decoded size of a base64 data URL, in bytes. */
export function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  return Math.round((base64.length * 3) / 4)
}
