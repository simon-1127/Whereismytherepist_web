import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { postAuthPath, promoteIfRequested } from "../../../../lib/onboarding";

/** Called by the email sign-in/up form once it has a session. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  await promoteIfRequested(user, body?.as === "provider");
  const path = await postAuthPath(supabase, user, typeof body?.next === "string" ? body.next : null);
  return NextResponse.json({ path });
}
