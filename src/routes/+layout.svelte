<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import favicon from '#lib/assets/favicon.svg';
	import Sidebar from '#lib/components/Sidebar.svelte';
	import TopBar from '#lib/components/TopBar.svelte';
	import { hydrateFromStorage } from '#lib/stores/enrollment.svelte.js';
	import { auth } from '#lib/stores/user.svelte.js';
	import { setTheme, theme } from '#lib/theme.js';
	import '../app.css';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();

	const isLoginRoute = $derived(page.url.pathname === '/login');

	onMount(() => {
		setTheme($theme);
		if (!auth.username && !isLoginRoute) {
			goto('/login');
			return;
		}
		if (auth.username) {
			hydrateFromStorage();
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Catalyst Student Portal</title>
</svelte:head>

{#if isLoginRoute}
	{@render children()}
{:else if auth.username}
	<div class="shell">
		<Sidebar />
		<div class="main">
			<TopBar />
			<div class="content">{@render children()}</div>
		</div>
	</div>
{/if}

<style>
	.shell {
		min-height: 100vh;
	}

	.main {
		margin-left: 200px;
	}

	.content {
		padding: 20px;
	}

	@media (max-width: 800px) {
		.main {
			margin-left: 0;
		}
	}
</style>
