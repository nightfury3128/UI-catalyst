<script>
	import EmptyState from '#lib/components/EmptyState.svelte';
</script>

<svelte:head>
	<title>Other Tools | Catalyst</title>
</svelte:head>

<header class="header">
	<div>
		<h1>Other Tools</h1>
		<p>Campus apps and specialty resources that live outside the main portal.</p>
	</div>
</header>

<EmptyState
	title="Campus apps are coming to the portal."
	description="A unified place for Canvas, library tools, parking, dining, and the other campus apps — all linked from a single tile board."
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
