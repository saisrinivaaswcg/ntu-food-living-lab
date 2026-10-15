import { ClipboardList, Scale, Sprout, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { ComponentType } from 'react'
import FailureForm from './FailureForm'
import HarvestForm from './HarvestForm'
import PlantingForm from './PlantingForm'
import WeeklyInputForm from './WeeklyInputForm'

export type LogFormSlug = 'harvest' | 'planting' | 'weekly' | 'failure'

export interface LogFormKind {
  slug: LogFormSlug
  /** Breadcrumb and card title */
  title: string
  description: string
  icon: LucideIcon
  Form: ComponentType
}

/** The four forms, in the order the Log page offers them. URL: /log/:slug */
export const logFormKinds: LogFormKind[] = [
  {
    slug: 'harvest',
    title: 'Harvest',
    description: 'Weight, where it went, time taken and a photo. Under a minute.',
    icon: Scale,
    Form: HarvestForm,
  },
  {
    slug: 'planting',
    title: 'Planting',
    description: 'What went into which bed, how many and how it was propagated.',
    icon: Sprout,
    Form: PlantingForm,
  },
  {
    slug: 'weekly',
    title: 'Weekly inputs',
    description: 'Water, compost and maintenance hours for the week. Once per site per week.',
    icon: ClipboardList,
    Form: WeeklyInputForm,
  },
  {
    slug: 'failure',
    title: 'Failure',
    description: 'Plants lost to pests, disease or drought, so the next committee knows.',
    icon: TriangleAlert,
    Form: FailureForm,
  },
]

export function findLogFormKind(slug: string | undefined): LogFormKind | undefined {
  return logFormKinds.find((k) => k.slug === slug)
}
