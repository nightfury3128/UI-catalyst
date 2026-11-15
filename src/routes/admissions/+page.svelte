<script>
	import EmptyState from '#lib/components/EmptyState.svelte';
</script>

<svelte:head>
	<title>My Admissions | Catalyst</title>
</svelte:head>

<header class="header">
	<div>
		<h1>My Admissions</h1>
		<p>Application history, admit decisions, and matriculation steps.</p>
	</div>
</header>

<EmptyState
	title="Admissions is on the way."
	description="You'll find your application status, admit letters, and orientation checklists here once we connect the admissions system."
	chip="In development"
/>

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
</style>
