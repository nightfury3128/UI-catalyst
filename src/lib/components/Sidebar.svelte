<script>
	import { page } from '$app/state';
	import { auth, logout } from '#lib/stores/user.svelte.js';

	function handleLogout() {
		logout();
		window.location.href = '/login';
	}
</script>

<aside class="sidebar">
	<div class="brand">
		<strong>Catalyst</strong>
		<span>Student portal</span>
	</div>

	<nav>
		<a href="/" class:active={page.url.pathname === '/'}>Home</a>
		<a href="/classes" class:active={page.url.pathname === '/classes'}>Classes &amp; schedule</a>
		<a href="/progress" class:active={page.url.pathname === '/progress'}>Academic progress</a>
	</nav>

	<div class="foot">
		<p>Need help? Talk to your advisor.</p>
		<a href="https://uc.inspire.civitaslearning.com/login">My Bearcat Network</a>
		{#if auth.username}
			<button type="button" class="logout" onclick={handleLogout}>
				Sign out ({auth.username})
			</button>
		{/if}
	</div>
</aside>

<style>
	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: 200px;
		padding: 20px 14px;
		background: var(--sidebar);
		color: var(--sidebar-text);
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.brand {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.brand strong {
		font-size: 22px;
	}

	.brand span {
		font-size: 11px;
		color: var(--sidebar-muted);
		text-transform: uppercase;
	}

	nav {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	nav a {
		padding: 10px 8px;
		border-radius: 4px;
		font-size: 14px;
	}

	nav a:hover,
	nav a.active {
		background: var(--sidebar-hover);
	}

	.foot {
		margin-top: auto;
		font-size: 12px;
	}

	.foot p {
		margin-bottom: 8px;
		color: var(--sidebar-muted);
	}

	.foot a {
		text-decoration: underline;
	}

	.logout {
		display: block;
		width: 100%;
		margin-top: 10px;
		background: transparent;
		color: var(--sidebar-text);
		border: 1px solid var(--sidebar-muted);
		padding: 8px 10px;
		font: inherit;
		font-size: 12px;
		cursor: pointer;
	}

	.logout:hover {
		background: var(--sidebar-hover);
		border-color: var(--sidebar-text);
	}

	@media (max-width: 800px) {
		.sidebar {
			position: static;
			width: 100%;
			flex-direction: row;
			align-items: center;
			gap: 12px;
		}

		.brand span,
		.foot {
			display: none;
		}

		nav {
			flex-direction: row;
			flex-wrap: wrap;
			margin-left: auto;
		}
	}
</style>
