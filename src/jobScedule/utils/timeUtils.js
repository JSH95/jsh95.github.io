
export function adjustTime(timeStr) {
    if (!timeStr) return { time: timeStr };

    const [hourStr, minStr] = timeStr.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minStr, 10);

    if (isNaN(hour) || isNaN(minute)) {
        return {time: timeStr }; // 파싱 실패 시 원본 반환
    }
    if (hour < 24) {
        return {
            time: `${hourStr.padStart(2, "0")}:${minStr.padStart(2, "0")}`,
        };
    }
    const newHour = hour - 24;
    return {
        time: `${String(newHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    };
}
