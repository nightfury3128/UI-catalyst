<script>
	import { theme, toggleTheme } from '#lib/theme.js';
	import { student } from '#lib/data/student.svelte.js';
	import { auth, logout } from '#lib/stores/user.svelte.js';

	function handleLogout() {
		logout();
		window.location.href = '/login';
	}
</script>

<header class="topbar">
	<span>My workspace</span>

	<div class="right">
		<span class="search">Search the portal</span>
		<span class="user">{student.name}</span>
		<button type="button" onclick={toggleTheme}>
			{$theme === 'light' ? 'Dark mode' : 'Light mode'}
		</button>
		{#if auth.username}
			<button type="button" class="signout" onclick={handleLogout}>Sign out</button>
		{/if}
	</div>
</header>

<style>
	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 20px;
		border-bottom: 1px solid var(--line);
		background: var(--surface);
	}

	.right {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 14px;
	}

	.search,
	.user {
		color: var(--muted);
	}

	button {
		border: 1px solid var(--line);
		background: var(--chip);
		color: var(--text);
		padding: 6px 10px;
		border-radius: 4px;
		cursor: pointer;
	}

	.signout {
		background: var(--sidebar);
		color: #fff;
		border-color: var(--sidebar);
	}

	.signout:hover {
		background: var(--sidebar-hover);
		border-color: var(--sidebar-hover);
	}

	@media (max-width: 700px) {
		.search {
			display: none;
		}
	}
</style>
