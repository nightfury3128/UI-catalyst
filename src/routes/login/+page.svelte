<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { auth, login, users } from '#lib/stores/user.svelte.js';

	let username = $state('');
	let password = $state('');
	let error = $state('');

	onMount(() => {
		if (auth.username) {
			goto('/');
		}
	});

	/** @param {SubmitEvent} e */
	function handleSubmit(e) {
		e.preventDefault();
		error = '';
		const ok = login(username, password);
		if (!ok) {
			error = 'Invalid username or password';
			return;
		}
		window.location.href = '/';
	}

	/** @param {{username: string, password: string}} u */
	function fill(u) {
		username = u.username;
		password = u.password;
		error = '';
	}
</script>

<svelte:head>
	<title>Sign in | Catalyst</title>
</svelte:head>

<div class="screen">
	<div class="card">
		<div class="brand">
			<strong>Catalyst</strong>
			<span>Student portal</span>
		</div>

		<h1>Sign in to your workspace</h1>
		<p class="sub">Use your Bearcat credentials to continue.</p>

		<form onsubmit={handleSubmit}>
			<label>
				<span>Username</span>
				<input
					type="text"
					bind:value={username}
					autocomplete="username"
					autocapitalize="none"
					spellcheck="false"
					required
				/>
			</label>

			<label>
				<span>Password</span>
				<input type="password" bind:value={password} autocomplete="current-password" required />
			</label>

			{#if error}
				<p class="error" role="alert">{error}</p>
			{/if}

			<button type="submit" class="submit">Sign in</button>
		</form>

		<div class="demo">
			<p class="demo-head">Demo accounts (click to prefill)</p>
			<ul>
				{#each users as u}
					<li>
						<button type="button" class="demo-btn" onclick={() => fill(u)}>
							<strong>{u.name}</strong>
							<span>username: <code>{u.username}</code> · password: <code>{u.password}</code></span>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>

<style>
	.screen {
		min-height: 100vh;
		background: var(--page);
		color: var(--text);
		display: grid;
		place-items: center;
		padding: 40px 20px;
	}

	.card {
		width: 100%;
		max-width: 440px;
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 32px 28px;
	}

	.brand {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-bottom: 24px;
	}

	.brand strong {
		font-size: 22px;
		color: var(--sidebar);
	}

	.brand span {
		font-size: 11px;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	h1 {
		font-size: 22px;
		font-weight: normal;
		margin: 0;
	}

	.sub {
		margin: 6px 0 20px;
		color: var(--muted);
		font-size: 13px;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 13px;
	}

	label span {
		color: var(--muted);
	}

	input {
		border: 1px solid var(--line);
		background: var(--page);
		color: var(--text);
		padding: 10px 12px;
		font: inherit;
		font-size: 14px;
	}

	input:focus {
		outline: 2px solid var(--sidebar);
		outline-offset: 1px;
	}

	.submit {
		margin-top: 6px;
		background: var(--sidebar);
		color: #fff;
		border: 0;
		padding: 12px;
		font: inherit;
		font-size: 14px;
		cursor: pointer;
	}

	.submit:hover {
		background: var(--sidebar-hover);
	}

	.error {
		color: #a0010f;
		font-size: 13px;
		margin: 2px 0 0;
	}

	.demo {
		margin-top: 28px;
		padding-top: 20px;
		border-top: 1px solid var(--line);
	}

	.demo-head {
		font-size: 11px;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0 0 10px;
	}

	.demo ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.demo-btn {
		display: block;
		width: 100%;
		text-align: left;
		background: var(--chip);
		border: 1px solid var(--line);
		color: var(--text);
		padding: 10px 12px;
		font: inherit;
		cursor: pointer;
	}

	.demo-btn:hover {
		border-color: var(--sidebar);
		background: var(--surface);
	}

	.demo-btn strong {
		display: block;
		font-size: 13px;
		color: var(--text);
	}

	.demo-btn span {
		display: block;
		color: var(--text);
		opacity: 0.85;
		font-size: 12px;
		margin-top: 4px;
	}

	code {
		background: var(--surface);
		color: var(--text);
		padding: 2px 6px;
		font-size: 12px;
		border: 1px solid var(--line);
		border-radius: 3px;
	}
</style>
