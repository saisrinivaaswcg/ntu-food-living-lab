import { useCrops } from '../../hooks/useCommunity'
import type { SiteBedCrop } from '../../hooks/useSiteBedCrop'
import { cropName } from '../../lib/lookups'
import SelectField from './SelectField'
import SiteSelect from './SiteSelect'


interface Props {
  /** Id prefix, e.g. "harvest" → harvest-site, harvest-bed, harvest-crop */
  prefix: string
  state: SiteBedCrop
  errors: { site?: string; bed?: string; crop?: string }
}

/** Site, then bed (filtered to the site), then crop — the same three fields on every bed-level form. */
export default function SiteBedCropFields({ prefix, state, errors }: Props) {
  const cropOptions = useCrops().map((c) => ({ value: c.id, label: c.name }))
  const bedOptions = (state.site?.beds ?? []).map((bed) => {
    const planting = state.currentByBed.get(bed.id)
    return { value: bed.id, label: planting ? `${bed.label} · ${cropName(planting.cropId)}` : bed.label }
  })

  return (
    <>
      <SiteSelect id={`${prefix}-site`} value={state.siteId} onChange={state.changeSite} error={errors.site} />
      <div className="grid grid-cols-2 gap-3">
        <SelectField
          id={`${prefix}-bed`}
          label="Bed"
          value={state.bedId}
          onChange={state.changeBed}
          options={bedOptions}
          placeholder={state.site ? 'Choose' : 'Site first'}
          disabled={!state.site}
          error={errors.bed}
        />
        <SelectField
          id={`${prefix}-crop`}
          // Said in the label rather than a hint line, so the row doesn't grow on a phone.
          label={state.cropFromBed ? 'Crop (from bed)' : 'Crop'}
          value={state.cropId}
          onChange={state.changeCrop}
          options={cropOptions}
          placeholder="Choose"
          error={errors.crop}
        />
      </div>
    </>
  )
}
