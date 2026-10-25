import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { checkPhysioInput } from "../../../lib/physio";
import { clientIp, rateLimited } from "../../../lib/rate-limit";

/**
 * Home-physiotherapy waitlist. Open to everyone; the only writer of
 * physio_waitlist (service role) — see backend migration 007 for the model.
 *   signed in  → one row per account, resubmitting updates it
 *   signed out → insert-only; a repeat for the same contact is ignored, never
 *                overwritten, and answers exactly like a fresh join so the
 *                response can't be used to check who is on the list.
 */
export async function POST(request: Request) {
  const raw = await request.json().catch(() => ({}));
  // Bots fill every field; people never see this one.
  if (typeof raw?.company === "string" && raw.company.trim()) return NextResponse.json({ ok: true, signedIn: false });

  const { input, error } = checkPhysioInput(raw);
  if (!input) return NextResponse.json({ error }, { status: 400 });

  if (rateLimited(`physio:${clientIp(request)}`)) {
    return NextResponse.json({ error: "Too many tries from this connection. Please wait a few minutes." }, { status: 429 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = new Date().toISOString();
  const admin = createAdminClient();
  const { error: dbError } = user
    ? await admin
        .from("physio_waitlist")
        .upsert({ user_id: user.id, ...input, contact_consent_at: now, updated_at: now }, { onConflict: "user_id" })
    : await admin.from("physio_waitlist").insert({ user_id: null, ...input, contact_consent_at: now });

  // 23505 = this contact is already on the list anonymously: keep the original.
  if (dbError && dbError.code !== "23505") {
    console.error("physio waitlist save failed:", dbError.message);
    return NextResponse.json({ error: "We couldn't save your response. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, signedIn: !!user });
}
