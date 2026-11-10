import { notFound } from "next/navigation";
import { requireEmployee } from "../../../../../lib/gendoc-server";
import ConsultCall from "../../../../../components/gendoc/ConsultCall";
import { ConsultMessage } from "../../../../../components/gendoc/GenDocBits";

export const dynamic = "force-dynamic";
export const metadata = { title: "Video consult" };

/** Employee side of a consult call: open only once the doctor has started it. */
export default async function EmployeeConsultRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, userId } = await requireEmployee(`/company-doctor/consult/${id}/room`);

  const { data: entry } = await supabase
    .from("gendoc_queue_entries")
    .select("id, client_id, status, gendoc_profiles(full_name)")
    .eq("id", id)
    .maybeSingle();
  if (!entry || entry.client_id !== userId) notFound();

  const back = `/company-doctor/consult/${id}`;
  if (entry.status !== "in_progress") {
    return (
      <ConsultMessage
        title={entry.status === "waiting" ? "The doctor hasn't started yet" : "This consult has ended"}
        body={entry.status === "waiting" ? "Wait on your queue page. A Join video button appears there the moment your consult starts." : "It's no longer open."}
        backHref={back}
        backLabel="Back to my place"
      />
    );
  }

  const doc = (entry.gendoc_profiles as unknown as { full_name?: string } | null)?.full_name;
  return (
    <ConsultCall
      entryId={id}
      title={`Consult with ${doc || "your company doctor"}`}
      backHref={back}
      backLabel="Back to my place"
      retryHref={`${back}/room`}
    />
  );
}
