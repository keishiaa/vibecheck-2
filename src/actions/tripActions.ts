"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Sync user from Supabase to Prisma DB if they don't exist.
 */
export async function syncUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");
    const userId = user.id;

    const email = user.email ?? `unknown-${userId}@example.com`;
    const name = user.user_metadata?.full_name || user.user_metadata?.name || null;
    const avatarUrl = user.user_metadata?.avatar_url || null;

    try {
        await prisma.user.upsert({
            where: { id: userId },
            update: { email, name, avatarUrl }, // keep synced
            create: {
                id: userId,
                email,
                name,
                avatarUrl,
                role: "Admin",
            },
        });
    } catch (e: any) {
        if (e.code === 'P2002') {
            const fallbackEmail = `${userId}-${email}`;
            await prisma.user.upsert({
                where: { id: userId },
                update: { email: fallbackEmail, name, avatarUrl },
                create: {
                    id: userId,
                    email: fallbackEmail,
                    name,
                    avatarUrl,
                    role: "Admin",
                },
            });
        } else {
            throw e;
        }
    }

    return userId;
}

export async function createTrip(formData: FormData) {
    const userId = await syncUser();

    const name = formData.get("name") as string;
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;
    const locationUrl = null;
    const locationImageUrl = null;
    const showWeather = formData.get("showWeather") === "true";
    const weatherLocation = formData.get("weatherLocation") as string | null;

    if (!name || !startDateStr || !endDateStr) {
        throw new Error("Missing required fields");
    }

    // Set time to noon to avoid timezone shift issues
    const startDate = new Date(startDateStr + "T12:00:00");
    const endDate = new Date(endDateStr + "T12:00:00");

    const trip = await prisma.trip.create({
        data: {
            name,
            startDate,
            endDate,
            locationUrl,
            locationImageUrl,
            showWeather,
            weatherLocation,
            ownerId: userId,
        } as any,
    });

    revalidatePath("/");
    return trip;
}

export async function getTrips() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // If not logged in, return an empty array
    if (!userId) return [];

    // Sync user here just to guarantee user row exists early in the journey
    await syncUser().catch(() => null);

    const trips = await prisma.trip.findMany({
        where: {
            OR: [
                { ownerId: userId },
                { members: { some: { userId } } }
            ]
        } as any,
        include: {
            owner: true,
            members: {
                include: {
                    user: true
                }
            }
        } as any,
        orderBy: { startDate: "asc" },
    });

    return trips;
}

export async function updateTrip(tripId: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;
    const locationUrl = null;
    const locationImageUrl = null;
    const showWeather = formData.get("showWeather") === "true";
    const weatherLocation = formData.get("weatherLocation") as string | null;

    if (!name || !startDateStr || !endDateStr) {
        throw new Error("Missing required fields");
    }

    const startDate = new Date(startDateStr + "T12:00:00");
    const endDate = new Date(endDateStr + "T12:00:00");

    const trip = await prisma.trip.update({
        where: { id: tripId, ownerId: userId },
        data: {
            name,
            startDate,
            endDate,
            locationUrl,
            locationImageUrl,
            showWeather,
            weatherLocation,
        } as any,
    });

    revalidatePath("/");
    revalidatePath(`/trips/${tripId}`);
    return trip;
}

export async function joinTrip(tripId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) throw new Error("Unauthorized");
    await syncUser().catch(() => null);

    // Check if trip exists
    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
    });
    if (!trip) throw new Error("Trip not found");

    if (trip.ownerId === userId) {
        return tripId; // Already owner
    }

    await (prisma as any).tripMember.upsert({
        where: {
            tripId_userId: {
                tripId,
                userId,
            }
        },
        update: {}, // if exists, do nothing
        create: {
            tripId,
            userId,
        }
    });

    revalidatePath("/");
    revalidatePath(`/trips/${tripId}`);
    return tripId;
}

export async function getDayDetailsForTrip(tripId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const details = await (prisma as any).dayDetails.findMany({
        where: { tripId },
        orderBy: { dayNumber: 'asc' }
    });
    return details;
}

export async function updateDayDetails(tripId: string, dayNumber: number, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const activities = formData.get("activities") as string | null;
    const locationUrl = formData.get("locationUrl") as string | null;

    // Check if user is owner or member
    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: { members: true }
    });

    if (!trip) throw new Error("Trip not found");

    const isOwner = trip.ownerId === user.id;
    const isMember = (trip as any).members?.some((m: any) => m.userId === user.id);

    if (!isOwner && !isMember) throw new Error("Unauthorized");

    await (prisma as any).dayDetails.upsert({
        where: {
            tripId_dayNumber: {
                tripId,
                dayNumber
            }
        },
        update: {
            activities,
            locationUrl
        },
        create: {
            tripId,
            dayNumber,
            activities,
            locationUrl
        }
    });

    revalidatePath(`/trips/${tripId}`);
}

export async function deleteTrip(tripId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        if (!userId) return { error: "Unauthorized: User not logged in." };

        const trip = await prisma.trip.findUnique({ where: { id: tripId } });
        if (!trip) return { error: "Trip not found." };
        if (trip.ownerId !== userId) return { error: "Unauthorized: You do not own this trip." };

        // Clean up related entities manually to bypass missing Cascades
        await prisma.product.deleteMany({ where: { tripId } });
        await prisma.outfit.deleteMany({ where: { tripId } });
        await prisma.tripMember.deleteMany({ where: { tripId } });
        await prisma.dayDetails.deleteMany({ where: { tripId } });

        await prisma.trip.delete({
            where: { id: tripId },
        });

        return { success: true };
    } catch (e: any) {
        console.error("deleteTrip Error:", e);
        return { error: e.message || String(e) };
    }
}
