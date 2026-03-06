"use server";

import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export async function getWeatherSummaryV2(
    location: string,
    dailyData: any,
    isHistorical: boolean
) {
    const actualKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!actualKey) {
        return "⚠️ Google Generative AI API Key is missing. Please add GOOGLE_GENERATIVE_AI_API_KEY to your .env files to enable AI weather summaries. For now, expect a mix of the following conditions: " +
            getFrequentConditions(dailyData.weather_code) + ".";
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
            dataString += `Day ${i + 1}: High ${maxTemps[i]}°C, Low ${minTemps[i]}°C, WMO Weather Code ${codes[i]}, Precip: ${pHoursStr}\n`;
        }

        const historicalNote = isHistorical
            ? "Note: This forecast is based on historical averages because the trip dates are strictly in the past or too far into the future."
            : "This is based on currently available forecast data.";

        const prompt = `You are a helpful travel assistant. Please write a 2-3 sentence, enthusiastic and aesthetically-minded weather summary for a trip to ${location}. 
        Here is the daily temperature data (in Celsius) and weather codes:
        ${dataString}
        
        CRITICAL INSTRUCTION: Pay very close attention to "Precip" (precipitation hours). If the weather code indicates rain but the precipitation hours are low (e.g., 0 to 3 hours), you MUST explicitly reassure the reader that the rain is only brief/passing showers and the day is otherwise fine for outdoor activities! Do not say it will rain all day.
        
        Make sure to weave in what the high/low ranges generally look like, and mention the predominant weather conditions based on the WMO codes and precip hours. Keep it concise, friendly, and helpful for someone packing clothes.
        ${historicalNote}
        `;

        const { text } = await generateText({
            model: google("gemini-2.5-flash"),
            prompt,
        });

        return text;
    } catch (e: any) {
        console.error("Error generating AI weather summary:", e);
        return "Failed to generate AI weather summary. Please check your API keys or quota.";
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
