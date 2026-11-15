<script>
	import ComingUp from '#lib/components/ComingUp.svelte';
	import ProfileCard from '#lib/components/ProfileCard.svelte';
	import ScheduleList from '#lib/components/ScheduleList.svelte';
	import { student } from '#lib/data/student.svelte.js';

	const firstName = student.name.split(' ')[0];
</script>

<svelte:head>
	<title>Home | Catalyst</title>
</svelte:head>

<header class="header">
	<div>
		<h1>Your day, at a glance.</h1>
		<p>Welcome back, {firstName}. Here's what's happening this semester.</p>
	</div>
	<span class="term">Fall 2026</span>
</header>

<div class="grid">
	<ProfileCard />

	<div class="right">
		<ComingUp />
		<ScheduleList />
	</div>
</div>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 24px;
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

	.term {
		align-self: start;
		border: 1px solid var(--line);
		background: var(--surface);
		padding: 6px 10px;
		font-size: 13px;
	}

	.grid {
		display: grid;
		grid-template-columns: 280px 1fr;
		gap: 20px;
		align-items: start;
	}

	.right {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	@media (max-width: 1100px) {
		.grid {
			grid-template-columns: 260px 1fr;
		}
	}

	@media (max-width: 1000px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
