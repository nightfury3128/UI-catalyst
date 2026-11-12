<script>
	import EssentialCard from '#lib/components/EssentialCard.svelte';
	import ProfileCard from '#lib/components/ProfileCard.svelte';
	import ScheduleList from '#lib/components/ScheduleList.svelte';
	import { essentials, student } from '#lib/data/student.svelte.js';

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
		<section class="essentials-section">
			<div class="section-head">
				<h2>Your student essentials</h2>
				<p class="sub">Everything you need, one place.</p>
			</div>
			<div class="essentials">
				{#each essentials as item}
					<EssentialCard {item} />
				{/each}
			</div>
		</section>

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

	.header p,
	.sub {
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
		gap: 8px;
	}

	.section-head {
		margin-bottom: 12px;
	}

	.section-head h2 {
		font-size: 18px;
		font-weight: normal;
	}

	.essentials {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 12px;
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

		.essentials {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 600px) {
		.essentials {
			grid-template-columns: 1fr;
		}
	}
</style>
