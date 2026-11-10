import { redirect } from "next/navigation";
import { getViewer } from "../../lib/viewer";

/** Employee side of GenDoc. Doctors and therapists have their own portals. */
export default async function CompanyDoctorLayout({ children }: { children: React.ReactNode }) {
  const { role } = await getViewer();
  if (role === "gendoc") redirect("/gendoc");
  if (role === "provider") redirect("/provider/dashboard");
  return children;
}
