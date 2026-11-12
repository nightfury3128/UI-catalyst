<script>
	import { student } from '#lib/data/student.svelte.js';
	import { CURRENT_TERM_ID, enrollment } from '#lib/stores/enrollment.svelte.js';

	const enrolledCredits = $derived(
		(enrollment.enrolledByTerm[CURRENT_TERM_ID] ?? []).reduce((sum, c) => sum + c.credits, 0)
	);

	const enrollmentStatus = $derived(enrolledCredits >= 12 ? 'Full-time' : 'Part-time');
</script>

<section class="card">
	<p class="label">Student profile</p>
	<div class="avatar">{student.initials}</div>
	<h2>{student.name}</h2>
	<p>{student.major}</p>
	<p class="meta">{student.college} ID: {student.id}</p>

	<div class="tags">
		<span>{student.year}</span>
		<span>{enrollmentStatus}</span>
		<span class="ok">{student.standing}</span>
	</div>

	<ul>
		<li><span>GPA</span><strong>{student.gpa ?? '—'}</strong></li>
		<li><span>Earned credits</span><strong>{student.earnedCredits}</strong></li>
		<li><span>Enrolled credits</span><strong>{enrolledCredits}</strong></li>
	</ul>

	<button type="button" class="profile-btn" disabled title="Coming soon">
		View my profile <span>Coming soon</span>
	</button>
</section>

<style>
	.card {
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 16px;
	}

	.label {
		font-size: 12px;
		color: var(--muted);
		text-transform: uppercase;
		margin-bottom: 12px;
	}

	.avatar {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: var(--sidebar);
		color: white;
		display: grid;
		place-items: center;
		font-weight: bold;
		margin-bottom: 12px;
	}

	h2 {
		font-size: 20px;
		margin-bottom: 4px;
	}

	.meta {
		margin-top: 6px;
		color: var(--muted);
		font-size: 13px;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 12px 0;
	}

	.tags span {
		background: var(--chip);
		padding: 4px 8px;
		font-size: 12px;
	}

	.tags .ok {
		color: var(--ok);
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0 0 14px;
	}

	li {
		display: flex;
		justify-content: space-between;
		padding: 8px 0;
		border-top: 1px solid var(--line);
		font-size: 14px;
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
