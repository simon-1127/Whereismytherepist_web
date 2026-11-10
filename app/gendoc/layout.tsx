import { redirect } from "next/navigation";
import { getViewer } from "../../lib/viewer";
import { homeForRole } from "../../lib/gendoc-server";

/** Doctor portal: only for users.role = 'gendoc'. */
export default async function GenDocLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await getViewer();
  if (!user) redirect("/login?next=/gendoc");
  if (role !== "gendoc") redirect(homeForRole(role));
  return children;
}
