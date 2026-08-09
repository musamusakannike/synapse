"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localDayKey = localDayKey;
exports.dayKeyToDate = dayKeyToDate;
exports.dateToDayKey = dateToDayKey;
exports.daysBetweenKeys = daysBetweenKeys;
exports.localHour = localHour;
exports.localMinute = localMinute;
exports.startOfLocalDay = startOfLocalDay;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
/**
 * The calendar day a moment falls on *from the user's point of view*, as
 * `YYYY-MM-DD`. Everything streak- and reminder-related is keyed off this
 * rather than off UTC, so someone studying at 11pm in Lagos doesn't get
 * credited to the next day.
 *
 * @param offsetMinutes Minutes ahead of UTC (Lagos = 60, New York EDT = -240).
 */
function localDayKey(date, offsetMinutes) {
    return new Date(date.getTime() + offsetMinutes * 60_000).toISOString().slice(0, 10);
}
/**
 * Anchors a day key back to a storable Date (midnight UTC of that key). These
 * are calendar markers, not real instants — only ever compare them to each
 * other via {@link daysBetweenKeys}.
 */
function dayKeyToDate(key) {
    return new Date(`${key}T00:00:00.000Z`);
}
function dateToDayKey(date) {
    return date.toISOString().slice(0, 10);
}
/** Whole days from `from` to `to`; negative if `to` is earlier. */
function daysBetweenKeys(from, to) {
    return Math.round((dayKeyToDate(to).getTime() - dayKeyToDate(from).getTime()) / MS_PER_DAY);
}
/** The user's local hour (0-23) at a given moment. */
function localHour(date, offsetMinutes) {
    return new Date(date.getTime() + offsetMinutes * 60_000).getUTCHours();
}
/** The user's local minute (0-59) at a given moment. */
function localMinute(date, offsetMinutes) {
    return new Date(date.getTime() + offsetMinutes * 60_000).getUTCMinutes();
}
/**
 * The UTC instant at which the user's current local day began. Used to ask
 * "has this user studied today?" against `createdAt` timestamps.
 */
function startOfLocalDay(date, offsetMinutes) {
    const key = localDayKey(date, offsetMinutes);
    return new Date(dayKeyToDate(key).getTime() - offsetMinutes * 60_000);
}
