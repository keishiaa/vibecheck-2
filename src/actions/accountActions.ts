"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(data: { name: string, avatarUrl: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Update Supabase Auth Meta (so syncUser doesn't override it later)
    await supabase.auth.updateUser({
        data: { name: data.name, avatar_url: data.avatarUrl, full_name: data.name }
    });

    // Update Prisma
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            name: data.name,
            avatarUrl: data.avatarUrl
        }
    });

    revalidatePath("/");
    return updatedUser;
}

export async function deleteUserAccount() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Deleting from Prisma cascades and wipes out all their trips, outfits, and products 
    await prisma.user.delete({
        where: { id: user.id }
    });
}
