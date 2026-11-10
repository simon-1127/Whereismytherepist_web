import { keepGenDocOut } from "../../lib/viewer";

/** Company doctors have their own portal; send them there. */
export default async function Layout({ children }: { children: React.ReactNode }) {
  await keepGenDocOut();
  return children;
}
