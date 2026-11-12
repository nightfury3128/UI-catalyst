<script>
	import { CURRENT_TERM_ID, enrollment } from '#lib/stores/enrollment.svelte.js';

	const schedule = $derived(enrollment.enrolledByTerm[CURRENT_TERM_ID] ?? []);

	let view = $state('calendar');

	const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
	/** @type {Record<string, string>} */
	const dayHeaderLabels = {
		Mon: 'MON 9',
		Tue: 'TUE 10',
		Wed: 'WED 11',
		Thu: 'THU 12',
		Fri: 'FRI 13'
	};

	const startHour = 9;
	const totalHours = 7;
	const rowHeight = 56;
	const calendarHeight = totalHours * rowHeight;
	const hourLabels = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM'];
	const hourLineIndexes = Array.from({ length: totalHours + 1 }, (_, i) => i);

	const palette = [
		{ bg: '#dce8f6', accent: '#1f4e85' },
		{ bg: '#d7ead9', accent: '#2f7a3a' },
		{ bg: '#fbe6b9', accent: '#8a5a0a' },
		{ bg: '#f8d3d9', accent: '#a0233e' },
		{ bg: '#e2d4ef', accent: '#653294' },
		{ bg: '#c9e8e3', accent: '#0d615d' },
		{ bg: '#fcd6b4', accent: '#a0470a' }
	];

	/** @param {string} hhmm @param {string} meridiem */
	function to24(hhmm, meridiem) {
		const [h, m] = hhmm.split(':').map(Number);
		let hour = h ?? 0;
		if (meridiem === 'AM' && hour === 12) hour = 0;
		if (meridiem === 'PM' && hour !== 12) hour += 12;
		return hour + (m ?? 0) / 60;
	}

	/** @param {string} text @returns {{ start: number, end: number } | null} */
	function parseTime(text) {
		const parts = text.split(/\s*[–-]\s*/).map((s) => s.trim());
		if (parts.length !== 2) return null;
		const [startRaw, endRaw] = parts;
		const endMer = /AM|PM/i.exec(endRaw)?.[0]?.toUpperCase() ?? 'AM';
		const startMer = /AM|PM/i.exec(startRaw)?.[0]?.toUpperCase() ?? endMer;
		/** @param {string} s */
		const strip = (s) => s.replace(/\s*(AM|PM)\s*/i, '');
		return {
			start: to24(strip(startRaw), startMer),
			end: to24(strip(endRaw), endMer)
		};
	}

	/** @param {string} text */
	function parseDays(text) {
		return text.split('/').map((s) => s.trim());
	}

	const blocks = $derived(
		schedule.flatMap((course, idx) => {
			const t = parseTime(course.time);
			if (!t) return [];
			const days = parseDays(course.days);
			const color = palette[idx % palette.length];
			return days
				.filter((d) => dayOrder.includes(d))
				.map((day) => ({
					code: course.code,
					name: course.name,
					location: course.location,
					time: course.time,
					day,
					top: (t.start - startHour) * rowHeight,
					height: Math.max((t.end - t.start) * rowHeight - 2, 32),
					color
				}));
		})
	);

	const blocksByDay = $derived(
		Object.fromEntries(dayOrder.map((d) => [d, blocks.filter((b) => b.day === d)]))
	);

	const legend = $derived(
		schedule.map((c, i) => ({
			code: c.code,
			name: c.name,
			color: palette[i % palette.length]
		}))
	);
</script>

<section class="wrap">
	<div class="head">
		<h2>Your class schedule</h2>
		<a class="manage-link" href="/classes">Manage classes →</a>
	</div>

	<div class="panel">
		<div class="toolbar">
			<div class="week">
				<span class="chip">This week</span>
				<span>Nov 9 – 13, 2026</span>
			</div>

			<div class="view-toggle" role="tablist" aria-label="Schedule view">
				<button
					type="button"
					role="tab"
					aria-selected={view === 'list'}
					class:active={view === 'list'}
					onclick={() => (view = 'list')}
				>
					List view
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={view === 'calendar'}
					class:active={view === 'calendar'}
					onclick={() => (view = 'calendar')}
				>
					Calendar view
				</button>
			</div>
		</div>

		{#if view === 'list'}
			<table>
				<thead>
					<tr>
						<th>Class</th>
						<th>Meets</th>
						<th>Location</th>
					</tr>
				</thead>
				<tbody>
					{#each schedule as course}
						<tr>
							<td>
								<strong>{course.code}</strong>
								<div>{course.name}</div>
							</td>
							<td>
								{course.days}
								<div>{course.time}</div>
							</td>
							<td>{course.location}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<div class="calendar">
				<div class="cal-grid">
					<div class="corner"></div>
					{#each dayOrder as day}
						<div class="day-header">{dayHeaderLabels[day]}</div>
					{/each}

					<div class="time-col" style="height: {calendarHeight}px">
						{#each hourLabels as label, i}
							<span class="time-label" style="top: {i * rowHeight - 6}px">{label}</span>
						{/each}
					</div>

					{#each dayOrder as day}
						<div class="day-slots" style="height: {calendarHeight}px">
							{#each hourLineIndexes as i}
								<div class="hour-line" style="top: {i * rowHeight}px"></div>
							{/each}
							{#each blocksByDay[day] as b}
								<div
									class="block"
									style="top: {b.top + 2}px; height: {b.height}px; background: {b.color.bg}"
								>
									<span class="accent" style="background: {b.color.accent}"></span>
									<strong>{b.code}</strong>
									<p>{b.time}</p>
									<p class="muted">{b.location}</p>
								</div>
							{/each}
						</div>
					{/each}
				</div>

				<div class="legend">
					{#each legend as item}
						<div class="legend-item">
							<span class="dot" style="background: {item.color.accent}"></span>
							<span>{item.code} · {item.name}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</section>

<style>
	.wrap {
		margin-top: 20px;
	}

	.head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 10px;
		gap: 12px;
	}

	h2 {
		font-size: 18px;
		font-weight: normal;
	}

	.manage-link {
		font-size: 13px;
		color: var(--text);
		text-decoration: underline;
	}

	.panel {
		background: var(--surface);
		border: 1px solid var(--line);
	}

	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
		border-bottom: 1px solid var(--line);
		font-size: 13px;
		color: var(--muted);
	}

	.week {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.chip {
		background: var(--chip);
		color: var(--text);
		padding: 3px 8px;
		font-size: 11px;
	}

	.view-toggle {
		display: inline-flex;
		background: var(--page);
		padding: 3px;
		gap: 2px;
	}

	.view-toggle button {
		background: transparent;
		border: 0;
		padding: 5px 10px;
		font: inherit;
		font-size: 11px;
		color: var(--muted);
		cursor: pointer;
	}

	.view-toggle button.active {
		background: var(--text);
		color: var(--page);
		font-weight: bold;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}

	th,
	td {
		text-align: left;
		padding: 10px 12px;
		border-bottom: 1px solid var(--line);
		vertical-align: top;
	}

	th {
		font-size: 12px;
		color: var(--muted);
		font-weight: normal;
	}

	td div {
		color: var(--muted);
		font-size: 12px;
		margin-top: 2px;
	}

	.calendar {
		padding: 10px 14px 14px;
	}

	.cal-grid {
		display: grid;
		grid-template-columns: 56px repeat(5, minmax(0, 1fr));
		grid-template-rows: 24px auto;
	}

	.corner {
		grid-column: 1;
		grid-row: 1;
	}

	.day-header {
		font-size: 10px;
		font-weight: bold;
		color: var(--muted);
		letter-spacing: 0.04em;
		text-align: center;
		padding: 4px 0;
	}

	.time-col {
		position: relative;
		grid-column: 1;
	}

	.time-label {
		position: absolute;
		right: 10px;
		font-size: 10px;
		color: var(--muted);
	}

	.day-slots {
		position: relative;
		border-left: 1px solid var(--line);
	}

	.day-slots:last-child {
		border-right: 1px solid var(--line);
	}

	.hour-line {
		position: absolute;
		left: 0;
		right: 0;
		height: 1px;
		background: var(--line);
	}

	.block {
		position: absolute;
		left: 4px;
		right: 4px;
		padding: 6px 8px 5px 12px;
		overflow: hidden;
		font-size: 12px;
		color: #111b2f;
		border: 1px solid rgba(17, 27, 47, 0.2);
		border-radius: 3px;
	}

	.block strong {
		font-size: 13px;
		font-weight: bold;
		display: block;
		color: #111b2f;
		line-height: 1.15;
	}

	.block p {
		margin: 3px 0 0;
		font-size: 12px;
		color: #111b2f;
		line-height: 1.2;
	}

	.block .muted {
		color: #3a4150;
		font-size: 11.5px;
	}

	.accent {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		width: 4px;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 10px 24px;
		margin-top: 16px;
		padding-top: 14px;
		border-top: 1px solid var(--line);
		font-size: 11px;
		color: var(--muted);
	}

	.legend-item {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.dot {
		width: 6px;
		height: 6px;
		display: inline-block;
	}

	@media (max-width: 900px) {
		.cal-grid {
			grid-template-columns: 44px repeat(5, minmax(0, 1fr));
		}

		.block strong {
			font-size: 12px;
		}

		.block p {
			font-size: 11px;
		}

		.block .muted {
			font-size: 10.5px;
		}
	}

	@media (max-width: 700px) {
		.calendar {
			display: none;
		}

		table,
		thead,
		tbody,
		tr,
		th,
		td {
			display: block;
		}

		thead {
			display: none;
		}

		tr {
			padding: 10px 12px;
			border-bottom: 1px solid var(--line);
		}

		td {
			border: 0;
			padding: 2px 0;
		}
	}
</style>
