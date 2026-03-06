"use client";

import { useState, useEffect, useTransition } from "react";
import AddLookModal from "@/components/AddLookModal";
import AddProductModal from "@/components/AddProductModal";
import EditProductModal from "@/components/EditProductModal";
import {
  assignOutfitToDay,
  deleteProduct,
  removeProductFromOutfit,
} from "@/actions/outfitActions";
import { updateDayDetails } from "@/actions/tripActions";
import CreateTripModal from "@/components/CreateTripModal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, CalendarDays, Shirt, ShoppingBag } from "lucide-react";
import { getWeatherSummaryV2 } from "@/actions/weatherActions";

function getDisplayUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url;
}

function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  originalUrl: string,
) {
  const target = e.currentTarget;
  if (!target.dataset.fallback) {
    target.dataset.fallback = "true";
    try {
      const domain = new URL(originalUrl).hostname;
      target.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
      target.classList.remove("object-cover");
      target.classList.add("object-contain", "scale-50", "opacity-50");
    } catch {
      target.style.display = "none";
    }
  } else {
    target.style.display = "none";
  }
}

const UserBubble = ({
  user,
  isOwner = false,
}: {
  user: any;
  isOwner?: boolean;
}) => {
  if (!user) return null;
  const avatar = user.avatarUrl || user.avatar_url;
  const nameStr = user.name || user.email || "U";

  const getInitials = (str: string) => {
    if (!str) return "U";
    if (str.includes("@")) {
      const prefix = str.split("@")[0];
      const parts = prefix.split(/[._-]/);
      if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return prefix.substring(0, 2).toUpperCase();
    }
    const parts = str.split(" ");
    if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(nameStr);
  const bgColor = isOwner ? "bg-[#D1C3B4]" : "bg-[#FCFAF8]";
  const textColor = isOwner ? "text-[#3C3833]" : "text-[#8A827A]";

  return (
    <div
      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#FDFBF7] flex items-center justify-center text-[10px] sm:text-[11px] font-bold ${bgColor} ${textColor} shadow-sm overflow-hidden shrink-0 hover:z-30 relative`}
      title={`${isOwner ? "Owner" : "Member"}: ${user.name || user.email || "Unknown User"}`}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={nameStr}
          className="w-full h-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
};

export default function CalendarClientWrapper({
  tripId,
  tripName,
  tripEndDate,
  tripStartDate,
  tripLocationUrl,
  tripLocationImageUrl,
  tripShowWeather,
  tripWeatherLocation,
  outfits,
  products = [],
  initialDayDetails = {},
  currentUserId,
  userAvatar,
  userEmail,
  tripOwner,
  tripMembers,
}: {
  tripId: string;
  tripName: string;
  tripEndDate: Date;
  tripStartDate: Date;
  tripLocationUrl?: string | null;
  tripLocationImageUrl?: string | null;
  tripShowWeather?: boolean;
  tripWeatherLocation?: string | null;
  outfits: any[];
  products?: any[];
  initialDayDetails?: Record<number, any>;
  currentUserId?: string;
  userAvatar?: string | null;
  userEmail?: string | null;
  tripOwner?: any;
  tripMembers?: any[];
}) {
  const [activeDayModal, setActiveDayModal] = useState<number | null>(null);
  const [editingOutfit, setEditingOutfit] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [activeCatalogModal, setActiveCatalogModal] = useState<boolean>(false);
  const [activeEditTripModal, setActiveEditTripModal] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "itinerary" | "catalog"
  >("itinerary");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("mine");
  const [eventsOwnerFilter, setEventsOwnerFilter] = useState<string>("mine");

  // State for day details
  const [dayDetails, setDayDetails] =
    useState<Record<number, any>>(initialDayDetails);
  const [editingDayDetails, setEditingDayDetails] = useState<number | null>(
    null,
  );

  const router = useRouter();

  useEffect(() => {
    let startX = 0;
    let endX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX;
      if (endX - startX > 100 && startX < 50) {
        // Swiped right starting from the very left edge
        router.replace('/');
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [router]);

  const tripDurationDays = Math.ceil((tripEndDate.getTime() - tripStartDate.getTime()) / (1000 * 3600 * 24)) + 1;

  const [weatherData, setWeatherData] = useState<{
    highC?: number;
    lowC?: number;
    highF?: number;
    lowF?: number;
    conditions?: string;
    icon?: string;
    isHistorical?: boolean;
    error?: boolean;
    aiSummary?: string;
    dailySummaries?: string[];
    dailyIcons?: string[];
  } | null>(null);

  useEffect(() => {
    if (!tripShowWeather || !tripWeatherLocation) return;

    async function fetchWeather() {
      try {
        // 1. Geocode
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(tripWeatherLocation as string)}&count=1&language=en&format=json`,
        );
        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) {
          setWeatherData({ error: true });
          return;
        }
        const { latitude, longitude } = geoData.results[0];

        // 2. Weather
        // Convert dates to YYYY-MM-DD
        let start = new Date(tripStartDate);
        let end = new Date(tripEndDate);

        // Open-meteo allows start_date and end_date for historical and forecast data.
        // Note: Trip > 14 days will be capped so API works without exceeding span limits.
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
        let startStr = "";
        let endStr = "";

        if (start >= minForecastDate && end <= maxForecastDate) {
          startStr = start.toISOString().split("T")[0];
          endStr = end.toISOString().split("T")[0];
          apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_hours&hourly=precipitation&start_date=${startStr}&end_date=${endStr}&temperature_unit=celsius`;
        } else {
          isHistorical = true;
          // Shift dates back year by year until they are safe for the archive API (5 day lag)
          const maxArchiveDate = new Date();
          maxArchiveDate.setDate(today.getDate() - 5);

          while (start > maxArchiveDate || end > maxArchiveDate) {
            start.setFullYear(start.getFullYear() - 1);
            end.setFullYear(end.getFullYear() - 1);
          }

          startStr = start.toISOString().split("T")[0];
          endStr = end.toISOString().split("T")[0];
          apiUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_hours&hourly=precipitation&start_date=${startStr}&end_date=${endStr}&temperature_unit=celsius`;
        }

        const wxRes = await fetch(apiUrl);
        const wxData = await wxRes.json();

        if (wxData.error || !wxData.daily) {
          console.error("Open-Meteo Error:", wxData.reason);
          setWeatherData({ error: true });
          return;
        }

        const daily = wxData.daily;

        // Parse hourly precipitation into readable times (e.g., '4pm')
        if (wxData.hourly && wxData.hourly.time) {
          daily.rain_times = [];
          // The API returns exactly 24 hours per day requested
          for (let i = 0; i < daily.time.length; i++) {
            const dayStartIdx = i * 24;
            const dayEndIdx = dayStartIdx + 24;
            const precipSlice = wxData.hourly.precipitation.slice(dayStartIdx, dayEndIdx);

            let rainStrings = [];
            for (let h = 0; h < 24; h++) {
              if (precipSlice[h] > 0.1) { // Only log if there's notable precip > 0.1mm
                const ampm = h >= 12 ? (h === 12 ? '12pm' : `${h - 12}pm`) : (h === 0 ? '12am' : `${h}am`);
                rainStrings.push(ampm);
              }
            }
            if (rainStrings.length > 0) {
              // Condense if it's raining all day
              if (rainStrings.length > 18) {
                daily.rain_times[i] = "Raining most of the day";
              } else {
                daily.rain_times[i] = "Rain expected around " + rainStrings.join(", ");
              }
            } else {
              daily.rain_times[i] = "No precipitation";
            }
          }
        }

        // We find the overall highest High and lowest Low over the trip snippet
        const highC = Math.round(
          Math.max(
            ...daily.temperature_2m_max.filter(
              (v: number) => v !== null && !isNaN(v),
            ),
          ),
        );
        const lowC = Math.round(
          Math.min(
            ...daily.temperature_2m_min.filter(
              (v: number) => v !== null && !isNaN(v),
            ),
          ),
        );
        const highF = Math.round((highC * 9) / 5 + 32);
        const lowF = Math.round((lowC * 9) / 5 + 32);

        // Decode WMO code from the first day of the trip (simplified representation for the trip)
        const code = daily.weather_code.length > 0 ? daily.weather_code[0] : 0;
        let conditions = "Clear";
        let icon = "☀️";
        if (code >= 1 && code <= 3) {
          conditions = "Partly Cloudy";
          icon = "🌤️";
        }
        if (code >= 45 && code <= 48) {
          conditions = "Fog";
          icon = "🌫️";
        }
        if (code >= 51 && code <= 67) {
          conditions = "Rain";
          icon = "🌧️";
        }
        if (code >= 71 && code <= 77) {
          conditions = "Snow";
          icon = "❄️";
        }
        if (code >= 80 && code <= 82) {
          conditions = "Rain Showers";
          icon = "🌦️";
        }
        if (code >= 95) {
          conditions = "Thunderstorm";
          icon = "⛈️";
        }

        // Generate daily icons based on each day's code and precip hours
        const dailyIcons = daily.weather_code.map((c: number, idx: number) => {
          const precipHours = daily.precipitation_hours ? (daily.precipitation_hours[idx] || 0) : 0;

          if (c >= 1 && c <= 3) return "🌤️";
          if (c >= 45 && c <= 48) return "🌫️";

          if (c >= 51 && c <= 67) {
            // It's raining, but if it's less than 3 hours of rain in the day, consider it brief showers
            if (precipHours > 0 && precipHours <= 3) return "🌦️";
            return "🌧️";
          }
          if (c >= 71 && c <= 77) return "❄️";

          if (c >= 80 && c <= 82) {
            if (precipHours > 0 && precipHours <= 3) return "🌦️";
            return "🌧️";
          }

          if (c >= 95) {
            if (precipHours > 0 && precipHours <= 3) return "🌦️";
            return "⛈️";
          }
          return "☀️";
        });

        // Get AI summary
        const aiResult = await getWeatherSummaryV2(
          tripWeatherLocation as string,
          daily,
          isHistorical
        );

        setWeatherData({
          highC,
          lowC,
          highF,
          lowF,
          conditions,
          icon,
          isHistorical,
          aiSummary: aiResult.summary,
          dailySummaries: aiResult.dailySummaries,
          dailyIcons
        });
      } catch (err) {
        console.error(err);
        setWeatherData({ error: true });
      }
    }

    fetchWeather();
  }, [tripShowWeather, tripWeatherLocation, tripStartDate, tripEndDate]);

  // Group outfits by day
  const outfitsByDay: Record<number, any[]> = {};
  const savedOutfits: any[] = [];
  for (const outfit of outfits) {
    if (outfit.dayNumber === null) {
      savedOutfits.push(outfit);
    } else {
      if (!outfitsByDay[outfit.dayNumber]) outfitsByDay[outfit.dayNumber] = [];
      outfitsByDay[outfit.dayNumber].push(outfit);
    }
  }

  // Calculate duration in days
  const durationTime = tripEndDate.getTime() - tripStartDate.getTime();
  const tripDuration = Math.ceil(durationTime / (1000 * 3600 * 24)) + 1;

  // Generate the timeline iterator array based on duration
  const days = Array.from({ length: tripDuration }, (_, i) => i + 1);

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  const [isPending, startTransition] = useTransition();

  const handleAssignToDay = async (outfitId: string, dayNumber: number) => {
    startTransition(async () => {
      try {
        await assignOutfitToDay(outfitId, dayNumber, tripId);
      } catch (e) {
        console.error("Failed to assign outfit.", e);
      }
    });
  };

  const handleSaveDayDetails = async (
    dayNum: number,
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newActivity = ((formData.get("activities") as string) || "").trim();
    const locationUrl = formData.get("locationUrl") as string;

    if (!newActivity) {
      setEditingDayDetails(null);
      return;
    }

    const existingStr = dayDetails[dayNum]?.activities || "";
    const combined = existingStr
      ? `${existingStr} ||| ${newActivity}`
      : newActivity;

    setDayDetails((prev) => ({
      ...prev,
      [dayNum]: { ...prev[dayNum], activities: combined, locationUrl },
    }));
    setEditingDayDetails(null);

    startTransition(async () => {
      try {
        const submitData = new FormData();
        submitData.append("activities", combined);
        if (locationUrl) submitData.append("locationUrl", locationUrl);
        await updateDayDetails(tripId, dayNum, submitData);
      } catch (err) {
        console.error(err);
        alert("Failed to save day details.");
      }
    });
  };

  const handleDeleteDayActivity = (dayNum: number, idx: number) => {
    if (!window.confirm("Remove this plan?")) return;

    const existingStr = dayDetails[dayNum]?.activities || "";
    const list = existingStr.split(" ||| ").filter(Boolean);
    list.splice(idx, 1);
    const combined = list.join(" ||| ");

    setDayDetails((prev) => ({
      ...prev,
      [dayNum]: { ...prev[dayNum], activities: combined },
    }));

    startTransition(async () => {
      try {
        const submitData = new FormData();
        submitData.append("activities", combined);
        await updateDayDetails(tripId, dayNum, submitData);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product from your catalog? This will remove it from any assigned looks.",
    );
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteProduct(productId, tripId);
      } catch (err) {
        console.error("Failed to delete product.", err);
        alert("Failed to delete product.");
      }
    });
  };

  const handleRemoveProductFromLook = async (
    e: React.MouseEvent,
    productId: string,
    outfitId: string,
  ) => {
    e.stopPropagation();
    const confirmed = window.confirm("Remove this product from the look?");
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await removeProductFromOutfit(productId, outfitId, tripId);
      } catch (err) {
        console.error("Failed to remove product.", err);
        alert("Failed to remove product.");
      }
    });
  };

  const renderOutfit = (outfit: any, isWardrobe: boolean = false) => {
    const hasImageProduct = outfit.products?.find((p: any) => p.imageUrl);
    const displayImage = getDisplayUrl(
      outfit.coverImageUrl || hasImageProduct?.imageUrl,
    );
    const lookIdentifier = outfit.name
      ? outfit.name.replace(/\s+/g, "-").toLowerCase()
      : outfit.id;

    const canEditOutfit = outfit.userId === currentUserId || tripOwner?.id === currentUserId;

    return (
      <div
        key={outfit.id}
        id={`look-${lookIdentifier}`}
        onClick={() => {
          if (canEditOutfit) setEditingOutfit(outfit);
        }}
        className={`flex flex-col animate-in fade-in duration-500 relative group/card transition-transform ${canEditOutfit ? "cursor-pointer active:scale-[0.98]" : ""}`}
      >
        <div className="relative group overflow-hidden rounded-2xl bg-white aspect-[4/5] shadow-sm hover:shadow-lg transition-shadow">
          {displayImage ? (
            <img
              src={displayImage}
              onError={(e) => handleImageError(e, displayImage)}
              alt="Main Visual"
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full text-[#C4BCB3] bg-[#FCFAF8] p-6 text-center">
              <Shirt size={40} strokeWidth={1} className="mb-2" />
              <span className="text-xs opacity-70 font-medium text-[#8A827A]">
                {outfit.products?.length || 0} items
              </span>
            </div>
          )}

          {/* Overlay Metadata */}
          <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/60 to-transparent flex justify-between">
            {outfit.isPrivate && (
              <span className="px-2 py-1 text-xs font-medium text-black bg-[#D1C3B4] rounded-md shadow">
                Draft
              </span>
            )}
            {outfit.user && (
              <div className="ml-auto flex shrink-0 -m-1">
                <UserBubble
                  user={outfit.user}
                  isOwner={outfit.user.id === tripOwner?.id}
                />
              </div>
            )}
          </div>
        </div>

        {isWardrobe && (
          <div className="mt-3 px-1 flex flex-col gap-2 relative z-10 block">
            <select
              className="w-full py-2 px-3 bg-white border border-[#EAE5DF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D1C3B4]"
              onChange={(e) => {
                e.stopPropagation();
                if (e.target.value) {
                  handleAssignToDay(outfit.id, parseInt(e.target.value, 10));
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Assign to Event...
              </option>
              {days.map((d) => (
                <option key={d} value={d}>
                  Day {d}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Look Metadata */}
        <div className="mt-3 px-1 flex flex-col gap-1 w-full">
          <div className="flex flex-col items-start gap-1.5 w-full">
            <h3 className="text-[15px] font-semibold text-[#3C3833] leading-tight line-clamp-1 w-full">
              {outfit.name || "Untitled Look"}
            </h3>
            {outfit.activity && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#A69B90] bg-[#FCFAF8] border border-[#EAE5DF] px-2 py-0.5 rounded-full line-clamp-1 max-w-full">
                {outfit.activity}
              </span>
            )}
          </div>
          {outfit.locationUrl && (
            <a
              href={outfit.locationUrl}
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#8A827A] truncate hover:text-[#3C3833] hover:underline flex items-center gap-1 mt-0.5"
            >
              📍 {outfit.locationUrl.replace(/^https?:\/\//, "")}
            </a>
          )}
          {outfit.description && (
            <p className="text-xs text-[#5C564D] line-clamp-2 mt-1 leading-snug">
              {outfit.description}
            </p>
          )}
        </div>

        {/* Mini Products Row */}
        {outfit.products && outfit.products.length > 0 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
            {outfit.products.map((prod: any) => {
              const dImg = getDisplayUrl(prod.imageUrl);
              return (
                <div
                  key={prod.id}
                  className="w-14 h-14 shrink-0 bg-white border border-[#EAE5DF] rounded-md overflow-hidden relative group cursor-pointer"
                  title={prod.name + " • " + prod.category}
                >
                  {dImg ? (
                    <img
                      src={dImg}
                      onError={(e) => handleImageError(e, dImg)}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#8A827A] p-1 text-center bg-[#FCFAF8]">
                      <span className="text-[9px] font-medium truncate w-full">
                        {prod.name}
                      </span>
                      <span className="text-[7px] uppercase tracking-wider mt-0.5 opacity-60">
                        {prod.category.substring(0, 3)}
                      </span>
                    </div>
                  )}
                  {canEditOutfit && (
                    <button
                      onClick={(e) =>
                        handleRemoveProductFromLook(e, prod.id, outfit.id)
                      }
                      className="absolute top-0 right-0 z-10 w-4 h-4 flex items-center justify-center bg-white/90 backdrop-blur-sm text-[#8A827A] hover:text-red-500 rounded-bl-md opacity-0 group-hover:opacity-100 transition-all text-[8px]"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const handleCopyInvite = async () => {
    const inviteUrl = `${window.location.origin}/join/${tripId}`;
    const shareData = {
      title: `You're invited: ${tripName}`,
      text: `Join the lookbook for ${tripName} on VibeCheck!`,
      url: inviteUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    }

    // Fallback
    navigator.clipboard.writeText(inviteUrl);
    alert("Invite link copied to clipboard!");
  };

  return (
    <>
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 py-3 px-4 sm:p-6 bg-white/80 backdrop-blur-xl border-b border-[#EAE5DF]/50 w-full overflow-hidden">
        <div className="flex items-center gap-3 w-full max-w-7xl mx-auto">
          <Link
            href="/"
            replace
            className="shrink-0 group flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#EAE5DF] bg-white shadow-sm hover:border-[#A69B90] hover:bg-[#F5F2EE] transition-all active:scale-95 relative focus:outline-none focus:ring-2 focus:ring-[#D1C3B4] text-[#8A827A] hover:text-[#3C3833]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-2xl font-semibold tracking-wide text-[#3C3833] line-clamp-1">
                  {tripName}
                </h1>
                <span className="text-[11px] sm:text-xs font-medium text-[#8A827A] tracking-wider uppercase mt-0.5">
                  {tripDurationDays} {tripDurationDays === 1 ? 'Day' : 'Days'}
                </span>
              </div>
              <div className="flex gap-1.5 sm:gap-2 shrink-0">
                <button
                  onClick={() => setActiveEditTripModal(true)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-sm font-medium transition-all active:scale-95 bg-white border border-[#EAE5DF] rounded-full text-[#3C3833] hover:bg-[#FCFAF8] shadow-sm flex items-center gap-1.5"
                >
                  <span className="hidden sm:inline">Edit Trip</span>
                  <span className="sm:hidden">Edit</span>
                </button>
                <button
                  onClick={handleCopyInvite}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-sm font-medium transition-all active:scale-95 bg-white border border-[#EAE5DF] rounded-full text-[#3C3833] hover:bg-[#FCFAF8] shadow-sm flex items-center gap-1.5"
                >
                  <UserPlus size={14} className="sm:w-4 sm:h-4 text-[#8A827A]" />
                  <span className="hidden sm:inline">Invite Friends</span>
                  <span className="sm:hidden">Invite</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-1 sm:mt-1.5 overflow-x-auto hide-scrollbar w-full py-0.5">
              <span className="text-[10px] sm:text-sm text-[#8A827A] font-medium tracking-wide whitespace-nowrap shrink-0">
                {tripStartDate.toLocaleDateString(undefined, dateOptions)} —{" "}
                {tripEndDate.toLocaleDateString(undefined, dateOptions)}
              </span>

              {(tripOwner || (tripMembers && tripMembers.length > 0)) && (
                <div className="flex -space-x-1.5 z-20 items-center pl-3 border-l border-[#EAE5DF] shrink-0 pb-0.5 pt-0.5 pr-1">
                  {tripOwner && <UserBubble user={tripOwner} isOwner={true} />}
                  {tripMembers
                    ?.filter((m: any) => m.userId !== tripOwner?.id)
                    .map((member: any) => (
                      <UserBubble
                        key={member.id}
                        user={member.user}
                        isOwner={false}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <main className="max-w-md px-4 py-8 mx-auto sm:max-w-2xl">
        {activeTab === "itinerary" && tripShowWeather && weatherData && !weatherData.error && (
          <div className="mb-6 bg-white border border-[#EAE5DF] rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden flex flex-col p-4 sm:p-5 bg-gradient-to-r from-white to-[#FCFAF8]">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{weatherData.icon}</span>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2 mb-0.5 mt-0.5">
                  <span className="text-xl font-light tracking-tighter text-[#3C3833]">
                    H: {weatherData.highC}°C | L: {weatherData.lowC}°C
                  </span>
                  <span className="text-sm font-medium text-[#8A827A]">
                    • {weatherData.conditions}
                  </span>
                </div>
                <h3 className="text-[11px] font-medium text-[#8A827A]">
                  {weatherData.isHistorical
                    ? "Historical estimate for "
                    : "Trip forecast for "}
                  {tripWeatherLocation}
                </h3>
              </div>
            </div>

            {weatherData.aiSummary && (
              <div className="mt-4 pt-4 border-t border-[#EAE5DF]/60">
                <p className="text-sm text-[#5C564D] leading-relaxed max-w-3xl">
                  {weatherData.aiSummary}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tabs - Hidden on Mobile */}
        <div className="hidden xl:flex border-b border-[#EAE5DF] mb-8 sticky top-[73px] xl:top-[89px] bg-white/70 backdrop-blur-xl z-20 -mx-4 px-4 xl:-mx-0 xl:px-0">
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "itinerary" ? "border-[#3C3833] text-[#3C3833]" : "border-transparent text-[#8A827A] hover:text-[#3C3833]"}`}
            onClick={() => setActiveTab("itinerary")}
          >
            Events
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "catalog" ? "border-[#3C3833] text-[#3C3833]" : "border-transparent text-[#8A827A] hover:text-[#3C3833]"}`}
            onClick={() => setActiveTab("catalog")}
          >
            Products
          </button>
        </div>

        {activeTab === "itinerary" && (
          <div className="relative animate-in fade-in duration-500">
            {/* Header & Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 mt-2 sm:mt-0">
              <div>
                <h3 className="text-2xl font-light tracking-tight text-[#3C3833]">
                  Events
                </h3>
                <p className="text-sm text-[#8A827A]">
                  Daily itinerary and scheduled looks.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <select
                  className="w-full sm:w-auto px-3 py-2 text-sm bg-white border border-[#EAE5DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D1C3B4] text-[#3C3833]"
                  value={eventsOwnerFilter}
                  onChange={(e) => setEventsOwnerFilter(e.target.value)}
                >
                  <option value="mine">Your Looks</option>
                  <option value="all">Everyone's Looks</option>
                </select>
              </div>
            </div>

            {/* Horizontal Day Snapping (Mobile & Desktop) */}
            <div className="sticky top-[71px] xl:top-[140px] z-20 -mx-4 px-4 xl:mx-0 xl:px-0 py-2 mb-6 bg-white/80 backdrop-blur-xl border-b border-[#EAE5DF]/50 overflow-x-auto flex gap-3 hide-scrollbar snap-x shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
              {days.map((d) => (
                <a
                  key={d}
                  href={`#day-${d}`}
                  className="px-5 py-2.5 rounded-full whitespace-nowrap bg-[#F5F2EE] text-sm font-medium text-[#8A827A] snap-start hover:bg-[#EAE5DF] hover:text-[#3C3833] transition-colors active:scale-95"
                >
                  Day {d}
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-12 sm:gap-16">
              {days.map((dayNum) => {
                const baseOutfits = outfitsByDay[dayNum] || [];
                const dayOutfits = baseOutfits.filter((o: any) => eventsOwnerFilter === "all" || o.userId === currentUserId);

                // Calculate the actual date for this slot
                const currentDate = new Date(tripStartDate);
                currentDate.setDate(currentDate.getDate() + (dayNum - 1));

                const formatter = new Intl.DateTimeFormat("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                });

                // Check if currently rendering today's date
                const isToday =
                  new Date().toDateString() === currentDate.toDateString();

                return (
                  <div
                    key={dayNum}
                    id={`day-${dayNum}`}
                    className="flex flex-col gap-4 animate-in slide-in-from-bottom-8 fade-in duration-700"
                    style={{
                      animationDelay: `${dayNum * 50}ms`,
                      animationFillMode: "both",
                    }}
                  >
                    {/* Day Header */}
                    <div className="flex items-center gap-4 group">
                      <div
                        className="flex flex-col items-center justify-center w-12 h-12 bg-[#D1C3B4] text-[#3C3833] rounded-xl shrink-0 font-medium cursor-pointer"
                        onClick={() => setActiveDayModal(dayNum)}
                      >
                        <span className="text-xs uppercase opacity-80 leading-none mb-0.5">
                          Day
                        </span>
                        <span className="text-lg leading-none">{dayNum}</span>
                      </div>
                      <div className="flex flex-col flex-grow items-start">
                        <h2 className="text-xl font-medium tracking-wide text-[#3C3833] flex items-center gap-2">
                          {formatter.format(currentDate)}
                          {tripShowWeather && weatherData?.dailyIcons?.[dayNum - 1] && (
                            <span className="text-lg" title="Daily Forecast">
                              {weatherData.dailyIcons[dayNum - 1]}
                            </span>
                          )}
                          {isToday && (
                            <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 rounded-full shadow-sm">
                              Today
                            </span>
                          )}
                        </h2>
                        {tripShowWeather && weatherData?.dailySummaries?.[dayNum - 1] && (
                          <p className="text-xs font-medium text-[#8A827A] mt-1 pr-4">
                            ✨ {weatherData.dailySummaries[dayNum - 1]}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          {(dayDetails[dayNum]?.activities || "")
                            .split(" ||| ")
                            .filter(Boolean)
                            .map((plan: string, idx: number) => (
                              <div
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F5F2EE] border border-[#EAE5DF] rounded-md group/edit shadow-sm"
                              >
                                <span className="text-xs font-medium text-[#5C564D] line-clamp-1">
                                  {plan}
                                </span>
                                <span
                                  onClick={() =>
                                    handleDeleteDayActivity(dayNum, idx)
                                  }
                                  className="text-[10px] cursor-pointer opacity-0 group-hover/edit:opacity-100 transition-opacity hover:text-red-500"
                                  title="Remove plan"
                                >
                                  ✕
                                </span>
                              </div>
                            ))}

                          {editingDayDetails === dayNum ? (
                            <form
                              onSubmit={(e) => handleSaveDayDetails(dayNum, e)}
                              className="flex items-center gap-2 w-full max-w-sm"
                            >
                              <input
                                type="text"
                                name="activities"
                                placeholder="Add another plan..."
                                className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#EAE5DF] rounded-md focus:outline-none focus:ring-1 focus:ring-[#D1C3B4] text-[#3C3833]"
                                autoFocus
                              />
                              <button
                                type="submit"
                                className="text-xs px-3 py-1.5 bg-[#3C3833] text-white rounded-md hover:bg-black transition-colors shadow-sm"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingDayDetails(null)}
                                className="text-xs px-2 py-1.5 text-[#8A827A] hover:bg-[#EAE5DF] rounded-md transition-colors"
                              >
                                ✕
                              </button>
                            </form>
                          ) : (
                            <button
                              onClick={() => setEditingDayDetails(dayNum)}
                              className="text-xs font-medium text-[#A69B90] hover:text-[#59524A] flex items-center gap-1 transition-colors"
                            >
                              <span>+ Add event or activities</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveDayModal(dayNum)}
                        className="px-3 py-1.5 text-xs font-medium text-[#8A827A] border border-[#C4BCB3] transition-colors bg-white hover:bg-[#FCFAF8] rounded-lg opacity-0 group-hover:opacity-100 hidden sm:block"
                      >
                        + Add Look
                      </button>
                    </div>

                    {/* Day Content Area */}
                    <div className="relative pl-6 ml-6 border-l-2 border-[#EAE5DF]">
                      {dayOutfits.length === 0 ? (
                        <div
                          onClick={() => setActiveDayModal(dayNum)}
                          className="flex items-center justify-center h-14 border-2 border-dashed border-[#C4BCB3] rounded-xl bg-white transition-colors hover:border-[#A69B90] hover:bg-[#FCFAF8] cursor-pointer group"
                        >
                          <span className="text-[#8A827A] font-medium text-sm transition-transform group-hover:scale-105">
                            + Add Look to Day {dayNum}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-6">
                          <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3">
                            {dayOutfits.map((outfit) =>
                              renderOutfit(outfit, false),
                            )}
                          </div>
                          <div
                            onClick={() => setActiveDayModal(dayNum)}
                            className="flex items-center justify-center h-14 border-2 border-dashed border-[#C4BCB3] rounded-xl bg-white transition-colors hover:border-[#A69B90] hover:bg-[#FCFAF8] cursor-pointer group"
                          >
                            <span className="text-[#8A827A] font-medium text-sm transition-transform group-hover:scale-105">
                              + Add Another Look
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "catalog" && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-light tracking-tight text-[#3C3833]">
                  The Pieces
                </h3>
                <p className="text-sm text-[#8A827A]">
                  Individual items you are bringing on this trip.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <select
                  className="w-full sm:w-auto px-3 py-2 text-sm bg-white border border-[#EAE5DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D1C3B4] text-[#3C3833]"
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value)}
                >
                  <option value="mine">My Pieces</option>
                  <option value="all">Everyone's Pieces</option>
                </select>
                <select
                  className="w-full sm:w-auto px-3 py-2 text-sm bg-white border border-[#EAE5DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D1C3B4] text-[#3C3833]"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="top">Top</option>
                  <option value="bottoms">Bottoms</option>
                  <option value="dress">Dress / One-Piece</option>
                  <option value="shoes">Shoes</option>
                  <option value="accessories">Accessories</option>
                  <option value="outerwear">Outerwear</option>
                </select>
                <button
                  onClick={() => setActiveCatalogModal(true)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white transition-colors bg-[#3C3833] rounded-full hover:bg-black shadow-sm whitespace-nowrap lg:shrink-0"
                >
                  + Add Product
                </button>
              </div>
            </div>

            {!products || products.length === 0 ? (
              <div
                onClick={() => setActiveCatalogModal(true)}
                className="flex items-center justify-center h-48 border-2 border-dashed border-[#C4BCB3] rounded-xl bg-white transition-colors cursor-pointer group hover:bg-[#FCFAF8] hover:border-[#A69B90]"
              >
                <span className="text-[#8A827A] font-medium transition-transform group-hover:scale-105">
                  + Add an item to your products
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products
                  .filter(
                    (p) =>
                      categoryFilter === "all" || p.category === categoryFilter,
                  )
                  .filter(
                    (p) =>
                      ownerFilter === "all" || p.userId === currentUserId,
                  )
                  .map((p: any) => (
                    <div
                      key={p.id}
                      onClick={() => setEditingProduct(p)}
                      className="cursor-pointer relative flex flex-col items-center p-3 bg-white border border-[#EAE5DF] rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(p.id);
                        }}
                        className="absolute top-1 right-1 z-10 w-6 h-6 flex items-center justify-center bg-white/80 backdrop-blur-sm text-[#8A827A] hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                      >
                        ✕
                      </button>

                      <div className="w-full aspect-square bg-[#FCFAF8] rounded-lg overflow-hidden border border-[#EAE5DF] mb-3 relative">
                        {p.imageUrl ? (
                          <img
                            src={getDisplayUrl(p.imageUrl)}
                            onError={(e) => handleImageError(e, p.imageUrl)}
                            alt={p.name}
                            className="object-cover relative w-full h-full hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-[#8A827A] text-xs">
                            No Image
                          </div>
                        )}
                        {p.user && (
                          <div className="absolute bottom-2 left-2 z-10 scale-90 shadow-[0_2px_8px_rgba(0,0,0,0.1)] rounded-full border border-white/60">
                            <UserBubble user={p.user} isOwner={p.userId === tripOwner?.id} />
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-[#3C3833] line-clamp-1 w-full text-center">
                        {p.name}
                      </h3>
                      <p className="text-xs text-[#8A827A] capitalize">
                        {p.category}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        <footer className="w-full text-center py-12 text-xs text-[#8A827A] group flex justify-center items-center gap-1 font-medium mt-12 border-t border-[#EAE5DF]/50">
          vibecoded by keishia
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            ✨
          </span>
        </footer>
      </main>{" "}
      <AddLookModal
        isOpen={activeDayModal !== null || editingOutfit !== null}
        onClose={() => {
          setActiveDayModal(null);
          setEditingOutfit(null);
        }}
        tripId={tripId}
        dayNumber={
          editingOutfit
            ? editingOutfit.dayNumber
            : activeDayModal === 0
              ? null
              : activeDayModal!
        }
        catalogProducts={products || []}
        savedOutfits={savedOutfits}
        existingOutfit={editingOutfit}
        currentUserId={currentUserId}
        dayActivities={
          activeDayModal !== null && activeDayModal > 0
            ? (dayDetails[activeDayModal]?.activities || "").split(" ||| ").filter(Boolean)
            : editingOutfit?.dayNumber
              ? (dayDetails[editingOutfit.dayNumber]?.activities || "").split(" ||| ").filter(Boolean)
              : []
        }
      />
      <AddProductModal
        isOpen={activeCatalogModal}
        onClose={() => setActiveCatalogModal(false)}
        tripId={tripId}
      />
      <EditProductModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        tripId={tripId}
        product={editingProduct}
      />
      <CreateTripModal
        isOpen={activeEditTripModal}
        onClose={() => setActiveEditTripModal(false)}
        existingTrip={{
          id: tripId,
          name: tripName,
          startDate: tripStartDate,
          endDate: tripEndDate,
          locationUrl: tripLocationUrl,
          locationImageUrl: tripLocationImageUrl,
        }}
      />

      {/* Mobile Bottom Tab Bar */}
      <nav className="xl:hidden fixed bottom-0 left-0 w-full z-40 bg-white/80 backdrop-blur-xl border-t border-[#EAE5DF]/50 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 flex justify-center shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <div className="w-full max-w-md flex justify-around items-center">
          <button
            onClick={() => setActiveTab("itinerary")}
            className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${activeTab === "itinerary" ? "text-[#3C3833]" : "text-[#8A827A]"}`}
          >
            <CalendarDays strokeWidth={activeTab === "itinerary" ? 2.5 : 1.5} size={24} />
            <span className="text-[10px] font-medium">Events</span>
          </button>
          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${activeTab === "catalog" ? "text-[#3C3833]" : "text-[#8A827A]"}`}
          >
            <ShoppingBag strokeWidth={activeTab === "catalog" ? 2.5 : 1.5} size={24} />
            <span className="text-[10px] font-medium">Products</span>
          </button>
        </div>
      </nav>
    </>
  );
}
