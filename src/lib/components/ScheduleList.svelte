<script>
	import { schedule } from '#lib/data/student.js';
</script>

<section class="wrap">
	<div class="head">
		<h2>Your class schedule</h2>
	</div>

	<div class="panel">
		<div class="toolbar">
			<span>This week Nov 9 - 13, 2026</span>
			<span>List view</span>
		</div>

		<table>
			<thead>
				<tr>
					<th>Class</th>
					<th>Meets</th>
					<th>Location</th>
				</tr>
			</thead>
			<tbody>
				{#each schedule as course}
					<tr>
						<td>
							<strong>{course.code}</strong>
							<div>{course.name}</div>
						</td>
						<td>
							{course.days}
							<div>{course.time}</div>
						</td>
						<td>{course.location}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<style>
	.wrap {
		margin-top: 24px;
	}

	.head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 10px;
		gap: 12px;
	}

	h2 {
		font-size: 18px;
	}

	.panel {
		background: var(--surface);
		border: 1px solid var(--line);
	}

	.toolbar {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding: 12px;
		border-bottom: 1px solid var(--line);
		font-size: 13px;
		color: var(--muted);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}

	th,
	td {
		text-align: left;
		padding: 10px 12px;
		border-bottom: 1px solid var(--line);
		vertical-align: top;
	}

	th {
		font-size: 12px;
		color: var(--muted);
		font-weight: normal;
	}

	td div {
		color: var(--muted);
		font-size: 12px;
		margin-top: 2px;
	}

	@media (max-width: 700px) {
		table,
		thead,
		tbody,
		tr,
		th,
		td {
			display: block;
		}

		thead {
			display: none;
		}

		tr {
			padding: 10px 12px;
			border-bottom: 1px solid var(--line);
		}

		td {
			border: 0;
			padding: 2px 0;
		}
	}
</style>
