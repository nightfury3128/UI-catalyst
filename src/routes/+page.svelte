<script>
	import EssentialCard from '#lib/components/EssentialCard.svelte';
	import ProfileCard from '#lib/components/ProfileCard.svelte';
	import ScheduleList from '#lib/components/ScheduleList.svelte';
	import { essentials } from '#lib/data/student.js';
</script>

<svelte:head>
	<title>Home | Catalyst</title>
</svelte:head>

<header class="header">
	<div>
		<h1>Your day, at a glance.</h1>
		<p>Welcome back! Here's what's happening this semester.</p>
	</div>
	<span>Fall 2026</span>
</header>

<div class="grid">
	<ProfileCard />

	<div>
		<section>
			<h2>Your student essentials</h2>
			<p class="sub">Everything you need, one place.</p>
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
		margin-bottom: 20px;
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

	.header span {
		align-self: start;
		border: 1px solid var(--line);
		background: var(--surface);
		padding: 6px 10px;
		font-size: 13px;
	}

	.grid {
		display: grid;
		grid-template-columns: 260px 1fr;
		gap: 16px;
	}

	h2 {
		font-size: 18px;
		font-weight: normal;
	}

	.essentials {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 10px;
		margin-top: 12px;
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
