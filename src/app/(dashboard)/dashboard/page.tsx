import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/actions/auth";
import { getOwnedDocuments, getSharedDocuments } from "@/lib/actions/documents";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  // Fetch owned and shared documents concurrently
  const [ownedDocs, sharedDocs] = await Promise.all([
    getOwnedDocuments(),
    getSharedDocuments(),
  ]);

  return (
    <DashboardClient
      userEmail={profile.email}
      userName={profile.name ?? undefined}
      initialOwned={ownedDocs}
      initialShared={sharedDocs}
    />
  );
}
