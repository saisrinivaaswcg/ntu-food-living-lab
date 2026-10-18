/** CSV exports of the raw logs. Photos are not exported, only whether one exists. */
import type { HarvestLog, PlantingLog } from '../types'
import { cropName, siteName } from './lookups'

const HEADER = ['id', 'date', 'site', 'bed', 'crop', 'weight_kg', 'destination', 'labour_hours', 'has_photo', 'notes', 'source']

function cell(value: string | number | boolean): string {
  let text = String(value)
  // Stop spreadsheets from running a note that starts with = + - @ as a formula.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function harvestsToCsv(harvests: HarvestLog[]): string {
  const rows = [...harvests]
    .sort((a, b) => (a.date !== b.date ? (a.date < b.date ? -1 : 1) : a.createdAt < b.createdAt ? -1 : 1))
    .map((h) =>
      [
        h.id,
        h.date,
        siteName(h.siteId),
        h.bedId,
        cropName(h.cropId),
        h.weightKg,
        h.destination,
        h.labourHours,
        h.photo.kind === 'upload', // demo records only have a placeholder, not a photo
        h.notes ?? '',
        h.source,
      ]
        .map(cell)
        .join(','),
    )
  // CRLF + byte-order mark so Excel opens it as UTF-8 with the right line breaks.
  return '﻿' + [HEADER.join(','), ...rows].join('\r\n') + '\r\n'
}

const PLANTING_HEADER = ['id', 'date', 'site', 'bed', 'crop', 'quantity', 'propagation', 'notes', 'source']

export function plantingsToCsv(plantings: PlantingLog[]): string {
  const rows = [...plantings]
    .sort((a, b) => (a.date !== b.date ? (a.date < b.date ? -1 : 1) : a.createdAt < b.createdAt ? -1 : 1))
    .map((p) =>
      [p.id, p.date, siteName(p.siteId), p.bedId, cropName(p.cropId), p.quantity, p.propagation, p.notes ?? '', p.source]
        .map(cell)
        .join(','),
    )
  return '\uFEFF' + [PLANTING_HEADER.join(','), ...rows].join('\r\n') + '\r\n'
}

export function downloadText(fileName: string, text: string, type = 'text/csv;charset=utf-8'): void {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.append(a)
  a.click()
  a.remove()
  // Give the browser a moment to start the download before releasing the blob.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
