import { NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
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