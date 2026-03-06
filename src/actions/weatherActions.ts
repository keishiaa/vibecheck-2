"use server";

import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import prisma from "@/lib/prisma";

export async function getWeatherSummaryV2(
    location: string,
    dailyData: any,
    isHistorical: boolean,
    preferredTempUnit: string = "C"
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

        const isFahrenheit = preferredTempUnit === "F";

        let dataString = `Summary of data over ${days} days for ${location}:\n`;
        for (let i = 0; i < days; i++) {
            const pHours = precipHours ? precipHours[i] : null;
            const pHoursStr = pHours !== null ? `${pHours} hrs of rain` : "unknown";
            const rainTimes = dailyData.rain_times ? dailyData.rain_times[i] : "";

            // Format temperatures based on unit without decimals
            const highTempRaw = isFahrenheit ? (maxTemps[i] * 9) / 5 + 32 : maxTemps[i];
            const lowTempRaw = isFahrenheit ? (minTemps[i] * 9) / 5 + 32 : minTemps[i];
            const highTempStr = `${Math.round(highTempRaw)}°${preferredTempUnit}`;
            const lowTempStr = `${Math.round(lowTempRaw)}°${preferredTempUnit}`;

            dataString += `Day ${i + 1}: High ${highTempStr}, Low ${lowTempStr}, WMO Weather Code ${codes[i]}, Precip: ${pHoursStr} ${rainTimes ? `[${rainTimes}]` : ''}\n`;
        }

        const historicalNote = isHistorical
            ? "Note: This forecast is based on historical averages because the trip dates are strictly in the past or too far into the future."
            : "This is based on currently available forecast data.";

        const prompt = `You are a weather summarizer providing practical, direct weather facts for a trip to ${location}. Do not use flowery, poetic, or overly enthusiastic language. Keep it very simple and concise. ALWAYS represent temperature in ${preferredTempUnit === 'F' ? 'Fahrenheit (°F)' : 'Celsius (°C)'}. Round all numbers to whole integers (e.g., 28°C), NEVER show decimal points.
        Here is the daily temperature data and weather codes over ${days} days:
        ${dataString}
        
        CRITICAL INSTRUCTION: Pay very close attention to "Precip" (precipitation hours). If the weather code indicates rain but the precipitation hours are low (e.g., 0 to 3 hours), clarify the rain is brief. Do not say it will rain all day.
        
        Provide:
        1. An overall summary. State the general high/low ranges and predominant weather. Keep it entirely practical, direct, and under 25 words total. ${historicalNote}
        2. Daily summaries. You MUST focus entirely on the weather facts. DO NOT provide ANY clothing or outfit recommendations (e.g., do NOT say "wear a jacket" or "pack light clothes"). If specific rain times are listed (e.g., 4am, 10am, 11am), you MUST group them into general periods (e.g., 'morning' or 'afternoon') instead of listing specific hours.
        CRITICAL LENGTH LIMIT: Each daily summary MUST be strictly fewer than 18 words. Example: "Enjoy a warm 28°C day; anticipate moderate rain mainly in the morning."
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

export async function getOrFetchWeather(
    tripId: string,
    tripWeatherLocation: string,
    tripStartDate: Date,
    tripEndDate: Date,
    tripOwnerId: string
) {
    try {
        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            select: { weatherCacheData: true, weatherCachedAt: true },
        });

        const owner = await prisma.user.findUnique({
            where: { id: tripOwnerId },
            select: { preferredTemperatureUnit: true }
        });
        const preferredTempUnit = owner?.preferredTemperatureUnit || "C";

        // Check if cache exists and is less than 12 hours old
        if (trip?.weatherCacheData && trip?.weatherCachedAt) {
            const now = new Date();
            const diffHrs = (now.getTime() - new Date(trip.weatherCachedAt).getTime()) / (1000 * 60 * 60);
            if (diffHrs < 12) {
                return trip.weatherCacheData as any;
            }
        }

        // Cache is stale or non-existent, do the full fetch
        const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(tripWeatherLocation)}&count=1&language=en&format=json`
        );
        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) {
            return { error: true };
        }
        const { latitude, longitude } = geoData.results[0];

        let start = new Date(tripStartDate);
        let end = new Date(tripEndDate);

        const diffMs = end.getTime() - start.getTime();
        if (diffMs > 14 * 24 * 60 * 60 * 1000) {
            end = new Date(start);
            end.setDate(start.getDate() + 14);
        }

        const today = new Date();
        const minForecastDate = new Date();
        minForecastDate.setDate(today.getDate() - 90);
        const maxForecastDate = new Date();
        maxForecastDate.setDate(today.getDate() + 14);

        let isHistorical = false;
        let apiUrl = "";

        if (start >= minForecastDate && end <= maxForecastDate) {
            const startStr = start.toISOString().split("T")[0];
            const endStr = end.toISOString().split("T")[0];
            apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_hours&hourly=precipitation&start_date=${startStr}&end_date=${endStr}&temperature_unit=celsius`;
        } else {
            isHistorical = true;
            const maxArchiveDate = new Date();
            maxArchiveDate.setDate(today.getDate() - 5);
            while (start > maxArchiveDate || end > maxArchiveDate) {
                start.setFullYear(start.getFullYear() - 1);
                end.setFullYear(end.getFullYear() - 1);
            }
            const startStr = start.toISOString().split("T")[0];
            const endStr = end.toISOString().split("T")[0];
            apiUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_hours&hourly=precipitation&start_date=${startStr}&end_date=${endStr}&temperature_unit=celsius`;
        }

        const wxRes = await fetch(apiUrl);
        const wxData = await wxRes.json();

        if (wxData.error || !wxData.daily) {
            return { error: true };
        }

        const daily = wxData.daily;

        if (wxData.hourly && wxData.hourly.time) {
            daily.rain_times = [];
            for (let i = 0; i < daily.time.length; i++) {
                const dayStartIdx = i * 24;
                const dayEndIdx = dayStartIdx + 24;
                const precipSlice = wxData.hourly.precipitation.slice(dayStartIdx, dayEndIdx);
                let rainStrings = [];
                for (let h = 0; h < 24; h++) {
                    if (precipSlice[h] > 0.1) {
                        const ampm = h >= 12 ? (h === 12 ? '12pm' : `${h - 12}pm`) : (h === 0 ? '12am' : `${h}am`);
                        rainStrings.push(ampm);
                    }
                }
                if (rainStrings.length > 0) {
                    if (rainStrings.length > 18) daily.rain_times[i] = "Raining most of the day";
                    else daily.rain_times[i] = "Rain expected around " + rainStrings.join(", ");
                } else {
                    daily.rain_times[i] = "No precipitation";
                }
            }
        }

        const highC = Math.round(Math.max(...daily.temperature_2m_max.filter((v: number) => v !== null && !isNaN(v))));
        const lowC = Math.round(Math.min(...daily.temperature_2m_min.filter((v: number) => v !== null && !isNaN(v))));
        const highF = Math.round((highC * 9) / 5 + 32);
        const lowF = Math.round((lowC * 9) / 5 + 32);

        const code = daily.weather_code.length > 0 ? daily.weather_code[0] : 0;
        let conditions = "Clear";
        let icon = "☀️";
        if (code >= 1 && code <= 3) { conditions = "Partly Cloudy"; icon = "🌤️"; }
        if (code >= 45 && code <= 48) { conditions = "Fog"; icon = "🌫️"; }
        if (code >= 51 && code <= 67) { conditions = "Rain"; icon = "🌧️"; }
        if (code >= 71 && code <= 77) { conditions = "Snow"; icon = "❄️"; }
        if (code >= 80 && code <= 82) { conditions = "Rain Showers"; icon = "🌦️"; }
        if (code >= 95) { conditions = "Thunderstorm"; icon = "⛈️"; }

        const dailyIcons = daily.weather_code.map((c: number, idx: number) => {
            const precipHours = daily.precipitation_hours ? (daily.precipitation_hours[idx] || 0) : 0;
            if (c >= 1 && c <= 3) return "🌤️";
            if (c >= 45 && c <= 48) return "🌫️";
            if (c >= 51 && c <= 67) return precipHours > 0 && precipHours <= 3 ? "🌦️" : "🌧️";
            if (c >= 71 && c <= 77) return "❄️";
            if (c >= 80 && c <= 82) return precipHours > 0 && precipHours <= 3 ? "🌦️" : "🌧️";
            if (c >= 95) return precipHours > 0 && precipHours <= 3 ? "🌦️" : "⛈️";
            return "☀️";
        });

        const aiResult = await getWeatherSummaryV2(tripWeatherLocation, daily, isHistorical, preferredTempUnit);

        const weatherDataObj = {
            highC, lowC, highF, lowF, conditions, icon, isHistorical,
            aiSummary: aiResult.summary,
            dailySummaries: aiResult.dailySummaries,
            dailyIcons,
            unit: preferredTempUnit
        };

        // Cache the result in DB
        await prisma.trip.update({
            where: { id: tripId },
            data: {
                weatherCacheData: weatherDataObj,
                weatherCachedAt: new Date(),
            }
        });

        return weatherDataObj;
    } catch (err) {
        console.error("Error in getOrFetchWeather:", err);
        return { error: true };
    }
}
