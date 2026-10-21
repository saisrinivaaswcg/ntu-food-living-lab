import type { ContactMethod, StudentProfile } from '../types'

/**
 * DEMO LOGIN — not security. Anyone can switch roles; the PINs are printed on the login cards and
 * pre-filled. A committee's PIN changes when its handover wizard hands over a new one (on this device).
 */
export const DEMO_LOGIN_NOTICE = 'Demo login: anyone can switch roles. No real security.'

export const DEMO_COMMITTEE_PIN = '2468'
export const DEMO_ADMIN_PIN = '1357'

/** The ready-made student, for trying the Student role without joining anything. */
export const DEMO_STUDENT: StudentProfile = {
  name: 'Mei Tan',
  hall: 'Hall 12',
  contactMethod: 'telegram',
  contact: '@meitan.demo',
  consent: true,
  createdAt: '2026-08-12T10:00:00+08:00',
  source: 'demo',
}

export const ADMIN_TEAM = 'NTU Sustainability Office'

export const contactMethodOptions: { value: ContactMethod; label: string; placeholder: string; inputMode: 'email' | 'text' | 'tel' }[] = [
  { value: 'email', label: 'Email', placeholder: 'name@e.ntu.edu.sg', inputMode: 'email' },
  { value: 'telegram', label: 'Telegram', placeholder: '@handle', inputMode: 'text' },
  { value: 'phone', label: 'Phone', placeholder: '8123 4567', inputMode: 'tel' },
]
