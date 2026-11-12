<script>
	/** @type {{item: {title: string, description: string, href?: string, badge?: string, disabled?: boolean}}} */
	let { item } = $props();
</script>

{#if item.disabled}
	<div class="card disabled" title="Coming soon" aria-disabled="true">
		<strong>{item.title}</strong>
		<span>{item.description}</span>
		{#if item.badge}<em>{item.badge}</em>{/if}
		<span class="soon">Coming soon</span>
	</div>
{:else}
	<a class="card" href={item.href}>
		<strong>{item.title}</strong>
		<span>{item.description}</span>
		{#if item.badge}<em>{item.badge}</em>{/if}
	</a>
{/if}

<style>
	.card {
		display: block;
		position: relative;
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 14px 14px 16px;
		min-height: 86px;
	}

	a.card:hover {
		border-color: var(--sidebar);
	}

	.card.disabled {
		cursor: not-allowed;
		opacity: 0.55;
		background: var(--page);
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

	.soon {
		position: absolute;
		right: 10px;
		bottom: 8px;
		font-size: 10px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--muted);
	}
</style>
