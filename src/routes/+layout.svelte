<script>
	import { onMount } from 'svelte';
	import favicon from '#lib/assets/favicon.svg';
	import Sidebar from '#lib/components/Sidebar.svelte';
	import TopBar from '#lib/components/TopBar.svelte';
	import { setTheme, theme } from '#lib/theme.js';
	import '../app.css';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();

	onMount(() => {
		setTheme($theme);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Catalyst Student Portal</title>
</svelte:head>

<div class="shell">
	<Sidebar />
	<div class="main">
		<TopBar />
		<div class="content">{@render children()}</div>
	</div>
</div>

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
