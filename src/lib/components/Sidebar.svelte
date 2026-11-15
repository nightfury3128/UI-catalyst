<script>
	import { page } from '$app/state';
	import { tick } from 'svelte';
	import { student } from '#lib/data/student.svelte.js';
	import { auth, logout } from '#lib/stores/user.svelte.js';
	import { CURRENT_TERM_ID, enrollment } from '#lib/stores/enrollment.svelte.js';
	import { pins, togglePin, isPinned } from '#lib/stores/pins.svelte.js';

	function handleLogout() {
		logout();
		window.location.href = '/login';
	}

	const enrolledCredits = $derived(
		(enrollment.enrolledByTerm[CURRENT_TERM_ID] ?? []).reduce((sum, c) => sum + c.credits, 0)
	);

	const programShort = $derived(student.major.split('·')[0].trim());

	/** @type {{ href: string, label: string, icon: string, badge?: string }[]} */
	const navCatalog = [
		{ href: '/', label: 'Home', icon: 'home' },
		{ href: '/classes', label: 'Classes & schedule', icon: 'calendar' },
		{ href: '/progress', label: 'Academic progress', icon: 'cap' },
		{ href: '/finances', label: 'My Finances', icon: 'coin' },
		{ href: '/tasks', label: 'Tasks', icon: 'check', badge: '2' },
		{ href: '/profile', label: 'My Profile', icon: 'user' },
		{ href: '/admissions', label: 'My Admissions', icon: 'doc' },
		{ href: '/scholarships', label: 'Scholarships', icon: 'star' },
		{ href: '/quick-links', label: 'Quick Links', icon: 'link' }
	];

	const catalogByHref = $derived(new Map(navCatalog.map((n) => [n.href, n])));

	const primaryNav = [navCatalog[0]];
	const academicsChildren = [navCatalog[1], navCatalog[2]];
	const servicesTail = navCatalog.slice(3);

	/** @param {string} href */
	function isActive(href) {
		const path = page.url.pathname;
		if (href === '/') return path === '/';
		return path === href || path.startsWith(href + '/');
	}

	const academicsActive = $derived(
		academicsChildren.some((c) => isActive(c.href))
	);

	let academicsOpen = $state(false);
	$effect(() => {
		if (academicsActive) academicsOpen = true;
	});

	function toggleAcademics() {
		academicsOpen = !academicsOpen;
	}

	const pinnedItems = $derived(
		pins.items
			.map((h) => catalogByHref.get(h))
			.filter((item) => item !== undefined)
	);

	/** @type {HTMLElement | null} */
	let navEl = $state(null);
	let indicatorTop = $state(0);
	let indicatorHeight = $state(0);
	let indicatorVisible = $state(false);

	$effect(() => {
		// Depend on pathname + pins + expanded state so indicator re-measures
		const _ = page.url.pathname;
		const __ = pins.items.length;
		const ___ = academicsOpen;
		void _;
		void __;
		void ___;
		updateIndicator();
	});

	async function updateIndicator() {
		await tick();
		if (!navEl) return;
		const active = /** @type {HTMLElement | null} */ (
			navEl.querySelector('a.active')
		);
		if (!active) {
			indicatorVisible = false;
			return;
		}
		const navRect = navEl.getBoundingClientRect();
		const itemRect = active.getBoundingClientRect();
		indicatorTop = itemRect.top - navRect.top;
		indicatorHeight = itemRect.height;
		indicatorVisible = true;
	}

	/** @param {MouseEvent} e @param {string} href */
	function handlePin(e, href) {
		e.preventDefault();
		e.stopPropagation();
		togglePin(href);
	}
</script>

<aside class="sidebar">
	<div class="brand">
		<strong>Catalyst</strong>
		<span>Student portal</span>
	</div>

	{#if auth.username}
		<div class="welcome">
			<span class="eyebrow">Signed in</span>
			<strong>{student.name}</strong>
			<span class="sub">{student.year} · {programShort}</span>
		</div>
	{/if}

	<nav bind:this={navEl}>
		<span
			class="indicator"
			class:is-visible={indicatorVisible}
			style="--indicator-top: {indicatorTop}px; --indicator-height: {indicatorHeight}px"
			aria-hidden="true"
		></span>

		{#if pinnedItems.length > 0}
			<span class="group-label">Pinned</span>
			<div class="group pinned-group">
				{#each pinnedItems as item (item.href)}
					<div class="nav-item">
						<a href={item.href} class:active={isActive(item.href)}>
							{@render navIcon(item.icon)}
							<span>{item.label}</span>
							{#if item.badge}<em class="badge">{item.badge}</em>{/if}
						</a>
						<button
							type="button"
							class="pin is-pinned"
							title="Unpin"
							aria-label="Unpin {item.label}"
							onclick={(e) => handlePin(e, item.href)}
						>
							{@render pinIcon(true)}
						</button>
					</div>
				{/each}
			</div>
		{/if}

		<span class="group-label" class:spaced={pinnedItems.length > 0}>Navigate</span>
		<div class="group">
			{#each primaryNav as item}
				<div class="nav-item">
					<a href={item.href} class:active={isActive(item.href)}>
						{@render navIcon(item.icon)}
						<span>{item.label}</span>
					</a>
					<button
						type="button"
						class="pin"
						class:is-pinned={isPinned(item.href)}
						title={isPinned(item.href) ? 'Unpin' : 'Pin to top'}
						aria-label={isPinned(item.href) ? `Unpin ${item.label}` : `Pin ${item.label}`}
						onclick={(e) => handlePin(e, item.href)}
					>
						{@render pinIcon(isPinned(item.href))}
					</button>
				</div>
			{/each}
		</div>

		<span class="group-label spaced">Student services</span>
		<div class="group">
			<div class="parent-group" class:is-open={academicsOpen}>
				<button
					type="button"
					class="parent-toggle"
					class:is-open={academicsOpen}
					class:branch-active={academicsActive}
					aria-expanded={academicsOpen}
					onclick={toggleAcademics}
				>
					{@render navIcon('book')}
					<span>My Academics</span>
					<svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="m9 6 6 6-6 6"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
				<div class="submenu" class:is-open={academicsOpen}>
					<div class="submenu-inner">
						{#each academicsChildren as item}
							<div class="nav-item sub">
								<a href={item.href} class:active={isActive(item.href)}>
									{@render navIcon(item.icon)}
									<span>{item.label}</span>
								</a>
								<button
									type="button"
									class="pin"
									class:is-pinned={isPinned(item.href)}
									title={isPinned(item.href) ? 'Unpin' : 'Pin to top'}
									aria-label={isPinned(item.href)
										? `Unpin ${item.label}`
										: `Pin ${item.label}`}
									onclick={(e) => handlePin(e, item.href)}
								>
									{@render pinIcon(isPinned(item.href))}
								</button>
							</div>
						{/each}
					</div>
				</div>
			</div>

			{#each servicesTail as item}
				<div class="nav-item">
					<a href={item.href} class:active={isActive(item.href)}>
						{@render navIcon(item.icon)}
						<span>{item.label}</span>
						{#if item.badge}<em class="badge">{item.badge}</em>{/if}
					</a>
					<button
						type="button"
						class="pin"
						class:is-pinned={isPinned(item.href)}
						title={isPinned(item.href) ? 'Unpin' : 'Pin to top'}
						aria-label={isPinned(item.href) ? `Unpin ${item.label}` : `Pin ${item.label}`}
						onclick={(e) => handlePin(e, item.href)}
					>
						{@render pinIcon(isPinned(item.href))}
					</button>
				</div>
			{/each}
		</div>
	</nav>

	{#if auth.username}
		<div class="glance">
			<span class="group-label">At a glance</span>
			<div class="stat-row">
				<span>GPA</span>
				<strong>{student.gpa ?? '—'}</strong>
			</div>
			<div class="stat-row">
				<span>Credits</span>
				<strong>{student.earnedCredits} / 126</strong>
			</div>
			<div class="stat-row">
				<span>This term</span>
				<strong>{enrolledCredits} cr</strong>
			</div>
		</div>
	{/if}

	<div class="foot">
		<span class="group-label">Resources</span>
		<a
			class="bearcat"
			href="https://uc.inspire.civitaslearning.com/login"
			target="_blank"
			rel="noopener"
		>
			<span class="bearcat-text">
				<strong>My Bearcat Network</strong>
				<span>Advising &amp; success tools</span>
			</span>
			<svg viewBox="0 0 24 24" aria-hidden="true" class="arrow">
				<path
					d="M7 17 17 7M9 7h8v8"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</a>
		<p class="help">Need help? Talk to your advisor.</p>
		{#if auth.username}
			<button type="button" class="logout" onclick={handleLogout}>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path
						d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
					/>
					<path
						d="M10 8l-4 4 4 4M6 12h10"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				<span>Sign out</span>
			</button>
		{/if}
	</div>
</aside>

{#snippet navIcon(/** @type {string} */ name)}
	{#if name === 'home'}
		<svg viewBox="0 0 24 24" aria-hidden="true" class="nav-icon">
			<path
				d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linejoin="round"
			/>
		</svg>
	{:else if name === 'calendar'}
		<svg viewBox="0 0 24 24" aria-hidden="true" class="nav-icon">
			<rect
				x="3.5"
				y="5"
				width="17"
				height="15"
				rx="1.5"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
			/>
			<path d="M3.5 9h17" stroke="currentColor" stroke-width="1.6" />
			<path d="M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
		</svg>
	{:else if name === 'cap'}
		<svg viewBox="0 0 24 24" aria-hidden="true" class="nav-icon">
			<path
				d="M2.5 9 12 4l9.5 5-9.5 5z"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linejoin="round"
			/>
			<path
				d="M6 11v4.5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V11"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
			/>
			<path d="M20.5 9v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
		</svg>
	{:else if name === 'book'}
		<svg viewBox="0 0 24 24" aria-hidden="true" class="nav-icon">
			<path
				d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linejoin="round"
			/>
			<path d="M8 4v16" stroke="currentColor" stroke-width="1.6" />
			<path d="M11 9h4M11 13h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
		</svg>
	{:else if name === 'coin'}
		<svg viewBox="0 0 24 24" aria-hidden="true" class="nav-icon">
			<ellipse cx="12" cy="7" rx="7" ry="3" fill="none" stroke="currentColor" stroke-width="1.6" />
			<path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7" fill="none" stroke="currentColor" stroke-width="1.6" />
			<path d="M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" fill="none" stroke="currentColor" stroke-width="1.6" />
		</svg>
	{:else if name === 'check'}
		<svg viewBox="0 0 24 24" aria-hidden="true" class="nav-icon">
			<rect
				x="4"
				y="4"
				width="16"
				height="16"
				rx="2"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
			/>
			<path
				d="m8 12 3 3 5-6"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	{:else if name === 'user'}
		<svg viewBox="0 0 24 24" aria-hidden="true" class="nav-icon">
			<circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="1.6" />
			<path
				d="M4.5 20c.9-3.6 4-6 7.5-6s6.6 2.4 7.5 6"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
			/>
		</svg>
	{:else if name === 'doc'}
		<svg viewBox="0 0 24 24" aria-hidden="true" class="nav-icon">
			<path
				d="M6 3h8l4 4v14H6z"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linejoin="round"
			/>
			<path d="M14 3v5h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
			<path d="M9 13h6M9 17h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
		</svg>
	{:else if name === 'star'}
		<svg viewBox="0 0 24 24" aria-hidden="true" class="nav-icon">
			<path
				d="m12 3 2.6 5.6 6.1.6-4.6 4.2 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.2 6.1-.6z"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linejoin="round"
			/>
		</svg>
	{:else if name === 'link'}
		<svg viewBox="0 0 24 24" aria-hidden="true" class="nav-icon">
			<path
				d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.4 1.4"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
			/>
			<path
				d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.4-1.4"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
			/>
		</svg>
	{/if}
{/snippet}

{#snippet pinIcon(/** @type {boolean} */ filled)}
	<svg viewBox="0 0 24 24" aria-hidden="true" class="pin-svg">
		{#if filled}
			<path
				d="M14 3h-4l1 3-5 5v2h4.5v6l1.5 2 1.5-2v-6H18v-2l-5-5z"
				fill="currentColor"
				stroke="currentColor"
				stroke-width="1.2"
				stroke-linejoin="round"
			/>
		{:else}
			<path
				d="M14 3h-4l1 3-5 5v2h4.5v6l1.5 2 1.5-2v-6H18v-2l-5-5z"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linejoin="round"
			/>
		{/if}
	</svg>
{/snippet}

<style>
	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: 232px;
		padding: 20px 14px 18px;
		background: var(--sidebar);
		color: var(--sidebar-text);
		display: flex;
		flex-direction: column;
		gap: 12px;
		overflow-y: auto;
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
		letter-spacing: 0.06em;
	}

	.welcome {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 10px 10px 12px;
		background: rgba(255, 255, 255, 0.08);
		border-left: 3px solid rgba(255, 255, 255, 0.5);
	}

	.eyebrow {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--sidebar-muted);
	}

	.welcome strong {
		font-size: 14px;
	}

	.welcome .sub {
		font-size: 11px;
		color: var(--sidebar-muted);
	}

	.group-label {
		display: block;
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--sidebar-muted);
		margin-bottom: 6px;
	}

	.group-label.spaced {
		margin-top: 10px;
	}

	nav {
		position: relative;
		display: flex;
		flex-direction: column;
	}

	.group {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.pinned-group {
		padding-bottom: 6px;
		margin-bottom: 8px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.12);
	}

	.indicator {
		position: absolute;
		left: -14px;
		top: var(--indicator-top);
		height: var(--indicator-height);
		width: 3px;
		background: #ffffff;
		border-radius: 0 2px 2px 0;
		opacity: 0;
		transform: scaleY(0.6);
		transform-origin: center;
		transition:
			top 0.35s cubic-bezier(0.65, 0.05, 0.36, 1),
			height 0.35s cubic-bezier(0.65, 0.05, 0.36, 1),
			opacity 0.2s ease,
			transform 0.35s cubic-bezier(0.65, 0.05, 0.36, 1);
		pointer-events: none;
	}

	.indicator.is-visible {
		opacity: 1;
		transform: scaleY(1);
	}

	.nav-item {
		position: relative;
		display: flex;
		align-items: stretch;
	}

	.nav-item a,
	.parent-toggle {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 32px 8px 10px;
		border-radius: 4px;
		font-size: 13px;
		color: var(--sidebar-text);
		background: transparent;
		border: 0;
		cursor: pointer;
		text-align: left;
		font: inherit;
		transition:
			background 0.18s ease,
			padding-left 0.2s ease;
	}

	.nav-item.sub a {
		padding-left: 30px;
		font-size: 12.5px;
	}

	:global(.nav-icon) {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		opacity: 0.85;
	}

	.nav-item a > span,
	.parent-toggle > span {
		flex: 1;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.nav-item a:hover,
	.parent-toggle:hover {
		background: var(--sidebar-hover);
	}

	.nav-item a.active,
	.parent-toggle.branch-active {
		background: rgba(255, 255, 255, 0.15);
	}

	.nav-item a.active {
		padding-left: 12px;
	}

	.nav-item.sub a.active {
		padding-left: 30px;
	}

	.chevron {
		width: 14px;
		height: 14px;
		opacity: 0.75;
		transition: transform 0.25s cubic-bezier(0.65, 0.05, 0.36, 1);
	}

	.parent-toggle.is-open .chevron {
		transform: rotate(90deg);
	}

	.parent-group {
		display: flex;
		flex-direction: column;
	}

	.submenu {
		display: grid;
		grid-template-rows: 0fr;
		opacity: 0;
		transition:
			grid-template-rows 0.28s cubic-bezier(0.65, 0.05, 0.36, 1),
			opacity 0.22s ease;
	}

	.submenu.is-open {
		grid-template-rows: 1fr;
		opacity: 1;
	}

	.submenu-inner {
		min-height: 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.submenu.is-open .submenu-inner {
		padding-top: 2px;
		overflow: visible;
	}

	.pin {
		position: absolute;
		right: 4px;
		top: 50%;
		transform: translateY(-50%);
		width: 24px;
		height: 24px;
		display: grid;
		place-items: center;
		background: transparent;
		border: 0;
		color: var(--sidebar-muted);
		cursor: pointer;
		opacity: 0;
		transition:
			opacity 0.18s ease,
			transform 0.18s ease,
			color 0.18s ease;
		border-radius: 3px;
	}

	.nav-item:hover .pin {
		opacity: 1;
	}

	.pin.is-pinned {
		opacity: 1;
		color: #ffd166;
	}

	.pin:hover {
		color: #ffd166;
		transform: translateY(-50%) scale(1.18) rotate(-12deg);
	}

	.pin.is-pinned:hover {
		color: var(--sidebar-text);
	}

	:global(.pin-svg) {
		width: 13px;
		height: 13px;
	}

	.badge {
		position: absolute;
		right: 30px;
		top: 50%;
		transform: translateY(-50%);
		font-style: normal;
		font-size: 10.5px;
		background: #ffffff;
		color: var(--sidebar);
		padding: 1px 6px;
		border-radius: 999px;
		font-weight: 700;
		pointer-events: none;
	}

	.nav-item:hover .badge {
		opacity: 0;
	}

	.glance {
		padding: 10px 10px 12px;
		background: rgba(0, 0, 0, 0.15);
	}

	.stat-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		font-size: 12px;
		padding: 4px 0;
		color: var(--sidebar-muted);
	}

	.stat-row strong {
		color: var(--sidebar-text);
		font-size: 13px;
	}

	.foot {
		margin-top: auto;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.bearcat {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 10px 12px;
		background: #ffffff;
		color: var(--sidebar);
		border-radius: 4px;
		font-size: 13px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
		transition:
			transform 0.18s ease,
			box-shadow 0.18s ease,
			background 0.18s ease;
	}

	.bearcat:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.28);
		background: #fff8f8;
	}

	.bearcat-text {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.bearcat-text strong {
		font-size: 13px;
	}

	.bearcat-text span {
		font-size: 10.5px;
		color: var(--muted);
		letter-spacing: 0.01em;
	}

	.arrow {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		transition: transform 0.18s ease;
	}

	.bearcat:hover .arrow {
		transform: translate(2px, -2px);
	}

	.help {
		font-size: 11px;
		color: var(--sidebar-muted);
		line-height: 1.4;
	}

	.logout {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		padding: 10px 12px;
		background: rgba(0, 0, 0, 0.25);
		color: var(--sidebar-text);
		border: 1px solid rgba(255, 255, 255, 0.25);
		border-radius: 4px;
		font: inherit;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition:
			background 0.18s ease,
			border-color 0.18s ease,
			transform 0.12s ease;
	}

	.logout svg {
		width: 15px;
		height: 15px;
	}

	.logout:hover {
		background: rgba(0, 0, 0, 0.45);
		border-color: #ffffff;
	}

	.logout:active {
		transform: scale(0.98);
	}

	@media (max-width: 800px) {
		.sidebar {
			position: static;
			width: 100%;
			flex-direction: row;
			align-items: center;
			gap: 12px;
			overflow-y: visible;
		}

		.brand span,
		.welcome,
		.glance,
		.foot .help,
		.group-label,
		.indicator,
		.pin {
			display: none;
		}

		nav {
			flex-direction: row;
			flex-wrap: wrap;
			margin-left: auto;
		}

		.group {
			flex-direction: row;
			flex-wrap: wrap;
		}

		.foot {
			flex-direction: row;
			align-items: center;
			gap: 8px;
			margin-top: 0;
		}

		.submenu {
			display: contents;
		}
	}
</style>
