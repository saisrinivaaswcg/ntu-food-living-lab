import { Camera, LoaderCircle, Trash2 } from 'lucide-react'
import { useState, type ChangeEvent } from 'react'
import { compressPhoto, dataUrlBytes } from '../../lib/photo'
import type { PhotoRef } from '../../types'

export type UploadedPhoto = Extract<PhotoRef, { kind: 'upload' }>

interface Props {
  id: string
  value: UploadedPhoto | null
  onChange: (photo: UploadedPhoto | null) => void
  required?: boolean
  error?: string
}

/** One big "Take photo" button that opens the rear camera on phones. Compresses before storing. */
export default function PhotoField({ id, value, onChange, required, error }: Props) {
  const [busy, setBusy] = useState(false)
  const [readError, setReadError] = useState<string | null>(null)
  const shownError = readError ?? error

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const file = input.files?.[0]
    // Clear so picking the same file again still fires a change.
    input.value = ''
    if (!file) return
    setBusy(true)
    setReadError(null)
    try {
      const dataUrl = await compressPhoto(file)
      onChange({ kind: 'upload', dataUrl, fileName: file.name || 'photo.jpg' })
    } catch (err) {
      setReadError(err instanceof Error ? `${err.message} Try another photo.` : 'Could not use that photo. Try another.')
    } finally {
      setBusy(false)
    }
  }

  const buttonText = busy ? 'Processing photo…' : value ? 'Retake' : 'Take photo'

  return (
    <div>
      <input
        id={id}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        disabled={busy}
        aria-invalid={shownError ? true : undefined}
        aria-describedby={shownError ? `${id}-error` : undefined}
        className="peer sr-only"
      />
      {value ? (
        <div className="flex items-center gap-3 rounded-sm bg-sunken p-1">
          <img src={value.dataUrl} alt="Preview of the photo you took" className="size-12 shrink-0 rounded-sm object-cover" />
          <p className="min-w-0 flex-1 truncate text-sm">
            <span className="block font-semibold text-ink">Photo added</span>
            <span className="text-xs text-ink-muted">{Math.round(dataUrlBytes(value.dataUrl) / 1024)} KB, compressed</span>
          </p>
          <label
            htmlFor={id}
            className="flex min-h-12 cursor-pointer items-center rounded-sm px-3 text-sm font-semibold text-ink underline underline-offset-4 hover:bg-surface"
          >
            {buttonText}
          </label>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove photo"
            className="flex size-12 shrink-0 items-center justify-center rounded-sm text-ink-muted hover:bg-surface hover:text-danger"
          >
            <Trash2 className="size-5" aria-hidden />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className={`flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-sm border-2 border-dashed px-4 font-semibold transition-[background-color,border-color,transform] duration-150 active:scale-[0.99] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus motion-reduce:active:scale-100 ${
            shownError
              ? 'border-danger/60 bg-danger-bg text-danger'
              : 'border-line-strong bg-surface text-ink hover:border-ink hover:bg-sunken'
          }`}
        >
          {busy ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Camera className="size-5" aria-hidden />}
          {buttonText}
          {!busy && <span className="font-normal text-ink-muted">{required ? '(required)' : '(optional)'}</span>}
        </label>
      )}
      {shownError && (
        <p id={`${id}-error`} className="mt-1 text-sm font-medium text-danger">
          {shownError}
        </p>
      )}
    </div>
  )
}
