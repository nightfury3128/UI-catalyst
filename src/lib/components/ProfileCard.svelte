<script>
	import { progress, student } from '#lib/data/student.svelte.js';
	import { CURRENT_TERM_ID, enrollment } from '#lib/stores/enrollment.svelte.js';

	const enrolledCredits = $derived(
		(enrollment.enrolledByTerm[CURRENT_TERM_ID] ?? []).reduce((sum, c) => sum + c.credits, 0)
	);

	const enrollmentStatus = $derived(enrolledCredits >= 12 ? 'Full-time' : 'Part-time');

	const totalCredits = progress.headline.totalCredits;
	const completionPct = $derived(
		Math.min(100, Math.round((student.earnedCredits / totalCredits) * 100))
	);

	const advisor = progress.advisors[0];
</script>

<section class="card">
	<p class="label">Student profile</p>

	<div class="identity">
		<div class="avatar">{student.initials}</div>
		<div class="identity-text">
			<h2>{student.name}</h2>
			<p class="role">{student.major}</p>
			<p class="meta">{student.college} · ID {student.id}</p>
		</div>
	</div>

	<div class="tags">
		<span>{student.year}</span>
		<span>{enrollmentStatus}</span>
		<span class="ok">{student.standing}</span>
	</div>

	<div class="progress-block">
		<div class="progress-top">
			<span>Degree progress</span>
			<strong>{completionPct}%</strong>
		</div>
		<div class="bar" aria-hidden="true">
			<span style="width: {completionPct}%"></span>
		</div>
		<p class="progress-foot">
			{student.earnedCredits} of {totalCredits} credits earned
		</p>
	</div>

	<ul>
		<li><span>GPA</span><strong>{student.gpa ?? '—'}</strong></li>
		<li><span>Earned credits</span><strong>{student.earnedCredits}</strong></li>
		<li><span>Enrolled credits</span><strong>{enrolledCredits}</strong></li>
		<li>
			<span>Expected graduation</span><strong>{progress.headline.expectedGraduation}</strong>
		</li>
	</ul>

	<div class="advisor">
		<p class="label">Academic advisor</p>
		<strong>{advisor.name}</strong>
		<p class="advisor-role">{advisor.role}</p>
		<a class="advisor-link" href="mailto:{advisor.email}">
			{advisor.email}
		</a>
	</div>

	<button type="button" class="profile-btn" disabled title="Coming soon">
		View my profile <span>Coming soon</span>
	</button>
</section>

<style>
	.card {
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.label {
		font-size: 12px;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.identity {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.avatar {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: var(--sidebar);
		color: white;
		display: grid;
		place-items: center;
		font-weight: bold;
		flex-shrink: 0;
	}

	.identity-text {
		min-width: 0;
	}

	h2 {
		font-size: 18px;
		margin-bottom: 2px;
	}

	.role {
		font-size: 13px;
	}

	.meta {
		margin-top: 4px;
		color: var(--muted);
		font-size: 12px;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.tags span {
		background: var(--chip);
		padding: 4px 8px;
		font-size: 12px;
	}

	.tags .ok {
		color: var(--ok);
	}

	.progress-block {
		background: var(--chip);
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.progress-top {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		font-size: 13px;
	}

	.progress-top strong {
		font-size: 16px;
		color: var(--sidebar);
	}

	.bar {
		height: 6px;
		background: var(--surface);
		border: 1px solid var(--line);
		overflow: hidden;
	}

	.bar span {
		display: block;
		height: 100%;
		background: var(--sidebar);
		transition: width 0.4s ease;
	}

	.progress-foot {
		font-size: 11px;
		color: var(--muted);
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		display: flex;
		justify-content: space-between;
		padding: 8px 0;
		border-top: 1px solid var(--line);
		font-size: 13px;
	}

	li:last-child {
		border-bottom: 1px solid var(--line);
	}

	.advisor {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 12px;
		background: var(--page);
		border-left: 3px solid var(--sidebar);
	}

	.advisor strong {
		font-size: 14px;
	}

	.advisor-role {
		color: var(--muted);
		font-size: 12px;
	}

	.advisor-link {
		margin-top: 4px;
		font-size: 12px;
		color: var(--sidebar);
		text-decoration: underline;
		word-break: break-all;
	}

	.profile-btn {
		display: block;
		width: 100%;
		text-align: center;
		background: var(--sidebar);
		color: white;
		padding: 10px;
		border: 0;
		opacity: 0.55;
		cursor: not-allowed;
		margin-top: auto;
	}

	.profile-btn span {
		display: block;
		font-size: 10px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		opacity: 0.85;
		margin-top: 2px;
	}
</style>
