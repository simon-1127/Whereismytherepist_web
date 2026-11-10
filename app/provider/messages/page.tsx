import InboxPage from "../../../components/messages/InboxPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages" };

export default function ProviderMessagesPage() {
  return <InboxPage perspective="provider" />;
}
