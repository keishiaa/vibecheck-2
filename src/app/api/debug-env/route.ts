import { NextResponse } from 'next/server';
import { getWeatherSummaryV2 } from '@/actions/weatherActions';

export async function GET() {
    const dummyData = {
        time: ["2023-01-01"],
        temperature_2m_max: [20],
        temperature_2m_min: [10],
        weather_code: [1]
    };
    const summary = await getWeatherSummaryV2("Test City", dummyData, false);

    return NextResponse.json({
        geminiExists: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        geminiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "N/A",
        summary
    });
}
