import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { EditorShell } from "@/components/EditorShell";

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  return <EditorShell documentId={id} user={user} />;
}
