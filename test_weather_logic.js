const tripStartDate = new Date("2026-07-01");
const tripEndDate = new Date("2026-07-20");

const today = new Date();
let start = new Date(tripStartDate);
let end = new Date(tripEndDate);

const diffMs = end.getTime() - start.getTime();
if (diffMs > 14 * 24 * 60 * 60 * 1000) {
    end = new Date(start);
    end.setDate(start.getDate() + 14);
}

const minForecastDate = new Date();
minForecastDate.setDate(today.getDate() - 90);
const maxForecastDate = new Date();
maxForecastDate.setDate(today.getDate() + 14);

let isHistorical = false;
let startStr, endStr, apiUrl;

if (start >= minForecastDate && end <= maxForecastDate) {
    startStr = start.toISOString().split('T')[0];
    endStr = end.toISOString().split('T')[0];
    apiUrl = `forecast: start=${startStr} end=${endStr}`;
} else {
    isHistorical = true;
    const maxArchiveDate = new Date();
    maxArchiveDate.setDate(today.getDate() - 5);

    while (start > maxArchiveDate || end > maxArchiveDate) {
        start.setFullYear(start.getFullYear() - 1);
        end.setFullYear(end.getFullYear() - 1);
    }
    
    startStr = start.toISOString().split('T')[0];
    endStr = end.toISOString().split('T')[0];
    apiUrl = `archive: start=${startStr} end=${endStr}`;
}
console.log(apiUrl);
