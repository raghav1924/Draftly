import { redirect } from "next/navigation";
import { getCurrentProfile, logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col items-center justify-center flex-grow p-6">
      <div className="w-full max-w-md p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-indigo-500/20">
          {profile.name ? profile.name[0]?.toUpperCase() : profile.email[0]?.toUpperCase()}
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back, {profile.name || "User"}!
          </h1>
          <p className="text-sm text-zinc-400">{profile.email}</p>
        </div>
        <div className="pt-4 border-t border-zinc-800">
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="outline"
              className="w-full border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all duration-300"
            >
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
