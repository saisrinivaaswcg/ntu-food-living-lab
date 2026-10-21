import type { ComponentType } from 'react'
import { logImages, type ImageSlot } from '../../data'
import HarvestForm from './HarvestForm'
import LossForm from './LossForm'
import PlantingForm from './PlantingForm'
import WeeklyInputForm from './WeeklyInputForm'

export type LogFormSlug = 'harvest' | 'planting' | 'weekly' | 'losses'

export interface LogFormKind {
  slug: LogFormSlug
  /** Breadcrumb and card title */
  title: string
  description: string
  /** Photo shown on the Log page for this form */
  image: ImageSlot
  Form: ComponentType
}

/** The four forms, in the order the Log page offers them. URL: /workspace/log/:slug */
export const logFormKinds: LogFormKind[] = [
  {
    slug: 'harvest',
    title: 'Harvest',
    description: 'Weight, where it went, time taken and a photo. Under a minute.',
    image: logImages.harvest,
    Form: HarvestForm,
  },
  {
    slug: 'planting',
    title: 'Planting',
    description: 'What went into which bed, how many and how it was propagated.',
    image: logImages.planting,
    Form: PlantingForm,
  },
  {
    slug: 'weekly',
    title: 'Weekly inputs',
    description: 'Water, compost and maintenance hours for the week. Once per site per week.',
    image: logImages.weekly,
    Form: WeeklyInputForm,
  },
  {
    slug: 'losses',
    title: 'Plant losses',
    description: 'How many plants a bed lost to pests, disease or drought, and any that recovered.',
    image: logImages.losses,
    Form: LossForm,
  },
]

export function findLogFormKind(slug: string | undefined): LogFormKind | undefined {
  return logFormKinds.find((k) => k.slug === slug)
}
