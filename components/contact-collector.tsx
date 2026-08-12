'use client'

import { useState, useTransition } from 'react'
import { CountrySelect } from '@/components/country-select'
import { countries, type Country } from '@/lib/countries'
import { addContact, downloadVcf } from '@/app/actions/contacts'
import { MAX_CONTACTS } from '@/lib/config'
import { Button } from '@/components/ui/button'
import { Loader2, UserPlus, Download, Lock, CheckCircle2, AlertCircle } from 'lucide-react'

const defaultCountry = countries.find((c) => c.code === 'NG') ?? countries[0]

type Feedback = { type: 'success' | 'error'; message: string } | null

export function ContactCollector({ initialCount }: { initialCount: number }) {
  const [name, setName] = useState('')
  const [country, setCountry] = useState<Country>(defaultCountry)
  const [phone, setPhone] = useState('')
  const [count, setCount] = useState(initialCount)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [pending, startTransition] = useTransition()

  const [password, setPassword] = useState('')
  const [dlFeedback, setDlFeedback] = useState<Feedback>(null)
  const [dlPending, startDlTransition] = useTransition()

  const full = count >= MAX_CONTACTS
  const remaining = Math.max(0, MAX_CONTACTS - count)
  const percent = Math.min(100, Math.round((count / MAX_CONTACTS) * 100))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFeedback(null)
    startTransition(async () => {
      const res = await addContact({
        name,
        dialCode: country.dial,
        countryCode: country.code,
        phoneNumber: phone,
      })
      setCount(res.count)
      if (res.ok) {
        setFeedback({ type: 'success', message: `You're in! Thanks, ${name.trim()}.` })
        setName('')
        setPhone('')
      } else {
        setFeedback({ type: 'error', message: res.error })
      }
    })
  }

  function handleDownload(e: React.FormEvent) {
    e.preventDefault()
    setDlFeedback(null)
    startDlTransition(async () => {
      const res = await downloadVcf(password)
      if (!res.ok) {
        setDlFeedback({ type: 'error', message: res.error })
        return
      }
      const blob = new Blob([res.vcf], { type: 'text/vcard;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `contacts-${new Date().toISOString().slice(0, 10)}.vcf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setDlFeedback({ type: 'success', message: `Downloaded ${res.total} contact(s).` })
      setPassword('')
    })
  }

  return (
    <div className="w-full max-w-md">
      {/* Progress / capacity */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm font-medium text-muted-foreground">Community spots</span>
          <span className="font-heading text-sm font-semibold tabular-nums text-foreground">
            {count} / {MAX_CONTACTS}
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={count}
          aria-valuemin={0}
          aria-valuemax={MAX_CONTACTS}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {full ? 'Registration is closed — the limit has been reached.' : `${remaining} spots remaining`}
        </p>
      </div>

      {/* Sign-up card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <h2 className="font-heading text-lg font-semibold text-foreground">Add your contact</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your details to join. Each number can only be added once.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
              Full name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              disabled={full || pending}
              className="h-12 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">
              Phone number
            </label>
            <div className="flex">
              <CountrySelect value={country} onChange={setCountry} />
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="8012345678"
                disabled={full || pending}
                className="h-12 w-full rounded-r-xl border border-input bg-card px-3 text-sm tabular-nums text-foreground outline-none transition-colors focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {feedback && (
          <div
            className={`mt-4 flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
              feedback.type === 'success'
                ? 'bg-primary/10 text-foreground'
                : 'bg-destructive/10 text-destructive'
            }`}
            role="status"
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            ) : (
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={full || pending}
          className="mt-5 h-12 w-full rounded-xl text-sm font-semibold"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <UserPlus className="size-4" aria-hidden="true" />
          )}
          {full ? 'Registration closed' : 'Submit'}
        </Button>
      </form>

      {/* Download card */}
      <form
        onSubmit={handleDownload}
        className="mt-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Lock className="size-4 text-muted-foreground" aria-hidden="true" />
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Download contacts
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the password to export all contacts as a .vcf file.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Download password"
            disabled={dlPending}
            className="h-12 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <Button
            type="submit"
            variant="secondary"
            disabled={dlPending}
            className="h-12 shrink-0 rounded-xl text-sm font-semibold"
          >
            {dlPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="size-4" aria-hidden="true" />
            )}
            Download
          </Button>
        </div>

        {dlFeedback && (
          <div
            className={`mt-3 flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
              dlFeedback.type === 'success'
                ? 'bg-primary/10 text-foreground'
                : 'bg-destructive/10 text-destructive'
            }`}
            role="status"
          >
            {dlFeedback.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            ) : (
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            )}
            <span>{dlFeedback.message}</span>
          </div>
        )}
      </form>
    </div>
  )
}
