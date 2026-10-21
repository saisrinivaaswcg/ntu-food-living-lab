/**
 * NTU halls of residence: the controlled list for a student's hall and a hall site's team.
 * "Campus" sites (not run by a hall) don't take part in the Hall Garden Cup.
 */
export const halls: string[] = [
  ...Array.from({ length: 16 }, (_, i) => `Hall ${i + 1}`),
  'Banyan Hall',
  'Binjai Hall',
  'Crescent Hall',
  'Pioneer Hall',
  'Saraca Hall',
  'Tamarind Hall',
  'Graduate Hall 1',
  'Graduate Hall 2',
]

/** For a student who doesn't live in a hall. */
export const NO_HALL = 'Not in a hall'

/** The "hall" of a site that isn't run by a hall. */
export const CAMPUS = 'Campus'
