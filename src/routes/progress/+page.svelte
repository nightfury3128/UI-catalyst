<script>
	import { curriculum, degreePlan, progress, student } from '#lib/data/student.svelte.js';
	import { projectGraduation } from '#lib/data/progression.js';
	import { CURRENT_TERM_ID, enrollment } from '#lib/stores/enrollment.svelte.js';

	const CURRENT_TERM_LABEL = 'Fall 2026';
	const { degree, advisors } = progress;

	const currentEnrolled = $derived(enrollment.enrolledByTerm[CURRENT_TERM_ID] ?? []);

	const inProgressCredits = $derived(
		currentEnrolled.reduce((sum, c) => sum + c.credits, 0)
	);

	const finishing = $derived(
		currentEnrolled.map((c) => ({ code: c.code, name: c.name, credits: c.credits }))
	);

	const remainingCredits = $derived(
		Math.max(0, curriculum.minimumCredits - progress.headline.earnedCredits - inProgressCredits)
	);

	const expectedGraduation = $derived(
		projectGraduation(CURRENT_TERM_LABEL, remainingCredits, curriculum.maxCreditsPerSemester)
	);

	const headline = $derived({
		...progress.headline,
		remainingCredits,
		expectedGraduation
	});

	const overallPct = $derived(
		Math.round((headline.earnedCredits / headline.totalCredits) * 1000) / 10
	);

	const semestersToGraduation = $derived(
		Math.ceil(remainingCredits / curriculum.maxCreditsPerSemester)
	);

	function downloadDegreeAudit() {
		const payload = {
			generatedAt: new Date().toISOString(),
			student: { name: student.name, id: student.id, major: student.major },
			headline,
			degree,
			advisors,
			finishing,
			plan: degreePlan
		};
		const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `degree-audit-${student.id}.json`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>Academic progress | Catalyst</title>
</svelte:head>

<header class="header">
	<div>
		<h1>Academic progress</h1>
		<p>A clear view of where you are, and what comes next.</p>
	</div>
	<button type="button" class="download" onclick={downloadDegreeAudit}>
		Download degree audit ↓
	</button>
</header>

<section class="kpis">
	<div class="kpi">
		<p class="label">Degree credits earned</p>
		<p class="value">{headline.earnedCredits} / {headline.totalCredits}</p>
		<p class="foot">{overallPct}% complete</p>
	</div>
	<div class="kpi">
		<p class="label">Cumulative GPA</p>
		<p class="value">{headline.cumulativeGpa ?? '—'}</p>
		<p class="foot {headline.cumulativeGpa ? 'ok' : ''}">
			{headline.cumulativeGpa ? 'Good academic standing' : 'No grades on record yet'}
		</p>
	</div>
	<div class="kpi">
		<p class="label">Remaining requirements</p>
		<p class="value">{headline.remainingCredits} credits</p>
		<p class="foot">
			After Fall 2026 ({headline.totalCredits} − {headline.earnedCredits} earned − {inProgressCredits}
			in progress)
		</p>
	</div>
	<div class="kpi">
		<p class="label">Expected graduation</p>
		<p class="value">{headline.expectedGraduation}</p>
		<p class="foot">
			{#if semestersToGraduation === 0}
				On track to finish this semester
			{:else}
				{semestersToGraduation} more {semestersToGraduation === 1 ? 'semester' : 'semesters'} at
				≤{curriculum.maxCreditsPerSemester} cr
			{/if}
		</p>
	</div>
</section>

<div class="audit-head">
	<h2>Degree audit</h2>
	<span>Last updated {degree.lastUpdated}</span>
</div>

<div class="grid">
	<section class="card audit">
		<div class="audit-top">
			<div>
				<h3>{degree.title}</h3>
				<p class="muted">{degree.subtitle}</p>
			</div>
			<span class="badge ok">{degree.status}</span>
		</div>

		<div class="overall">
			<div class="track">
				<div
					class="fill"
					style="width: {(headline.earnedCredits / headline.totalCredits) * 100}%"
				></div>
			</div>
			<div class="overall-meta">
				<span>{headline.earnedCredits} earned</span>
				<span class="warn">{headline.remainingCredits} remaining</span>
			</div>
		</div>

		<hr />

		<ul class="reqs">
			{#each degree.requirements as req}
				{@const pct = (req.earned / req.total) * 100}
				{@const complete = req.status === 'Complete'}
				{@const notStarted = req.status === 'Not started'}
				<li>
					<div class="req-head">
						<div>
							<strong>{req.name}</strong>
							<p class="muted">{req.earned} / {req.total} credits</p>
						</div>
						<span
							class="badge"
							class:ok={complete}
							class:warn={!complete && !notStarted}
							class:neutral={notStarted}
						>
							{req.status}
						</span>
					</div>
					<div class="track thin">
						<div
							class="fill"
							class:is-ok={complete}
							class:is-warn={!complete && !notStarted}
							style="width: {pct}%"
						></div>
					</div>
				</li>
			{/each}
		</ul>

		<hr />

		<div class="checks">
			{#each degree.checks as check}
				<span>✓ {check}</span>
			{/each}
		</div>
	</section>

	<aside class="side">
		<section class="card advisors">
			<h3>Your advising team</h3>
			{#each advisors as advisor, i}
				<div class="advisor" class:has-divider={i > 0}>
					<strong>{advisor.name}</strong>
					<p class="muted">{advisor.role}</p>
					<a class="email" href="mailto:{advisor.email}">{advisor.email} ↗</a>
				</div>
			{/each}
			<a class="btn-outline" href="https://uc.inspire.civitaslearning.com/login">
				My Bearcat Network ↗
			</a>
		</section>

		<section class="card stretch">
			<h3>You're on the home stretch.</h3>
			<p class="muted">Finish your final requirements and confirm your graduation application.</p>
			<button type="button" class="btn-dark" disabled title="Coming soon">
				View graduation checklist → <span class="soon">Coming soon</span>
			</button>
		</section>
	</aside>
</div>

<section class="card finishing">
	<h3>Finishing this semester</h3>
	<p class="muted">
		These {headline.remainingCredits} credits fulfill your remaining major requirements.
	</p>
	<div class="courses">
		{#each finishing as course}
			<div class="course">
				<div>
					<strong>{course.code}</strong>
					<p class="muted">{course.name}</p>
				</div>
				<span class="chip">{course.credits} credits</span>
			</div>
		{/each}
	</div>
</section>

<p class="disclaimer">
	Degree audit is a planning guide. Your advisor confirms final degree eligibility.
</p>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
		margin-bottom: 20px;
	}

	h1 {
		font-size: 28px;
		font-weight: normal;
	}

	.header p {
		margin-top: 6px;
		color: var(--muted);
		font-size: 14px;
	}

	.download {
		align-self: start;
		background: var(--text);
		color: var(--page);
		padding: 8px 12px;
		font-size: 13px;
		border: 1px solid var(--text);
		cursor: pointer;
	}

	.download:hover {
		opacity: 0.9;
	}

	.btn-dark[disabled] {
		opacity: 0.55;
		cursor: not-allowed;
		border: 0;
	}

	.btn-dark .soon {
		display: block;
		font-size: 10px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		margin-top: 2px;
		opacity: 0.85;
	}

	.kpis {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 10px;
		margin-bottom: 24px;
	}

	.kpi {
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 14px;
	}

	.label {
		color: var(--muted);
		font-size: 12px;
	}

	.value {
		font-size: 24px;
		margin-top: 6px;
	}

	.foot {
		color: var(--muted);
		font-size: 12px;
		margin-top: 10px;
	}

	.foot.ok {
		color: var(--ok);
	}

	.audit-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 10px;
	}

	h2 {
		font-size: 18px;
		font-weight: normal;
	}

	.audit-head span {
		color: var(--muted);
		font-size: 12px;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 340px;
		gap: 16px;
		align-items: start;
	}

	.card {
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 16px;
	}

	.audit-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
		margin-bottom: 14px;
	}

	h3 {
		font-size: 16px;
		font-weight: normal;
	}

	.muted {
		color: var(--muted);
		font-size: 12px;
		margin-top: 4px;
	}

	.badge {
		display: inline-block;
		padding: 4px 8px;
		font-size: 12px;
		background: var(--chip);
		color: var(--text);
		white-space: nowrap;
	}

	.badge.ok {
		background: var(--ok-soft);
		color: var(--ok);
	}

	.badge.warn {
		background: var(--warn-soft);
		color: var(--warn);
	}

	.badge.neutral {
		background: var(--chip);
		color: var(--muted);
	}

	.overall {
		margin-top: 8px;
	}

	.track {
		height: 10px;
		background: var(--chip);
		overflow: hidden;
	}

	.track.thin {
		height: 6px;
	}

	.fill {
		height: 100%;
		background: var(--text);
	}

	.fill.is-ok {
		background: var(--ok);
	}

	.fill.is-warn {
		background: var(--warn);
	}

	.overall-meta {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		color: var(--muted);
		margin-top: 8px;
	}

	.overall-meta .warn {
		color: var(--warn);
	}

	hr {
		border: 0;
		border-top: 1px solid var(--line);
		margin: 18px 0;
	}

	.reqs {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.req-head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
		margin-bottom: 8px;
	}

	.req-head strong {
		font-size: 14px;
	}

	.checks {
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		font-size: 13px;
		color: var(--ok);
	}

	.side {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.advisor {
		padding-top: 12px;
		margin-top: 12px;
	}

	.advisor.has-divider {
		border-top: 1px solid var(--line);
	}

	.advisor strong {
		font-size: 14px;
	}

	.email {
		display: inline-block;
		margin-top: 6px;
		font-size: 12px;
		color: var(--text);
	}

	.btn-outline {
		display: block;
		text-align: center;
		margin-top: 16px;
		background: var(--page);
		border: 1px solid var(--line);
		padding: 10px;
		font-size: 13px;
	}

	.stretch {
		background: var(--chip);
	}

	.stretch h3 {
		font-size: 16px;
	}

	.stretch .muted {
		margin-bottom: 14px;
	}

	.btn-dark {
		display: block;
		text-align: center;
		background: var(--text);
		color: var(--page);
		padding: 10px;
		font-size: 13px;
	}

	.finishing {
		margin-top: 16px;
	}

	.finishing h3 {
		font-size: 16px;
	}

	.courses {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 12px;
		margin-top: 14px;
	}

	.course {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 10px;
		padding: 12px;
		border: 1px solid var(--line);
	}

	.course strong {
		font-size: 13px;
	}

	.chip {
		background: var(--chip);
		padding: 3px 8px;
		font-size: 12px;
		white-space: nowrap;
	}

	.disclaimer {
		margin-top: 18px;
		color: var(--muted);
		font-size: 12px;
	}

	@media (max-width: 1000px) {
		.kpis {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.grid {
			grid-template-columns: 1fr;
		}

		.courses {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 600px) {
		.kpis {
			grid-template-columns: 1fr;
		}

		.header {
			flex-direction: column;
		}
	}
</style>
