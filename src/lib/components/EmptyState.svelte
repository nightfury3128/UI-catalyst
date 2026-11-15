<script>
	/** @type {{
	 *   title: string,
	 *   description?: string,
	 *   chip?: string,
	 *   compact?: boolean,
	 *   children?: import('svelte').Snippet
	 * }} */
	let { title, description = '', chip = '', compact = false, children } = $props();
</script>

<div class="empty" class:compact>
	<div class="icon" aria-hidden="true">
		<svg viewBox="0 0 48 48">
			<circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" stroke-width="1.5" />
			<path
				d="M16 22c0-4 3.5-7 8-7s8 3 8 7c0 3-2.5 4.5-5 5.5-1.5.6-3 1.5-3 3.5"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
			/>
			<circle cx="24" cy="36" r="1.4" fill="currentColor" />
		</svg>
	</div>
	<h3>{title}</h3>
	{#if description}
		<p>{description}</p>
	{/if}
	{#if chip}
		<span class="chip">{chip}</span>
	{/if}
	{#if children}
		<div class="actions">{@render children()}</div>
	{/if}
</div>

<style>
	.empty {
		background: var(--surface);
		border: 1px dashed var(--line);
		padding: 48px 32px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 12px;
		color: var(--text);
	}

	.empty.compact {
		padding: 24px 20px;
		gap: 8px;
	}

	.icon {
		color: var(--muted);
		opacity: 0.7;
	}

	.icon svg {
		width: 56px;
		height: 56px;
	}

	.empty.compact .icon svg {
		width: 36px;
		height: 36px;
	}

	h3 {
		font-size: 18px;
		font-weight: normal;
	}

	.empty.compact h3 {
		font-size: 15px;
	}

	p {
		color: var(--muted);
		font-size: 13.5px;
		max-width: 48ch;
		line-height: 1.5;
	}

	.chip {
		display: inline-block;
		margin-top: 4px;
		padding: 4px 10px;
		font-size: 11px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--sidebar);
		background: var(--ok-soft);
		background: color-mix(in srgb, var(--sidebar) 10%, transparent);
		border: 1px solid color-mix(in srgb, var(--sidebar) 25%, transparent);
	}

	.actions {
		margin-top: 8px;
	}
</style>
