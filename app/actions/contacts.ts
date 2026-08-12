'use server'

import { db } from '@/lib/db'
import { contacts } from '@/lib/db/schema'
import { MAX_CONTACTS } from '@/lib/config'
import { and, eq, sql } from 'drizzle-orm'

const DOWNLOAD_PASSWORD = '953200'

export async function getContactCount(): Promise<number> {
  const rows = await db.select({ count: sql<number>`count(*)::int` }).from(contacts)
  return rows[0]?.count ?? 0
}

type AddResult =
  | { ok: true; count: number }
  | { ok: false; error: string; count: number }

export async function addContact(input: {
  name: string
  dialCode: string
  countryCode: string
  phoneNumber: string
}): Promise<AddResult> {
  const name = input.name?.trim()
  const dialCode = input.dialCode?.trim()
  const countryCode = input.countryCode?.trim()
  // digits only
  const phoneNumber = (input.phoneNumber ?? '').replace(/\D/g, '')

  const count = await getContactCount()

  if (!name) return { ok: false, error: 'Please enter a name.', count }
  if (!dialCode || !countryCode)
    return { ok: false, error: 'Please select a country code.', count }
  if (!phoneNumber) return { ok: false, error: 'Please enter a valid phone number.', count }
  if (phoneNumber.length < 4)
    return { ok: false, error: 'Phone number is too short.', count }

  if (count >= MAX_CONTACTS) {
    return {
      ok: false,
      error: `The limit of ${MAX_CONTACTS} contacts has been reached. Uploads are now closed.`,
      count,
    }
  }

  // Reject the same number with the same country code twice.
  const existing = await db
    .select({ id: contacts.id })
    .from(contacts)
    .where(and(eq(contacts.dialCode, dialCode), eq(contacts.phoneNumber, phoneNumber)))
    .limit(1)

  if (existing.length > 0) {
    return { ok: false, error: 'This number has already been submitted.', count }
  }

  try {
    await db.insert(contacts).values({ name, dialCode, countryCode, phoneNumber })
  } catch {
    // Unique constraint fallback (race condition)
    const newCount = await getContactCount()
    return { ok: false, error: 'This number has already been submitted.', count: newCount }
  }

  const newCount = await getContactCount()
  return { ok: true, count: newCount }
}

type VcfResult = { ok: true; vcf: string; total: number } | { ok: false; error: string }

export async function downloadVcf(password: string): Promise<VcfResult> {
  if (password !== DOWNLOAD_PASSWORD) {
    return { ok: false, error: 'Incorrect password.' }
  }

  const rows = await db
    .select()
    .from(contacts)
    .orderBy(contacts.createdAt)

  if (rows.length === 0) {
    return { ok: false, error: 'There are no contacts to download yet.' }
  }

  const vcf = rows
    .map((c) => {
      const fullNumber = `${c.dialCode}${c.phoneNumber}`
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${escapeVcf(c.name)}`,
        `N:${escapeVcf(c.name)};;;;`,
        `TEL;TYPE=CELL:${fullNumber}`,
        'END:VCARD',
      ].join('\r\n')
    })
    .join('\r\n')

  return { ok: true, vcf, total: rows.length }
}

function escapeVcf(value: string): string {
  return value.replace(/([\\,;])/g, '\\$1').replace(/\n/g, '\\n')
}
