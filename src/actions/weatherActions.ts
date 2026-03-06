"use server";

import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

export async function getWeatherSummaryV2(
    location: string,
    dailyData: any,
    isHistorical: boolean
) {
    const actualKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
    if (!actualKey) {
        return {
            summary: "⚠️ Google Generative AI API Key is missing. Please add GOOGLE_GENERATIVE_AI_API_KEY to your .env files to enable AI weather summaries. For now, expect a mix of the following conditions: " +
                getFrequentConditions(dailyData.weather_code) + ".",
            dailySummaries: dailyData.time.map(() => "No AI summary available.")
        };
    }

    try {
        const google = createGoogleGenerativeAI({
            apiKey: actualKey,
        });

        // Prepare the raw data summary
        const days = dailyData.time.length;
        const maxTemps = dailyData.temperature_2m_max;
        const minTemps = dailyData.temperature_2m_min;
        const codes = dailyData.weather_code;
        const precipHours = dailyData.precipitation_hours;

        let dataString = `Summary of data over ${days} days for ${location}:\n`;
        for (let i = 0; i < days; i++) {
            const pHours = precipHours ? precipHours[i] : null;
            const pHoursStr = pHours !== null ? `${pHours} hrs of rain` : "unknown";
            const rainTimes = dailyData.rain_times ? dailyData.rain_times[i] : "";
            dataString += `Day ${i + 1}: High ${maxTemps[i]}°C, Low ${minTemps[i]}°C, WMO Weather Code ${codes[i]}, Precip: ${pHoursStr} ${rainTimes ? `[${rainTimes}]` : ''}\n`;
        }

        const historicalNote = isHistorical
            ? "Note: This forecast is based on historical averages because the trip dates are strictly in the past or too far into the future."
            : "This is based on currently available forecast data.";

        const prompt = `You are a helpful travel assistant. Please write an enthusiastic and aesthetically-minded weather summary for a trip to ${location}. 
        Here is the daily temperature data (in Celsius) and weather codes over ${days} days:
        ${dataString}
        
        CRITICAL INSTRUCTION: Pay very close attention to "Precip" (precipitation hours). If the weather code indicates rain but the precipitation hours are low (e.g., 0 to 3 hours), you MUST explicitly reassure the reader that the rain is only brief/passing showers and the day is otherwise fine for outdoor activities! Do not say it will rain all day.
        
        Provide:
        1. An overall summary (2-3 sentences) weaving in what the high/low ranges generally look like, and mentioning the predominant weather conditions. Keep it concise, friendly, and helpful for someone packing clothes. ${historicalNote}
        2. Highly specific daily summaries (exactly 1-2 sentences per day). You MUST explicitly call out notable weather conditions that impact what to wear (e.g., temperature ranges, amount of expected rain, or snow) and directly instruct the user how to dress or layer for those specific conditions. If specific rain times are listed (e.g., 'Rain expected around 4pm'), explicitly mention the time in your guidance. Example: "Pretty cool day with a high of 15°C, light rain expected around 4pm, so bring a water-resistant jacket and dress in layers."
        Make sure there are exactly ${days} daily summaries generated in chronological order to map to the days provided!
        `;

        const { object } = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: z.object({
                overallSummary: z.string(),
                dailySummaries: z.array(z.string()).describe(`Exactly ${days} strings containing short daily advice on what to wear/expect based on the specific day's data.`)
            }),
            prompt,
        });

        // Ensure we gracefully handle if gemini returns wrong length
        let finalDaily = object.dailySummaries;
        if (finalDaily.length !== days) {
            finalDaily = Array(days).fill("No specific summary generated for this day.");
            for (let i = 0; i < Math.min(days, object.dailySummaries.length); i++) {
                finalDaily[i] = object.dailySummaries[i];
            }
        }

        return {
            summary: object.overallSummary,
            dailySummaries: finalDaily
        };
    } catch (e: any) {
        console.error("Error generating AI weather summary:", e);
        return {
            summary: "Failed to generate AI weather summary. Please check your API keys or quota.",
            dailySummaries: dailyData.time.map(() => "Failed to load summary.")
        };
    }
}

function getFrequentConditions(codes: number[]) {
    if (!codes || codes.length === 0) return "clear skies";
    const conditionMap: Record<number, string> = {
        0: "clear skies",
        1: "mainly clear skies",
        2: "partly cloudy periods",
        3: "overcast days",
        45: "foggy conditions",
        48: "rime fog",
        51: "light drizzle", 53: "moderate drizzle", 55: "dense drizzle",
        61: "slight rain", 63: "moderate rain", 65: "heavy rain",
        71: "slight snow", 73: "moderate snow", 75: "heavy snow",
        80: "rain showers", 81: "moderate rain showers", 82: "violent rain showers",
        95: "thunderstorms", 96: "thunderstorms with hail", 99: "heavy thunderstorms with hail"
    };

    const counts: Record<string, number> = {};
    for (const code of codes) {
        let condition = conditionMap[code] || "variable weather";
        // smooth it out
        if (code >= 1 && code <= 3) condition = "partly cloudy skies";
        if (code >= 51 && code <= 67) condition = "rain";
        if (code >= 71 && code <= 77) condition = "snow";

        counts[condition] = (counts[condition] || 0) + 1;
    }

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top2 = sorted.slice(0, 2).map(x => x[0]);
    return top2.join(" and ");
}
