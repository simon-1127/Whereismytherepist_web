import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { createAdminClient } from "../../../../lib/supabase/admin";

/** Saves the signed-in person's optional phone number (E.164) on users.phone. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { phone } = await request.json().catch(() => ({}));
  if (typeof phone !== "string" || !/^\+\d{8,15}$/.test(phone)) {
    return NextResponse.json({ error: "That phone number doesn't look right." }, { status: 400 });
  }
  const { error } = await createAdminClient().from("users").update({ phone }).eq("id", user.id);
  if (error) {
    console.error("save phone failed:", error.message);
    return NextResponse.json({ error: "Couldn't save your phone number. You can add it later." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
