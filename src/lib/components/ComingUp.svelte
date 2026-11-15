<script>
	import { finances, tasks } from '#lib/data/student.svelte.js';

	const today = new Date(2026, 10, 15); // Nov 15, 2026

	/** @param {string} dateStr */
	function parseDate(dateStr) {
		const d = new Date(dateStr);
		return Number.isNaN(d.getTime()) ? null : d;
	}

	/** @param {Date | null} d */
	function daysUntil(d) {
		if (!d) return null;
		const ms = d.getTime() - today.getTime();
		return Math.round(ms / (1000 * 60 * 60 * 24));
	}

	/** @param {Date | null} d */
	function daysSince(d) {
		if (!d) return null;
		const ms = today.getTime() - d.getTime();
		return Math.round(ms / (1000 * 60 * 60 * 24));
	}

	/** @param {number | null} n */
	function phraseUntil(n) {
		if (n === null) return '';
		if (n < 0) return `${Math.abs(n)}d overdue`;
		if (n === 0) return 'today';
		if (n === 1) return 'tomorrow';
		return `in ${n} days`;
	}

	/** @typedef {{
	 *   id: string, kind: 'hold'|'task'|'payment'|'enrollment',
	 *   title: string, meta: string, href: string,
	 *   sort: number, urgent?: boolean, overdue?: boolean
	 * }} Item */

	const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

	const items = $derived.by(() => {
		/** @type {Item[]} */
		const out = [];

		// Service indicators (holds) — surface first, no "due date" but very urgent
		for (const ind of tasks.indicators) {
			const since = parseDate(ind.since);
			const sd = daysSince(since);
			out.push({
				id: ind.id,
				kind: 'hold',
				title: ind.title,
				meta: `${ind.office}${sd !== null ? ` · placed ${sd}d ago` : ''}`,
				href: '/tasks',
				sort: -1000,
				urgent: true
			});
		}

		// To-do items
		for (const t of tasks.todo) {
			const due = parseDate(t.due);
			const n = daysUntil(due);
			out.push({
				id: t.id,
				kind: 'task',
				title: t.title,
				meta: `${t.office} · due ${t.due} (${phraseUntil(n)})`,
				href: '/tasks',
				sort: n ?? 9999,
				urgent: n !== null && n <= 7,
				overdue: n !== null && n < 0
			});
		}

		// Tuition payment
		{
			const due = parseDate(finances.balance.dueDate);
			const n = daysUntil(due);
			out.push({
				id: 'payment',
				kind: 'payment',
				title: `Tuition payment · ${fmt.format(finances.balance.current)}`,
				meta: `Due ${finances.balance.dueDate} (${phraseUntil(n)})`,
				href: '/finances',
				sort: n ?? 9999,
				urgent: n !== null && n <= 14,
				overdue: n !== null && n < 0
			});
		}

		// Registration window for next term
		out.push({
			id: 'registration',
			kind: 'enrollment',
			title: 'Spring 2027 registration is open',
			meta: 'Pick next-semester courses from the degree timeline',
			href: '/progress',
			sort: -500
		});

		return out.sort((a, b) => a.sort - b.sort);
	});
</script>

<section class="card coming">
	<header class="head">
		<div>
			<h2>Coming up</h2>
			<p class="muted">Deadlines, holds, and actions that need your attention.</p>
		</div>
		<span class="count">{items.length} items</span>
	</header>

	<ul class="items">
		{#each items as item (item.id)}
			<li class="item {item.kind}" class:urgent={item.urgent} class:overdue={item.overdue}>
				<span class="icon" aria-hidden="true">
					{#if item.kind === 'hold'}
						<svg viewBox="0 0 24 24">
							<path
								d="M12 3 2.5 20h19z"
								fill="none"
								stroke="currentColor"
								stroke-width="1.6"
								stroke-linejoin="round"
							/>
							<path
								d="M12 10v5"
								stroke="currentColor"
								stroke-width="1.8"
								stroke-linecap="round"
							/>
							<circle cx="12" cy="17.5" r="1" fill="currentColor" />
						</svg>
					{:else if item.kind === 'task'}
						<svg viewBox="0 0 24 24">
							<rect
								x="4"
								y="4"
								width="16"
								height="16"
								rx="2"
								fill="none"
								stroke="currentColor"
								stroke-width="1.6"
							/>
							<path
								d="m8 12 3 3 5-6"
								fill="none"
								stroke="currentColor"
								stroke-width="1.8"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					{:else if item.kind === 'payment'}
						<svg viewBox="0 0 24 24">
							<rect
								x="3"
								y="6"
								width="18"
								height="12"
								rx="1.5"
								fill="none"
								stroke="currentColor"
								stroke-width="1.6"
							/>
							<path d="M3 10h18" stroke="currentColor" stroke-width="1.6" />
							<path d="M7 15h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
						</svg>
					{:else}
						<svg viewBox="0 0 24 24">
							<rect
								x="3.5"
								y="5"
								width="17"
								height="15"
								rx="1.5"
								fill="none"
								stroke="currentColor"
								stroke-width="1.6"
							/>
							<path d="M3.5 9h17" stroke="currentColor" stroke-width="1.6" />
							<path
								d="M8 3v4M16 3v4"
								stroke="currentColor"
								stroke-width="1.6"
								stroke-linecap="round"
							/>
						</svg>
					{/if}
				</span>
				<div class="body">
					<strong>{item.title}</strong>
					<p class="meta">{item.meta}</p>
				</div>
				<a class="action" href={item.href}>
					<span>Open</span>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M9 6l6 6-6 6"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</a>
			</li>
		{/each}
	</ul>
</section>

<style>
	.card {
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 16px 18px;
	}

	.head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
		margin-bottom: 12px;
	}

	h2 {
		font-size: 18px;
		font-weight: normal;
	}

	.muted {
		margin-top: 4px;
		font-size: 13px;
		color: var(--muted);
	}

	.count {
		font-size: 11px;
		color: var(--muted);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.items {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
	}

	.item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 10px;
		border-top: 1px solid var(--line);
		transition: background 0.18s ease;
	}

	.item:first-child {
		border-top: 0;
	}

	.item:hover {
		background: var(--page);
	}

	.icon {
		width: 30px;
		height: 30px;
		flex-shrink: 0;
		display: grid;
		place-items: center;
		border-radius: 6px;
		background: var(--chip);
		color: var(--muted);
	}

	.icon svg {
		width: 16px;
		height: 16px;
	}

	.item.hold .icon {
		background: color-mix(in srgb, var(--warn) 18%, transparent);
		color: var(--warn);
	}

	.item.task .icon {
		background: color-mix(in srgb, var(--sidebar) 12%, transparent);
		color: var(--sidebar);
	}

	.item.payment .icon {
		background: color-mix(in srgb, #e3a008 18%, transparent);
		color: #8a5a0a;
	}

	.item.enrollment .icon {
		background: var(--ok-soft);
		color: var(--ok);
	}

	.item.urgent .icon {
		box-shadow: 0 0 0 2px color-mix(in srgb, currentColor 30%, transparent);
	}

	.item.overdue strong {
		color: var(--sidebar);
	}

	.body {
		flex: 1;
		min-width: 0;
	}

	.body strong {
		font-size: 13.5px;
		display: block;
	}

	.meta {
		margin-top: 2px;
		font-size: 12px;
		color: var(--muted);
	}

	.action {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		color: var(--text);
		padding: 4px 8px;
		border-radius: 4px;
		border: 1px solid transparent;
		transition:
			border-color 0.18s ease,
			color 0.18s ease,
			transform 0.12s ease;
		flex-shrink: 0;
	}

	.action svg {
		width: 12px;
		height: 12px;
		transition: transform 0.18s ease;
	}

	.item:hover .action {
		border-color: var(--line);
		color: var(--sidebar);
	}

	.item:hover .action svg {
		transform: translateX(2px);
	}
</style>
