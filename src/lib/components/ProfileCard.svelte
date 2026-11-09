<script>
	import { student } from '#lib/data/student.js';
</script>

<section class="card">
	<p class="label">Student profile</p>
	<div class="avatar">{student.initials}</div>
	<h2>{student.name}</h2>
	<p>{student.major}</p>
	<p class="meta">{student.college} ID: {student.id}</p>

	<div class="tags">
		<span>{student.year}</span>
		<span>{student.enrollment}</span>
		<span class="ok">{student.standing}</span>
	</div>

	<ul>
		<li><span>GPA</span><strong>{student.gpa}</strong></li>
		<li><span>Earned credits</span><strong>{student.earnedCredits}</strong></li>
		<li><span>Enrolled credits</span><strong>{student.enrolledCredits}</strong></li>
	</ul>

	<a href="#profile">View my profile</a>
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

	a {
		display: block;
		text-align: center;
		background: var(--sidebar);
		color: white;
		padding: 10px;
	}
</style>
