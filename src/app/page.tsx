import { getTrips } from "@/actions/tripActions";
import DashboardClientView from "@/components/dashboard/DashboardClientView";
import SignOutButton from "@/components/auth/SignOutButton";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const trips = user ? await getTrips() : [];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3C3833] font-sans selection:bg-[#D1C3B4] selection:text-[#3C3833]">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between p-6 border-b border-[#EAE5DF] bg-white">
        <div className="flex items-center gap-3">
          <Image src="/vibecheck-logo.jpg" alt="VibeCheck" width={247} height={100} priority className="object-contain w-auto h-10 mix-blend-multiply" />
        </div>

        <div>
          {!user ? (
            <Link href="/login" className="px-5 py-2 text-sm font-medium transition-all bg-[#D1C3B4] text-[#3C3833] rounded-full hover:bg-[#C2B2A1]">
              Sign In
            </Link>
          ) : (
            <SignOutButton />
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl px-6 py-12 mx-auto">
        {!user ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-4xl font-light tracking-tight md:text-5xl">
              Plan your aesthetic.
            </h2>
            <p className="mt-4 text-lg text-[#8A827A] max-w-xl">
              VibeCheck is an event-driven, collaborative outfit planner for your next trip. Log in to start curating your wardrobe in absolute style.
            </p>
          </div>
        ) : (
          <DashboardClientView trips={trips} />
        )}
      </main>
    </div>
  );
}
