import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { DocumentHome } from "@/components/DocumentHome";

export default async function DocsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return <DocumentHome user={user} />;
}
