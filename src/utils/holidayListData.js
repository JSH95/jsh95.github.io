import { gapi } from "gapi-script";

const API_KEY = "AIzaSyBuoYwHGk4XLCfalv3_N5PLDG8gq5kc74U"; // Google API 키
const CALENDAR_ID = "ko.japanese.official#holiday@group.v.calendar.google.com"; // 일본 공휴일 캘린더 ID

let cachedHolidays = null; // 캐싱하여 여러 번 호출해도 다시 요청하지 않음

const holidayListData = async () => {
    if (cachedHolidays) return cachedHolidays; // 이미 로드된 데이터가 있다면 반환

    try {
        await new Promise((resolve) => gapi.load("client", resolve));
        await gapi.client.init({ apiKey: API_KEY });

        const response = await gapi.client.request({
            path: `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`,
        });

        const formattedHolidays = {};
        response.result.items.forEach((event) => {
            const date = new Date(event.start.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            formattedHolidays[key] = event.summary;
        });

        cachedHolidays = formattedHolidays; // 캐싱하여 중복 요청 방지
        return formattedHolidays;
    } catch (err) {
        console.error("Error fetching holidays", err);
        return {};
    }
};

export default holidayListData;
