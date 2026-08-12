import { pgTable, serial, text, timestamp, unique } from 'drizzle-orm/pg-core'

export const contacts = pgTable(
  'contacts',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    countryCode: text('country_code').notNull(),
    dialCode: text('dial_code').notNull(),
    phoneNumber: text('phone_number').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniqDialPhone: unique('uniq_dial_phone').on(table.dialCode, table.phoneNumber),
  }),
)
