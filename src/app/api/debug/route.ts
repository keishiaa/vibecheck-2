import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    const trips = await prisma.trip.findMany();
    const outfits = await prisma.outfit.findMany();
    const products = await prisma.product.findMany();
    return NextResponse.json({ trips, outfits, products });
}
