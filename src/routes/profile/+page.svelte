<script>
	import { profileDetails, student } from '#lib/data/student.svelte.js';

	const { contact, emergency, preferences } = profileDetails;
</script>

<svelte:head>
	<title>My Profile | Catalyst</title>
</svelte:head>

<header class="header">
	<div>
		<h1>My Profile</h1>
		<p>Personal details and communication preferences we have on file.</p>
	</div>
	<button type="button" class="ghost" disabled title="Editing coming soon">Edit details</button>
</header>

<section class="identity card">
	<div class="avatar">{student.initials}</div>
	<div>
		<h2>{student.name}</h2>
		<p>{student.major}</p>
		<p class="meta">{student.college} · ID {student.id}</p>
	</div>
</section>

<div class="grid">
	<section class="card">
		<h3>Contact</h3>
		<dl>
			<div><dt>Preferred name</dt><dd>{contact.preferredName}</dd></div>
			<div><dt>Pronouns</dt><dd>{contact.pronouns}</dd></div>
			<div><dt>Email</dt><dd>{contact.email}</dd></div>
			<div><dt>Phone</dt><dd>{contact.phone}</dd></div>
			<div><dt>Mailing address</dt><dd>{contact.mailingAddress}</dd></div>
		</dl>
	</section>

	<section class="card">
		<h3>Emergency contact</h3>
		<dl>
			<div><dt>Name</dt><dd>{emergency.name}</dd></div>
			<div><dt>Relationship</dt><dd>{emergency.relationship}</dd></div>
			<div><dt>Phone</dt><dd>{emergency.phone}</dd></div>
		</dl>
	</section>

	<section class="card">
		<h3>Preferences</h3>
		<dl>
			<div><dt>Primary communication</dt><dd>{preferences.communication}</dd></div>
			<div>
				<dt>Directory visibility</dt>
				<dd>{preferences.directoryVisible ? 'Visible' : 'Hidden'}</dd>
			</div>
			<div>
				<dt>Text alerts</dt>
				<dd>{preferences.textAlerts ? 'Enabled' : 'Disabled'}</dd>
			</div>
		</dl>
	</section>
</div>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
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

	.ghost {
		background: transparent;
		border: 1px solid var(--line);
		padding: 8px 14px;
		font: inherit;
		font-size: 13px;
		color: var(--text);
		cursor: pointer;
	}

	.ghost:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.card {
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 18px;
	}

	.identity {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 16px;
	}

	.avatar {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: var(--sidebar);
		color: #ffffff;
		display: grid;
		place-items: center;
		font-weight: bold;
		font-size: 22px;
		flex-shrink: 0;
	}

	.identity h2 {
		font-size: 20px;
		margin-bottom: 2px;
	}

	.identity p {
		font-size: 13px;
	}

	.identity .meta {
		margin-top: 4px;
		color: var(--muted);
		font-size: 12px;
	}

	h3 {
		font-size: 14px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--muted);
		font-weight: normal;
		margin-bottom: 12px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 16px;
	}

	dl {
		margin: 0;
		display: flex;
		flex-direction: column;
	}

	dl > div {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding: 8px 0;
		border-top: 1px solid var(--line);
		font-size: 13.5px;
	}

	dl > div:first-child {
		border-top: 0;
	}

	dt {
		color: var(--muted);
		font-size: 12px;
	}

	dd {
		margin: 0;
		text-align: right;
		font-weight: 500;
		min-width: 0;
		word-break: break-word;
	}
</style>
