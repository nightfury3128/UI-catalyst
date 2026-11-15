<script>
	import { finances, student } from '#lib/data/student.svelte.js';

	const fmt = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2
	});

	const firstName = student.name.split(' ')[0];
</script>

<svelte:head>
	<title>My Finances | Catalyst</title>
</svelte:head>

<header class="header">
	<div>
		<h1>My Finances</h1>
		<p>Balance, aid, and recent activity for {firstName}'s {finances.term} term.</p>
	</div>
	<span class="term">{finances.term}</span>
</header>

<section class="row">
	<div class="balance card">
		<p class="label">Current balance</p>
		<p class="big">{fmt.format(finances.balance.current)}</p>
		<p class="status due">
			<span class="dot"></span>
			{finances.balance.statusLabel} · due {finances.balance.dueDate}
		</p>
		<div class="actions">
			<button type="button" class="primary" disabled title="Payment system coming soon">
				Make a payment
			</button>
			<button type="button" class="ghost" disabled title="Coming soon">Set up payment plan</button>
		</div>
	</div>

	<div class="summary card">
		<p class="label">Term summary</p>
		<ul>
			<li><span>Charges</span><strong>{fmt.format(finances.summary.charges)}</strong></li>
			<li>
				<span>Financial aid applied</span>
				<strong class="aid">{fmt.format(finances.summary.aid)}</strong>
			</li>
			<li>
				<span>Payments received</span>
				<strong class="payment">{fmt.format(finances.summary.payments)}</strong>
			</li>
			<li class="total">
				<span>Remaining</span>
				<strong>{fmt.format(finances.balance.current)}</strong>
			</li>
		</ul>
	</div>
</section>

<section class="card">
	<header class="section-head">
		<h2>Financial aid &amp; scholarships</h2>
		<span class="sub">{finances.aid.length} active awards</span>
	</header>
	<table>
		<thead>
			<tr>
				<th>Award</th>
				<th>Period</th>
				<th>Status</th>
				<th class="num">Amount</th>
			</tr>
		</thead>
		<tbody>
			{#each finances.aid as award}
				<tr>
					<td><strong>{award.name}</strong></td>
					<td>{award.period}</td>
					<td><span class="chip">{award.status}</span></td>
					<td class="num">{fmt.format(award.amount)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>

<section class="card">
	<header class="section-head">
		<h2>Recent activity</h2>
		<span class="sub">Last 90 days</span>
	</header>
	<table>
		<thead>
			<tr>
				<th>Date</th>
				<th>Description</th>
				<th class="num">Amount</th>
			</tr>
		</thead>
		<tbody>
			{#each finances.transactions as tx}
				<tr>
					<td>{tx.date}</td>
					<td>{tx.description}</td>
					<td class="num" class:positive={tx.amount >= 0} class:negative={tx.amount < 0}>
						{fmt.format(tx.amount)}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>

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

	.term {
		align-self: start;
		border: 1px solid var(--line);
		background: var(--surface);
		padding: 6px 10px;
		font-size: 13px;
	}

	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 16px;
		margin-bottom: 16px;
	}

	.card {
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 18px;
		margin-bottom: 16px;
	}

	.label {
		font-size: 11px;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: 8px;
	}

	.big {
		font-size: 34px;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.status {
		margin-top: 8px;
		font-size: 13px;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--muted);
	}

	.status .dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--warn);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--warn) 25%, transparent);
	}

	.actions {
		display: flex;
		gap: 10px;
		margin-top: 16px;
	}

	.primary,
	.ghost {
		border: 1px solid var(--sidebar);
		padding: 9px 14px;
		font: inherit;
		font-size: 13px;
		cursor: pointer;
	}

	.primary {
		background: var(--sidebar);
		color: #ffffff;
	}

	.ghost {
		background: transparent;
		color: var(--sidebar);
	}

	.primary:disabled,
	.ghost:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.summary ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.summary li {
		display: flex;
		justify-content: space-between;
		padding: 8px 0;
		border-top: 1px solid var(--line);
		font-size: 14px;
	}

	.summary li:first-child {
		border-top: 0;
	}

	.summary li.total {
		border-top: 2px solid var(--text);
		margin-top: 4px;
		padding-top: 10px;
		font-weight: 600;
	}

	.summary .aid {
		color: var(--ok);
	}

	.summary .payment {
		color: var(--ok);
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

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13.5px;
	}

	th,
	td {
		text-align: left;
		padding: 10px 8px;
		border-bottom: 1px solid var(--line);
	}

	th {
		font-size: 11px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--muted);
		font-weight: normal;
	}

	tr:last-child td {
		border-bottom: 0;
	}

	.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.positive {
		color: var(--ok);
	}

	.negative {
		color: var(--text);
	}

	.chip {
		display: inline-block;
		font-size: 11px;
		padding: 2px 8px;
		background: var(--ok-soft);
		color: var(--ok);
	}

	@media (max-width: 800px) {
		.row {
			grid-template-columns: 1fr;
		}
	}
</style>
