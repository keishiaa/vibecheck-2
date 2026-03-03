import { joinTrip } from "@/actions/tripActions";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function JoinTripPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const trip = await prisma.trip.findUnique({
        where: { id },
    });

    if (!trip) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFBF7] text-[#3C3833]">
                <h1 className="text-2xl font-semibold mb-2">Trip not found</h1>
                <p className="text-[#8A827A]">The invite link you followed may be invalid.</p>
            </div>
        );
    }

    try {
        await joinTrip(id);
    } catch (e) {
        // Just in case
    }

    redirect(`/trips/${id}`);
}
