"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Force TS re-evaluation after prisma generate

export async function addOutfit(tripId: string, dayNumber: number | null, data: { name?: string, description?: string, activity?: string, locationUrl?: string, isPrivate: boolean, products?: any[], existingProductIds?: string[] }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) throw new Error("Unauthorized");

    const name = data.name || null;
    const description = data.description || null;
    const activity = data.activity || null;
    const locationUrl = data.locationUrl || null;
    const isPrivate = data.isPrivate;

    // Separate new products to be created versus existing products to associate
    const newProducts = data.products?.filter(p => !p.id).map(p => ({
        tripId,
        imageUrl: p.imageUrl || null,
        name: p.name,
        category: p.category,
        tags: p.tags || [],
        notes: p.notes || null,
    })) || [];

    // existing product ids to connect
    let allProductIdsToConnect = data.existingProductIds || [];
    const validExistingProductsFromData = data.products?.filter(p => p.id).map(p => p.id) || [];
    allProductIdsToConnect = [...allProductIdsToConnect, ...validExistingProductsFromData];

    const outfit = await prisma.outfit.create({
        data: {
            tripId,
            dayNumber,
            name,
            description,
            activity,
            locationUrl,
            isPrivate,
            userId,
            products: {
                create: newProducts,
                connect: allProductIdsToConnect.map(id => ({ id }))
            }
        },
    });

    revalidatePath(`/trips/${tripId}`);
    return outfit;
}

export async function updateOutfit(outfitId: string, tripId: string, data: { name?: string, description?: string, activity?: string, locationUrl?: string, isPrivate: boolean, products?: any[], existingProductIds?: string[] }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) throw new Error("Unauthorized");

    const name = data.name || null;
    const description = data.description || null;
    const activity = data.activity || null;
    const locationUrl = data.locationUrl || null;
    const isPrivate = data.isPrivate;

    // We'll simplisticly delete all existing non-shared products and recreate them, 
    // or just rely on a set operation. Given the complexity of updating nested arrays,
    // let's do a basic update of the outfit metadata first.
    // For products, let's disconnect all existing products and connect/create the new ones.

    // First, disconnect all products
    await prisma.outfit.update({
        where: { id: outfitId },
        data: {
            products: { set: [] }
        }
    });

    const newProducts = data.products?.filter(p => !p.id).map(p => ({
        tripId,
        imageUrl: p.imageUrl || null,
        name: p.name,
        category: p.category,
        tags: p.tags || [],
        notes: p.notes || null,
    })) || [];

    let allProductIdsToConnect = data.existingProductIds || [];
    const validExistingProductsFromData = data.products?.filter(p => p.id).map(p => p.id) || [];
    allProductIdsToConnect = [...allProductIdsToConnect, ...validExistingProductsFromData];

    const outfit = await prisma.outfit.update({
        where: { id: outfitId },
        data: {
            name,
            description,
            activity,
            locationUrl,
            isPrivate,
            products: {
                create: newProducts,
                connect: allProductIdsToConnect.map(id => ({ id }))
            }
        },
    });

    revalidatePath(`/trips/${tripId}`);
    return outfit;
}

export async function getOutfitsForTrip(tripId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) return [];

    const outfits = await prisma.outfit.findMany({
        where: {
            tripId,
            // Shared logic: either it's not private, or it's your own private outfit
            OR: [
                { isPrivate: false },
                { userId, isPrivate: true }
            ]
        },
        include: {
            user: {
                select: { email: true, role: true } // Don't expose all user details, just email/role for profile bubbles
            },
            comments: {
                include: {
                    user: { select: { email: true } }
                }
            },
            products: true
        },
        orderBy: { dayNumber: "asc" },
    });

    return outfits;
}

export async function addComment(outfitId: string, textContent: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) throw new Error("Unauthorized");

    if (!textContent) throw new Error("Comment cannot be empty");

    // Fetch outfit to know which trip to revalidate
    const outfit = await prisma.outfit.findUnique({
        where: { id: outfitId },
        select: { tripId: true }
    });

    if (!outfit) throw new Error("Outfit not found");

    const comment = await prisma.comment.create({
        data: {
            outfitId,
            userId,
            textContent,
        }
    });

    revalidatePath(`/trips/${outfit.tripId}`);
    return comment;
}

export async function assignOutfitToDay(outfitId: string, dayNumber: number, tripId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.outfit.update({
        where: { id: outfitId },
        data: { dayNumber }
    });

    revalidatePath(`/trips/${tripId}`);
}

export async function copyOutfitToWardrobe(outfitId: string, tripId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Fetch the existing outfit to clone it
    const existing = await prisma.outfit.findUnique({
        where: { id: outfitId },
        include: { products: true }
    });

    if (!existing) throw new Error("Outfit not found");

    // Create a new duplicated outfit for the wardrobe (dayNumber: null)
    await prisma.outfit.create({
        data: {
            tripId: existing.tripId,
            userId: existing.userId,
            dayNumber: null,
            name: existing.name,
            description: existing.description,
            activity: existing.activity,
            locationUrl: existing.locationUrl,
            isPrivate: existing.isPrivate,
            products: {
                create: existing.products.map((p: any) => ({
                    tripId: p.tripId,
                    name: p.name,
                    category: p.category,
                    imageUrl: p.imageUrl,
                    tags: p.tags,
                    notes: p.notes
                }))
            }
        }
    });

    revalidatePath(`/trips/${tripId}`);
}

export async function addProductToTrip(tripId: string, data: { imageUrl?: string, name: string, category: string, tags?: string[], notes?: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const product = await prisma.product.create({
        data: {
            tripId,
            imageUrl: data.imageUrl || null,
            name: data.name,
            category: data.category,
            tags: data.tags || [],
            notes: data.notes || null,
        }
    });

    revalidatePath(`/trips/${tripId}`);
    return product;
}

export async function getProductsForTrip(tripId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return [];

    return prisma.product.findMany({
        where: { tripId },
        orderBy: { name: 'asc' }
    });
}

export async function deleteOutfit(outfitId: string, tripId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Optional: check if the user is the owner of the outfit or the trip owner
    // For now, allow deletion if authorized
    await prisma.outfit.delete({
        where: { id: outfitId }
    });

    revalidatePath(`/trips/${tripId}`);
}
