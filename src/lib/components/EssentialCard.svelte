<script>
	/** @type {{item: {title: string, description: string, href: string, badge?: string}}} */
	let { item } = $props();
</script>

<a class="card" href={item.href}>
	<strong>{item.title}</strong>
	<span>{item.description}</span>
	{#if item.badge}<em>{item.badge}</em>{/if}
</a>

<style>
	.card {
		display: block;
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 12px;
		min-height: 72px;
	}

	.card:hover {
		border-color: var(--sidebar);
	}

	strong {
		display: block;
		font-size: 14px;
		margin-bottom: 6px;
	}

	span {
		display: block;
		color: var(--muted);
		font-size: 12px;
	}

	em {
		display: inline-block;
		margin-top: 8px;
		background: var(--chip);
		padding: 2px 6px;
		font-style: normal;
		font-size: 12px;
	}
</style>
