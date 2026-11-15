<script>
	import EmptyState from '#lib/components/EmptyState.svelte';
</script>

<svelte:head>
	<title>Scholarship Search | Catalyst</title>
</svelte:head>

<header class="header">
	<div>
		<h1>Scholarship Search</h1>
		<p>Discover scholarships you qualify for and track your applications.</p>
	</div>
</header>

<EmptyState
	title="The scholarship catalog is still loading."
	description="Soon you'll be able to browse open scholarships matched to your major, class standing, and interests — and apply with saved profile details."
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
