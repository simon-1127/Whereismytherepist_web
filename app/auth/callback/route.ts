import { NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const termsAccepted = searchParams.get('terms') === '1'
  const consent = searchParams.get('consent') === '1'
  const phone = searchParams.get('phone')
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin


  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Service-role client: public.users has no client-side UPDATE
        // policy, and every update below is guarded with `.is(..., null)`
        // so it only ever sets its own timestamp once, never overwrites.
        const admin = createAdminClient()

        if (termsAccepted) {
          // Mandatory Terms/Privacy acceptance — the Google button on the
          // signup form is only enabled once this was checked, so a first
          // sign-up via Google implies it was accepted just now.
          await admin
            .from('users')
            .update({ terms_accepted_at: new Date().toISOString() })
            .eq('id', user.id)
            .is('terms_accepted_at', null)
        }

        if (consent) {
          // Optional SMS/WhatsApp/Email consent captured on the signup
          // checkbox before the Google redirect — never required for terms
          // acceptance or account creation.
          const updates: Record<string, string> = { comms_consent_at: new Date().toISOString() }
          if (phone) updates.phone = phone
          await admin
            .from('users')
            .update(updates)
            .eq('id', user.id)
            .is('comms_consent_at', null)
        }

        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'provider') {
          return NextResponse.redirect(`${origin}/provider/dashboard`)
        } else {
          return NextResponse.redirect(`${origin}/therapists`)
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate`)
}