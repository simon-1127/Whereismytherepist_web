import ThreadPage from "../../../../components/messages/ThreadPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages" };

export default async function ProviderMessageThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ThreadPage perspective="provider" id={id} />;
}
