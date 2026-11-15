<script>
	import { termOptions } from '#lib/data/student.svelte.js';
	import {
		CURRENT_TERM_ID,
		enrollment,
		enrollIn,
		withdraw
	} from '#lib/stores/enrollment.svelte.js';

	/** @typedef {{
	 *   id: string, name: string, season: string, year: number,
	 *   courses: any[], plannedCourses?: any[], credits: number,
	 *   phase: 'past' | 'current' | 'future'
	 * }} Term */

	/** @type {Term[]} */
	const terms = termOptions;

	const currentIdx = terms.findIndex((t) => t.id === CURRENT_TERM_ID);

	const nextTermId = $derived(() => {
		for (let i = currentIdx + 1; i < terms.length; i++) {
			if (terms[i].phase === 'future') return terms[i].id;
		}
		return null;
	});

	/** @param {string} termId @param {string} code */
	function isRegistered(termId, code) {
		const list = enrollment.enrolledByTerm[termId] ?? [];
		return list.some((c) => c.code === code);
	}

	/** @param {string} termId */
	function registeredCount(termId) {
		return (enrollment.enrolledByTerm[termId] ?? []).length;
	}

	/** @param {string} termId */
	function registeredCredits(termId) {
		return (enrollment.enrolledByTerm[termId] ?? []).reduce(
			(sum, c) => sum + (c.credits || 0),
			0
		);
	}

	/** @param {string} termId @param {any} course */
	function register(termId, course) {
		enrollIn(termId, { ...course, status: 'Enrolled' });
	}

	/** @param {string} termId @param {string} code */
	function unregister(termId, code) {
		withdraw(termId, code);
	}

	/** @param {Term} t */
	function phaseLabel(t) {
		if (t.phase === 'current') return 'In progress';
		if (t.phase === 'past') return 'Completed';
		if (t.id === nextTermId()) return 'Enrollment open';
		return 'Planned';
	}

	/** @param {Term} t */
	function phaseKind(t) {
		if (t.phase === 'current') return 'current';
		if (t.phase === 'past') return 'past';
		if (t.id === nextTermId()) return 'open';
		return 'planned';
	}

	/** @param {Term} t */
	function termCourses(t) {
		// For future terms show the plan recommendation; for past/current show taken list
		if (t.phase === 'future') return t.plannedCourses ?? t.courses;
		return t.courses;
	}

	/** Total credits a term is slated to deliver (for progress bar fill) */
	/** @param {Term} t */
	function slottedCredits(t) {
		return termCourses(t).reduce((sum, c) => sum + (c.credits || 0), 0);
	}

	// Cumulative credits by term, for a running line under the timeline
	const cumulative = $derived.by(() => {
		let total = 0;
		return terms.map((t) => {
			if (t.phase === 'past') total += slottedCredits(t);
			else if (t.phase === 'current') total += slottedCredits(t);
			return total;
		});
	});

	const totalProgramCredits = 126;

	/** @type {Set<'past' | 'current' | 'open' | 'planned'>} */
	let activeFilters = $state(new Set(['past', 'current', 'open', 'planned']));

	/** @type {{ key: 'past' | 'current' | 'open' | 'planned', label: string }[]} */
	const filterChips = [
		{ key: 'past', label: 'Completed' },
		{ key: 'current', label: 'In progress' },
		{ key: 'open', label: 'Enrollment open' },
		{ key: 'planned', label: 'Planned' }
	];

	/** @param {'past' | 'current' | 'open' | 'planned'} key */
	function toggleFilter(key) {
		const next = new Set(activeFilters);
		if (next.has(key)) next.delete(key);
		else next.add(key);
		if (next.size === 0) {
			// Don't allow empty filter; reset to all
			activeFilters = new Set(['past', 'current', 'open', 'planned']);
		} else {
			activeFilters = next;
		}
	}

	function selectAll() {
		activeFilters = new Set(['past', 'current', 'open', 'planned']);
	}

	const allActive = $derived(activeFilters.size === 4);

	const visibleTerms = $derived(
		terms
			.map((t, i) => ({ term: t, idx: i }))
			.filter(({ term }) => activeFilters.has(phaseKind(term)))
	);
</script>

<section class="timeline card">
	<header class="head">
		<div>
			<h2>Degree timeline</h2>
			<p class="muted">
				Your path from freshman year to graduation. Scroll to see every term; register for the next
				semester inline.
			</p>
		</div>
		<div class="legend">
			<span><em class="dot past"></em>Completed</span>
			<span><em class="dot current"></em>In progress</span>
			<span><em class="dot open"></em>Enrollment open</span>
			<span><em class="dot planned"></em>Planned</span>
		</div>
	</header>

	<div class="filters" role="toolbar" aria-label="Filter timeline by status">
		<span class="filter-label">Show</span>
		<button
			type="button"
			class="chip"
			class:active={allActive}
			onclick={selectAll}
			title="Show every term"
		>
			All
		</button>
		{#each filterChips as chip}
			<button
				type="button"
				class="chip {chip.key}"
				class:active={activeFilters.has(chip.key)}
				aria-pressed={activeFilters.has(chip.key)}
				onclick={() => toggleFilter(chip.key)}
			>
				<em class="dot {chip.key}"></em>
				{chip.label}
			</button>
		{/each}
		<span class="count">{visibleTerms.length} / {terms.length} terms</span>
	</div>

	<div class="rail">
		<div class="line" aria-hidden="true"></div>
		<div class="terms">
			{#each visibleTerms as { term: t, idx: i } (t.id)}
				{@const kind = phaseKind(t)}
				{@const isNext = t.id === nextTermId()}
				{@const registered = registeredCount(t.id)}
				{@const regCredits = registeredCredits(t.id)}
				{@const totalCr = slottedCredits(t)}
				<article class="term" class:past={kind === 'past'} class:current={kind === 'current'} class:open={kind === 'open'} class:planned={kind === 'planned'}>
					<div class="marker" aria-hidden="true">
						<span class="pulse"></span>
					</div>

					<header class="term-head">
						<div class="season-year">
							<span class="season">{t.season}</span>
							<span class="year">{t.year}</span>
						</div>
						<span class="phase-chip">{phaseLabel(t)}</span>
					</header>

					<div class="meter" title="{regCredits || totalCr} credits">
						<span style="width: {Math.min(100, ((regCredits || totalCr) / 18) * 100)}%"></span>
					</div>
					<p class="credits">
						{#if isNext}
							{regCredits} registered · {totalCr} suggested
						{:else if t.phase === 'future'}
							{totalCr} planned cr
						{:else}
							{totalCr} cr
						{/if}
					</p>

					<ul class="courses">
						{#each termCourses(t) as course}
							{@const reg = isRegistered(t.id, course.code)}
							<li>
								<div class="course-main">
									<strong>{course.code}</strong>
									<span class="course-name">{course.name}</span>
								</div>
								<div class="course-meta">
									<span class="cr">{course.credits} cr</span>
									{#if t.phase === 'past'}
										<span class="status ok" aria-label="Completed">✓</span>
									{:else if t.phase === 'current'}
										<span class="status progress">In progress</span>
									{:else if isNext}
										{#if reg}
											<button
												type="button"
												class="btn registered"
												onclick={() => unregister(t.id, course.code)}
												title="Withdraw from this course"
											>
												Registered
											</button>
										{:else}
											<button
												type="button"
												class="btn register"
												onclick={() => register(t.id, course)}
												title="Register for this course"
											>
												Register
											</button>
										{/if}
									{:else}
										<span class="status locked" title="Opens one semester before this term">
											Locked
										</span>
									{/if}
								</div>
							</li>
						{/each}
						{#if termCourses(t).length === 0}
							<li class="empty">No courses planned yet.</li>
						{/if}
					</ul>

					{#if cumulative[i] !== undefined && t.phase !== 'future'}
						<footer class="term-foot">
							<span>Running total</span>
							<strong>{cumulative[i]} / {totalProgramCredits}</strong>
						</footer>
					{:else if isNext && regCredits > 0}
						<footer class="term-foot">
							<span>Registered</span>
							<strong>{regCredits} cr for {t.season} {t.year}</strong>
						</footer>
					{/if}
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.timeline {
		margin-top: 20px;
	}

	.head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
		flex-wrap: wrap;
	}

	h2 {
		font-size: 18px;
		font-weight: normal;
	}

	.muted {
		color: var(--muted);
		font-size: 13px;
		margin-top: 4px;
	}

	.legend {
		display: flex;
		gap: 14px;
		flex-wrap: wrap;
		font-size: 11px;
		color: var(--muted);
	}

	.legend span {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		display: inline-block;
	}

	.dot.past {
		background: var(--muted);
	}

	.dot.current {
		background: var(--sidebar);
	}

	.dot.open {
		background: #e3a008;
	}

	.dot.planned {
		background: var(--line);
		border: 1px dashed var(--muted);
	}

	.filters {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		margin-top: 14px;
		padding: 10px 12px;
		background: var(--page);
		border: 1px solid var(--line);
		border-radius: 6px;
	}

	.filter-label {
		font-size: 11px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--muted);
		margin-right: 2px;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 5px 10px;
		font: inherit;
		font-size: 12px;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 999px;
		cursor: pointer;
		color: var(--muted);
		transition:
			background 0.18s ease,
			color 0.18s ease,
			border-color 0.18s ease,
			transform 0.1s ease;
	}

	.chip:hover {
		border-color: var(--text);
		color: var(--text);
	}

	.chip:active {
		transform: scale(0.97);
	}

	.chip.active {
		background: var(--text);
		color: var(--page);
		border-color: var(--text);
	}

	.chip.active.current {
		background: var(--sidebar);
		border-color: var(--sidebar);
		color: #ffffff;
	}

	.chip.active.open {
		background: #e3a008;
		border-color: #e3a008;
		color: #ffffff;
	}

	.chip.active.planned {
		background: var(--muted);
		border-color: var(--muted);
		color: var(--page);
	}

	.count {
		margin-left: auto;
		font-size: 11px;
		color: var(--muted);
	}

	.rail {
		position: relative;
		margin-top: 16px;
		padding: 36px 2px 10px;
		overflow-x: auto;
	}

	.line {
		position: absolute;
		top: 54px;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(
			to right,
			var(--muted) 0%,
			var(--muted) 55%,
			#e3a008 56%,
			#e3a008 64%,
			var(--line) 65%,
			var(--line) 100%
		);
		opacity: 0.3;
	}

	.terms {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(230px, 1fr);
		gap: 14px;
		position: relative;
		z-index: 1;
	}

	.term {
		position: relative;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 6px;
		padding: 14px 12px 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
		transition:
			transform 0.22s ease,
			box-shadow 0.22s ease,
			border-color 0.22s ease;
	}

	.term.past {
		opacity: 0.86;
	}

	.term.current {
		border-color: var(--sidebar);
		box-shadow: 0 2px 10px color-mix(in srgb, var(--sidebar) 20%, transparent);
	}

	.term.open {
		border-color: #e3a008;
		background: color-mix(in srgb, #e3a008 4%, var(--surface));
		box-shadow: 0 2px 10px color-mix(in srgb, #e3a008 18%, transparent);
	}

	.term.planned {
		border-style: dashed;
		opacity: 0.85;
	}

	.marker {
		position: absolute;
		top: -24px;
		left: 50%;
		transform: translateX(-50%);
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--surface);
		border: 2px solid var(--muted);
		display: grid;
		place-items: center;
	}

	.term.current .marker {
		border-color: var(--sidebar);
	}

	.term.open .marker {
		border-color: #e3a008;
	}

	.term.planned .marker {
		border-color: var(--line);
	}

	.pulse {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--muted);
	}

	.term.current .pulse {
		background: var(--sidebar);
		animation: pulse 1.6s ease-in-out infinite;
	}

	.term.open .pulse {
		background: #e3a008;
	}

	@keyframes pulse {
		0%, 100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.6);
			opacity: 0.55;
		}
	}

	.term-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 8px;
	}

	.season-year {
		display: flex;
		flex-direction: column;
	}

	.season {
		font-size: 14px;
		font-weight: 600;
	}

	.year {
		font-size: 11px;
		color: var(--muted);
		letter-spacing: 0.04em;
	}

	.phase-chip {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 2px 6px;
		border-radius: 999px;
		background: var(--chip);
		color: var(--muted);
		white-space: nowrap;
	}

	.term.current .phase-chip {
		background: color-mix(in srgb, var(--sidebar) 12%, transparent);
		color: var(--sidebar);
	}

	.term.open .phase-chip {
		background: color-mix(in srgb, #e3a008 15%, transparent);
		color: #8a5a0a;
	}

	.meter {
		height: 4px;
		background: var(--chip);
		border-radius: 2px;
		overflow: hidden;
	}

	.meter span {
		display: block;
		height: 100%;
		background: var(--muted);
		transition: width 0.3s ease;
	}

	.term.current .meter span {
		background: var(--sidebar);
	}

	.term.open .meter span {
		background: #e3a008;
	}

	.credits {
		font-size: 11px;
		color: var(--muted);
	}

	.courses {
		list-style: none;
		padding: 0;
		margin: 2px 0 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-height: 60px;
	}

	.courses li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
		font-size: 12.5px;
		padding: 6px 6px;
		border-radius: 4px;
		background: var(--page);
	}

	.courses li.empty {
		color: var(--muted);
		font-style: italic;
		background: transparent;
		justify-content: center;
	}

	.course-main {
		display: flex;
		flex-direction: column;
		min-width: 0;
		flex: 1;
	}

	.course-main strong {
		font-size: 12px;
	}

	.course-name {
		font-size: 11px;
		color: var(--muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.course-meta {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}

	.cr {
		font-size: 11px;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}

	.status {
		font-size: 11px;
		padding: 2px 6px;
		border-radius: 999px;
	}

	.status.ok {
		color: var(--ok);
		background: var(--ok-soft);
		font-weight: bold;
	}

	.status.progress {
		color: var(--sidebar);
		background: color-mix(in srgb, var(--sidebar) 12%, transparent);
	}

	.status.locked {
		color: var(--muted);
		background: var(--chip);
	}

	.btn {
		font: inherit;
		font-size: 11px;
		padding: 4px 10px;
		border-radius: 999px;
		border: 1px solid #e3a008;
		background: #e3a008;
		color: #ffffff;
		cursor: pointer;
		font-weight: 600;
		transition:
			background 0.18s ease,
			transform 0.12s ease,
			box-shadow 0.18s ease;
	}

	.btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 6px color-mix(in srgb, #e3a008 35%, transparent);
	}

	.btn:active {
		transform: scale(0.96);
	}

	.btn.registered {
		background: var(--ok-soft);
		color: var(--ok);
		border-color: color-mix(in srgb, var(--ok) 40%, transparent);
	}

	.btn.registered:hover {
		background: color-mix(in srgb, var(--warn-soft) 80%, transparent);
		border-color: var(--warn);
		color: var(--warn);
	}

	.btn.registered:hover::after {
		content: ' — Withdraw?';
		margin-left: 2px;
		font-weight: normal;
	}

	.term-foot {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding-top: 6px;
		border-top: 1px dashed var(--line);
		font-size: 11px;
		color: var(--muted);
	}

	.term-foot strong {
		font-size: 12px;
		color: var(--text);
	}
</style>
