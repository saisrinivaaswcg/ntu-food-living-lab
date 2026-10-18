import { compostOptions, crops, destinationOptions, failureCauseOptions, propagationOptions } from '../../data'
import type { LogKind } from '../../types'

/** One editable field of a log record, for the Edit entry dialog. */
export type EditField =
  | { key: string; label: string; type: 'date' }
  | { key: string; label: string; type: 'week' }
  | { key: string; label: string; type: 'site' }
  | { key: string; label: string; type: 'bed' }
  | { key: string; label: string; type: 'select'; options: { value: string; label: string }[] }
  | { key: string; label: string; type: 'choice'; options: { value: string; label: string }[] }
  | {
      key: string
      label: string
      type: 'number'
      unit: string
      max: number
      whole?: boolean
      allowZero?: boolean
      /** Empty is allowed and saved as "not set" */
      optional?: boolean
    }
  | { key: string; label: string; type: 'text'; optional?: boolean }

const cropOptions = crops.map((c) => ({ value: c.id, label: c.name }))

/** The fields each record type can be edited on, in form order. Photos stay as they are. */
export const EDIT_FIELDS: Record<LogKind, EditField[]> = {
  harvests: [
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'siteId', label: 'Site', type: 'site' },
    { key: 'bedId', label: 'Bed', type: 'bed' },
    { key: 'cropId', label: 'Crop', type: 'select', options: cropOptions },
    { key: 'weightKg', label: 'Weight', type: 'number', unit: 'kg', max: 50 },
    { key: 'destination', label: 'Went to', type: 'choice', options: destinationOptions },
    { key: 'labourHours', label: 'Labour hours', type: 'number', unit: 'h', max: 24 },
    { key: 'notes', label: 'Notes', type: 'text', optional: true },
  ],
  plantings: [
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'siteId', label: 'Site', type: 'site' },
    { key: 'bedId', label: 'Bed', type: 'bed' },
    { key: 'cropId', label: 'Crop', type: 'select', options: cropOptions },
    { key: 'quantity', label: 'Quantity', type: 'number', unit: 'plants', max: 5000, whole: true },
    { key: 'propagation', label: 'Propagation', type: 'choice', options: propagationOptions },
    { key: 'notes', label: 'Notes', type: 'text', optional: true },
  ],
  weeklyInputs: [
    { key: 'weekStart', label: 'Week (any day; saved as its Monday)', type: 'week' },
    { key: 'siteId', label: 'Site', type: 'site' },
    { key: 'waterLitres', label: 'Water', type: 'number', unit: 'L', max: 20000, allowZero: true },
    { key: 'compostType', label: 'Compost', type: 'select', options: compostOptions },
    { key: 'compostKg', label: 'Compost amount', type: 'number', unit: 'kg', max: 1000, allowZero: true },
    { key: 'labourHours', label: 'Maintenance hours', type: 'number', unit: 'h', max: 500, allowZero: true },
    { key: 'notes', label: 'Notes', type: 'text', optional: true },
  ],
  failures: [
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'siteId', label: 'Site', type: 'site' },
    { key: 'bedId', label: 'Bed', type: 'bed' },
    { key: 'cropId', label: 'Crop', type: 'select', options: cropOptions },
    { key: 'cause', label: 'Cause', type: 'choice', options: failureCauseOptions },
    { key: 'estimatedLossPlants', label: 'Plants lost', type: 'number', unit: 'plants', max: 5000, whole: true },
    {
      key: 'plantsInBed',
      label: 'Out of (in the bed)',
      type: 'number',
      unit: 'plants',
      max: 5000,
      whole: true,
      optional: true,
    },
    {
      key: 'recoveredPlants',
      label: 'Recovered later',
      type: 'number',
      unit: 'plants',
      max: 5000,
      whole: true,
      allowZero: true,
      optional: true,
    },
    { key: 'description', label: 'Description', type: 'text' },
  ],
}
