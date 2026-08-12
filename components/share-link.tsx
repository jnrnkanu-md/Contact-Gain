'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Link2, Copy, Check } from 'lucide-react'

export function ShareLink() {
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setUrl(window.location.origin + window.location.pathname)
  }, [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="mt-4 w-full max-w-md rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <Link2 className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm font-medium text-foreground">Public link</span>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          {url || 'Loading…'}
        </code>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copy}
          className="shrink-0 rounded-lg"
          aria-label="Copy public link"
        >
          {copied ? (
            <Check className="size-4 text-primary" aria-hidden="true" />
          ) : (
            <Copy className="size-4" aria-hidden="true" />
          )}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Share this link so anyone can add their contact.
      </p>
    </div>
  )
}
