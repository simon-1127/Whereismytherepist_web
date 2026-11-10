import { notFound } from "next/navigation";
import { requireGenDoc } from "../../../../lib/gendoc-server";
import ConsultCall from "../../../../components/gendoc/ConsultCall";
import { ConsultMessage } from "../../../../components/gendoc/GenDocBits";
import FinishConsultButton from "../../../../components/gendoc/FinishConsultButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Consult" };

/** Doctor side of a consult video call. */
export default async function GenDocConsultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, userId } = await requireGenDoc(`/gendoc/consult/${id}`);

  const { data: entry } = await supabase
    .from("gendoc_queue_entries")
    .select("id, gendoc_id, status, position, reason")
    .eq("id", id)
    .maybeSingle();
  if (!entry || entry.gendoc_id !== userId) notFound();

  if (entry.status !== "waiting" && entry.status !== "in_progress") {
    return <ConsultMessage title="This consult has ended" body="It's no longer in today's queue." backHref="/gendoc" backLabel="Back to queue" />;
  }

  return (
    <ConsultCall
      entryId={id}
      title={entry.reason ? `Consult: ${entry.reason}` : "Consult"}
      backHref="/gendoc"
      backLabel="Back to queue"
      retryHref={`/gendoc/consult/${id}`}
      actions={entry.status === "in_progress" ? <FinishConsultButton entryId={id} /> : null}
    />
  );
}
