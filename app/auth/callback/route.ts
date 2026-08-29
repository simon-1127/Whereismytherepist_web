import { NextResponse } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 1. Get the newly logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 2. Check their role in the database[cite: 1]
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        // 3. Route them to their specific dashboard
        if (profile?.role === 'provider') {
          return NextResponse.redirect(`${origin}/provider/dashboard`)
        } else {
          return NextResponse.redirect(`${origin}/therapists`)
        }
      }
    }
  }

  // If something fails, send them back to login
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate`)
}