/** Utilities for generating an iCalendar (.ics) file from the student schedule. */

const DAY_CODES = { Mon: 'MO', Tue: 'TU', Wed: 'WE', Thu: 'TH', Fri: 'FR', Sat: 'SA', Sun: 'SU' };

/**
 * Parse "9:00 – 11:50 AM" style strings into 24h {h, m}.
 * @param {string} range
 * @returns {{ start: { h: number, m: number }, end: { h: number, m: number } } | null}
 */
function parseTimeRange(range) {
	const parts = range.split(/\s*[–-]\s*/).map((s) => s.trim());
	if (parts.length !== 2) return null;
	const [startRaw, endRaw] = parts;
	const endMer = (/AM|PM/i.exec(endRaw)?.[0] ?? 'AM').toUpperCase();
	const startMer = (/AM|PM/i.exec(startRaw)?.[0] ?? endMer).toUpperCase();
	const strip = (/** @type {string} */ s) => s.replace(/\s*(AM|PM)\s*/i, '').trim();
	/** @param {string} t @param {string} mer */
	const parse = (t, mer) => {
		const [hRaw, mRaw] = t.split(':');
		let h = Number(hRaw);
		const m = Number(mRaw ?? 0);
		if (mer === 'AM' && h === 12) h = 0;
		if (mer === 'PM' && h !== 12) h += 12;
		return { h, m };
	};
	return { start: parse(strip(startRaw), startMer), end: parse(strip(endRaw), endMer) };
}

/** @param {string} daysText */
function parseDays(daysText) {
	return daysText
		.split('/')
		.map((s) => s.trim())
		.filter((d) => d in DAY_CODES);
}

/** @param {Date} d @param {{h:number, m:number}} time */
function withTime(d, time) {
	const out = new Date(d);
	out.setHours(time.h, time.m, 0, 0);
	return out;
}

/**
 * Advance `date` to the next occurrence of `targetDay` (0=Sun .. 6=Sat), including today.
 * @param {Date} date @param {number} targetDay
 */
function nextWeekday(date, targetDay) {
	const out = new Date(date);
	const delta = (targetDay - out.getDay() + 7) % 7;
	out.setDate(out.getDate() + delta);
	return out;
}

const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** @param {Date} d */
function formatLocal(d) {
	const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');
	return (
		`${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(
			d.getMinutes()
		)}00`
	);
}

/** @param {string} s */
function escapeText(s) {
	return String(s)
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/,/g, '\\,')
		.replace(/;/g, '\\;');
}

/** @param {Date} d */
function formatUtc(d) {
	const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');
	return (
		`${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
			d.getUTCHours()
		)}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
	);
}

/**
 * Build a VCALENDAR string for the given enrolled courses.
 * @param {Array<{ code: string, name?: string, days: string, time: string, location?: string, instructor?: string, section?: string }>} courses
 * @param {{ termStart: Date, termEnd: Date, tzid?: string, calendarName?: string }} opts
 */
export function buildCalendar(courses, opts) {
	const { termStart, termEnd, tzid = 'America/New_York', calendarName = 'Catalyst schedule' } =
		opts;
	const now = new Date();
	const stamp = formatUtc(now);

	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Catalyst//Student portal//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		`X-WR-CALNAME:${escapeText(calendarName)}`,
		`X-WR-TIMEZONE:${tzid}`
	];

	for (const course of courses) {
		const t = parseTimeRange(course.time);
		if (!t) continue;
		const days = parseDays(course.days);
		if (days.length === 0) continue;

		// Anchor each day to its first occurrence on or after termStart.
		for (const day of days) {
			const dayIdx = DAY_INDEX[/** @type {keyof typeof DAY_INDEX} */ (day)];
			const first = withTime(nextWeekday(termStart, dayIdx), t.start);
			const firstEnd = withTime(first, t.end);
			const until = new Date(termEnd);
			until.setHours(23, 59, 59, 0);

			lines.push(
				'BEGIN:VEVENT',
				`UID:${course.code}-${day}-${first.getTime()}@catalyst`,
				`DTSTAMP:${stamp}`,
				`SUMMARY:${escapeText(`${course.code} — ${course.name ?? ''}`.trim())}`,
				`DTSTART;TZID=${tzid}:${formatLocal(first)}`,
				`DTEND;TZID=${tzid}:${formatLocal(firstEnd)}`,
				`RRULE:FREQ=WEEKLY;BYDAY=${DAY_CODES[/** @type {keyof typeof DAY_CODES} */ (day)]};UNTIL=${formatUtc(until)}`
			);
			if (course.location) lines.push(`LOCATION:${escapeText(course.location)}`);
			const desc = [
				course.section ? `Section ${course.section}` : '',
				course.instructor ? `Instructor: ${course.instructor}` : ''
			]
				.filter(Boolean)
				.join(' · ');
			if (desc) lines.push(`DESCRIPTION:${escapeText(desc)}`);
			lines.push('END:VEVENT');
		}
	}

	lines.push('END:VCALENDAR');
	// ICS wants CRLF line endings.
	return lines.join('\r\n') + '\r\n';
}

/**
 * Trigger a browser download of the given calendar.
 * @param {string} icsText
 * @param {string} filename
 */
export function downloadIcs(icsText, filename) {
	if (typeof document === 'undefined') return;
	const blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}
