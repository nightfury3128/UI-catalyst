<script>
	import { theme, toggleTheme } from '#lib/theme.js';
	import { student } from '#lib/data/student.svelte.js';

	const isDark = $derived($theme === 'dark');
</script>

<header class="topbar">
	<span class="workspace">My workspace</span>

	<div class="right">
		<span class="search">Search the portal</span>
		<span class="user">{student.name}</span>

		<button
			type="button"
			class="theme-toggle"
			class:is-dark={isDark}
			role="switch"
			aria-checked={isDark}
			aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
			title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
			onclick={toggleTheme}
		>
			<span class="track">
				<svg class="icon sun" viewBox="0 0 24 24" aria-hidden="true">
					<circle cx="12" cy="12" r="4" fill="currentColor" />
					<g stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<line x1="12" y1="2" x2="12" y2="4" />
						<line x1="12" y1="20" x2="12" y2="22" />
						<line x1="2" y1="12" x2="4" y2="12" />
						<line x1="20" y1="12" x2="22" y2="12" />
						<line x1="4.9" y1="4.9" x2="6.3" y2="6.3" />
						<line x1="17.7" y1="17.7" x2="19.1" y2="19.1" />
						<line x1="4.9" y1="19.1" x2="6.3" y2="17.7" />
						<line x1="17.7" y1="6.3" x2="19.1" y2="4.9" />
					</g>
				</svg>
				<svg class="icon moon" viewBox="0 0 24 24" aria-hidden="true">
					<path
						d="M20 14.5A8 8 0 0 1 9.5 4a.75.75 0 0 0-1-.9A9.5 9.5 0 1 0 20.9 15.5a.75.75 0 0 0-.9-1z"
						fill="currentColor"
					/>
				</svg>
				<span class="thumb"></span>
			</span>
		</button>
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
		gap: 14px;
		font-size: 14px;
	}

	.search,
	.user {
		color: var(--muted);
	}

	.theme-toggle {
		background: transparent;
		border: 0;
		padding: 0;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
	}

	.theme-toggle:focus-visible .track {
		outline: 2px solid var(--sidebar);
		outline-offset: 2px;
	}

	.track {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		width: 58px;
		height: 28px;
		padding: 0 7px;
		border-radius: 999px;
		background: linear-gradient(135deg, #fde68a, #fbbf24);
		border: 1px solid rgba(0, 0, 0, 0.1);
		transition:
			background 0.4s ease,
			border-color 0.4s ease,
			box-shadow 0.4s ease;
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
	}

	.theme-toggle.is-dark .track {
		background: linear-gradient(135deg, #1e293b, #334155);
		border-color: rgba(255, 255, 255, 0.15);
		box-shadow:
			inset 0 1px 2px rgba(0, 0, 0, 0.4),
			0 0 10px rgba(99, 102, 241, 0.25);
	}

	.icon {
		width: 14px;
		height: 14px;
		z-index: 1;
		transition:
			opacity 0.35s ease,
			transform 0.35s ease;
	}

	.icon.sun {
		color: #ffffff;
		filter: drop-shadow(0 0 2px rgba(249, 115, 22, 0.6));
	}

	.icon.moon {
		color: #e0e7ff;
	}

	.theme-toggle.is-dark .sun {
		opacity: 0.25;
		transform: scale(0.85) rotate(-40deg);
	}

	.theme-toggle:not(.is-dark) .moon {
		opacity: 0.25;
		transform: scale(0.85) rotate(40deg);
	}

	.thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: #ffffff;
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.25),
			inset 0 -1px 2px rgba(0, 0, 0, 0.08);
		transition:
			transform 0.4s cubic-bezier(0.68, -0.4, 0.32, 1.4),
			background 0.4s ease;
	}

	.theme-toggle.is-dark .thumb {
		transform: translateX(30px);
		background: #e2e8f0;
		box-shadow:
			0 2px 6px rgba(0, 0, 0, 0.45),
			inset 0 -2px 3px rgba(0, 0, 0, 0.2),
			0 0 6px rgba(226, 232, 240, 0.4);
	}

	@media (max-width: 700px) {
		.search {
			display: none;
		}
	}
</style>
