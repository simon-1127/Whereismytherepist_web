import { notFound } from "next/navigation";
import { requireEmployee } from "../../../../lib/gendoc-server";
import { QUEUE_SELECT, type QueueEntry } from "../../../../lib/gendoc";
import QueueStatusLive from "../../../../components/gendoc/QueueStatusLive";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your place in line" };

export default async function MyConsultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, userId } = await requireEmployee(`/company-doctor/consult/${id}`);

  const { data } = await supabase
    .from("gendoc_queue_entries")
    .select(`${QUEUE_SELECT}, gendoc_profiles(full_name, photo_url)`)
    .eq("id", id)
    .maybeSingle();
  const entry = data as unknown as QueueEntry | null;
  if (!entry || entry.client_id !== userId) notFound();

  return (
    <main className="shell flex flex-1 items-start justify-center py-10 md:py-16">
      <QueueStatusLive initialEntry={entry} />
    </main>
  );
}
