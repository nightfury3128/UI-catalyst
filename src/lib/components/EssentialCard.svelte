<script>
	import { page } from '$app/state';

	/** @type {{item: {title: string, description: string, href?: string, badge?: string, disabled?: boolean, beta?: boolean}}} */
	let { item } = $props();

	const isActive = $derived(
		!!item.href && item.href !== '/' && page.url.pathname.startsWith(item.href)
	);
</script>

{#if item.disabled}
	<div class="card disabled" title="Coming soon" aria-disabled="true">
		<strong>{item.title}</strong>
		<span>{item.description}</span>
		{#if item.badge}<em>{item.badge}</em>{/if}
		<span class="tag">Coming soon</span>
	</div>
{:else}
	<a class="card" class:active={isActive} href={item.href}>
		<span class="shine" aria-hidden="true"></span>
		<strong>{item.title}</strong>
		<span>{item.description}</span>
		{#if item.badge}<em>{item.badge}</em>{/if}
		{#if item.beta}<span class="tag beta">Beta</span>{/if}
	</a>
{/if}

<style>
	.card {
		display: block;
		position: relative;
		overflow: hidden;
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 14px 14px 16px;
		min-height: 86px;
		transition:
			transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
			border-color 0.22s ease,
			box-shadow 0.22s ease;
		isolation: isolate;
	}

	a.card::after {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 3px;
		background: var(--sidebar);
		transform: scaleY(0);
		transform-origin: top;
		transition: transform 0.25s cubic-bezier(0.65, 0.05, 0.36, 1);
	}

	a.card:hover {
		border-color: var(--sidebar);
		transform: translateY(-2px);
		box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
	}

	a.card:hover::after,
	a.card.active::after {
		transform: scaleY(1);
	}

	a.card.active {
		border-color: var(--sidebar);
	}

	.shine {
		position: absolute;
		top: 0;
		bottom: 0;
		left: -70%;
		width: 60%;
		background: linear-gradient(
			115deg,
			transparent 0%,
			rgba(255, 255, 255, 0.15) 45%,
			rgba(255, 255, 255, 0.55) 50%,
			rgba(255, 255, 255, 0.15) 55%,
			transparent 100%
		);
		transform: skewX(-18deg);
		pointer-events: none;
		z-index: 0;
		transition: left 0.6s cubic-bezier(0.22, 1, 0.36, 1);
	}

	a.card:hover .shine {
		left: 130%;
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
		position: relative;
		z-index: 1;
	}

	span {
		display: block;
		color: var(--muted);
		font-size: 12px;
		position: relative;
		z-index: 1;
	}

	em {
		display: inline-block;
		margin-top: 8px;
		background: var(--chip);
		padding: 2px 6px;
		font-style: normal;
		font-size: 12px;
		position: relative;
		z-index: 1;
	}

	.tag {
		position: absolute;
		right: 10px;
		bottom: 8px;
		font-size: 10px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--muted);
		z-index: 1;
	}

	.tag.beta {
		color: var(--sidebar);
		background: color-mix(in srgb, var(--sidebar) 10%, transparent);
		padding: 2px 6px;
		border: 1px solid color-mix(in srgb, var(--sidebar) 25%, transparent);
	}
</style>
