<script>
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { tasks } from '#lib/data/student.svelte.js';

	const todoCount = tasks.todo.length;
	const indicatorCount = tasks.indicators.length;
</script>

<svelte:head>
	<title>Tasks | Catalyst</title>
</svelte:head>

<header class="header">
	<div>
		<h1>Tasks &amp; service indicators</h1>
		<p>Things that need your attention from across campus offices.</p>
	</div>
	<div class="counts">
		<span><strong>{todoCount}</strong> to-do</span>
		<span><strong>{indicatorCount}</strong> indicator</span>
	</div>
</header>

<section class="card">
	<header class="section-head">
		<h2>To-do</h2>
		<span class="sub">Due dates from campus offices</span>
	</header>

	{#if todoCount === 0}
		<EmptyState
			compact
			title="You're all caught up."
			description="No pending to-dos right now. We'll surface anything new as it arrives."
		/>
	{:else}
		<ul class="list">
			{#each tasks.todo as item}
				<li class="row">
					<span class="badge" class:high={item.priority === 'high'}>
						{item.priority === 'high' ? '!' : '•'}
					</span>
					<div class="body">
						<strong>{item.title}</strong>
						<p class="meta">{item.office} · Due {item.due}</p>
					</div>
					<button type="button" class="ghost" disabled title="Workflow coming soon">
						Open
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<section class="card">
	<header class="section-head">
		<h2>Service indicators</h2>
		<span class="sub">Holds and notices on your record</span>
	</header>

	{#if indicatorCount === 0}
		<EmptyState
			compact
			title="No service indicators."
			description="If an office places a hold on your record, it will appear here with instructions to clear it."
		/>
	{:else}
		<ul class="list">
			{#each tasks.indicators as ind}
				<li class="row indicator" class:warn={ind.severity === 'warn'}>
					<span class="badge warn-dot">⚠</span>
					<div class="body">
						<strong>{ind.title}</strong>
						<p class="meta">{ind.office} · Placed {ind.since}</p>
					</div>
					<button type="button" class="ghost" disabled title="Workflow coming soon">
						Details
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 24px;
		align-items: flex-start;
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

	.counts {
		display: flex;
		gap: 10px;
	}

	.counts span {
		border: 1px solid var(--line);
		background: var(--surface);
		padding: 6px 10px;
		font-size: 12px;
		color: var(--muted);
	}

	.counts strong {
		color: var(--text);
		margin-right: 4px;
	}

	.card {
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 18px;
		margin-bottom: 16px;
	}

	.section-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 12px;
	}

	.section-head h2 {
		font-size: 16px;
		font-weight: normal;
	}

	.sub {
		font-size: 12px;
		color: var(--muted);
	}

	.list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 8px;
		border-top: 1px solid var(--line);
	}

	.row:first-child {
		border-top: 0;
	}

	.body {
		flex: 1;
		min-width: 0;
	}

	.body strong {
		font-size: 14px;
	}

	.meta {
		margin-top: 2px;
		font-size: 12px;
		color: var(--muted);
	}

	.badge {
		width: 26px;
		height: 26px;
		display: grid;
		place-items: center;
		background: var(--chip);
		color: var(--muted);
		border-radius: 50%;
		font-size: 13px;
		font-weight: bold;
		flex-shrink: 0;
	}

	.badge.high {
		background: color-mix(in srgb, var(--sidebar) 15%, transparent);
		color: var(--sidebar);
	}

	.badge.warn-dot {
		background: var(--warn-soft);
		color: var(--warn);
	}

	.row.indicator {
		background: color-mix(in srgb, var(--warn) 6%, transparent);
		border-top-color: color-mix(in srgb, var(--warn) 20%, var(--line));
	}

	.ghost {
		background: transparent;
		border: 1px solid var(--line);
		padding: 6px 10px;
		font: inherit;
		font-size: 12px;
		color: var(--text);
		cursor: pointer;
	}

	.ghost:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}
</style>
