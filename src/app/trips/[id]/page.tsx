import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getOutfitsForTrip, getProductsForTrip } from "@/actions/outfitActions";
import { getDayDetailsForTrip } from "@/actions/tripActions";
import CalendarClientWrapper from "@/components/calendar/CalendarClientWrapper";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const trip = await prisma.trip.findUnique({
        where: { id },
        include: {
            owner: true as any,
            members: {
                include: { user: true as any }
            } as any
        } as any
    });

    if (!trip) {
        redirect("/");
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    const isOwner = trip.ownerId === userId;
    const isMember = (trip as any).members?.some((m: any) => m.userId === userId);

    if (!isOwner && !isMember) {
        // Not authorized, redirect to dashboard
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFBF7] text-[#3C3833]">
                <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
                <p className="text-[#8A827A] mb-6">You don't have permission to view this trip.</p>
                <Link href="/" className="px-5 py-2 text-sm font-medium transition-colors bg-[#D1C3B4] text-[#3C3833] rounded-full hover:bg-[#C2B2A1]">
                    Go to Dashboard
                </Link>
            </div>
        );
    }

    const outfits = await getOutfitsForTrip(trip.id);
    const products = await getProductsForTrip(trip.id);
    const dayDetailsRows = await getDayDetailsForTrip(trip.id);

    // Map them into a key-value object by dayNumber
    const initialDayDetails = dayDetailsRows.reduce((acc: any, row: any) => {
        acc[row.dayNumber] = row;
        return acc;
    }, {});

    const userAvatar = user?.user_metadata?.avatar_url;
    const userEmail = user?.email;

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#3C3833] font-sans pb-24 selection:bg-[#D1C3B4] selection:text-[#3C3833]">
            <CalendarClientWrapper
                tripId={trip.id}
                tripName={trip.name}
                tripEndDate={new Date((trip as any).endDate)}
                tripStartDate={new Date(trip.startDate)}
                tripLocationUrl={trip.locationUrl}
                tripLocationImageUrl={(trip as any).locationImageUrl}
                tripShowWeather={(trip as any).showWeather}
                tripWeatherLocation={(trip as any).weatherLocation}
                outfits={outfits}
                products={products}
                initialDayDetails={initialDayDetails}
                userAvatar={userAvatar}
                userEmail={userEmail}
                tripOwner={(trip as any).owner}
                tripMembers={(trip as any).members}
            />
        </div>
    );
}
