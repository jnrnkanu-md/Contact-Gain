import { ContactCollector } from '@/components/contact-collector'
import { ShareLink } from '@/components/share-link'
import { WhatsAppCommunityBadge, WhatsAppIcon } from '@/components/whatsapp-badge'
import { getContactCount } from '@/app/actions/contacts'
import { WHATSAPP_COMMUNITY_URL } from '@/lib/config'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const count = await getContactCount()

  return (
    <main className="flex min-h-dvh flex-col items-center px-4 py-10 sm:py-14">
      <header className="mb-8 flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <WhatsAppIcon className="size-8" />
        </div>
        <h1 className="text-balance font-heading text-3xl font-bold tracking-tight text-foreground">
          Join Our Community
        </h1>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          Add your name and number below to get added to our WhatsApp community.
          Spots are limited to the first 1,000 people.
        </p>
      </header>

      <ContactCollector initialCount={count} />
      <ShareLink />

      <p className="mt-8 text-xs text-muted-foreground">Built for connecting people.</p>

      <WhatsAppCommunityBadge href={WHATSAPP_COMMUNITY_URL} />
    </main>
  )
}
