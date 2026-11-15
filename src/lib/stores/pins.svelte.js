import { auth } from '#lib/stores/user.svelte.js';

const browser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
const STORAGE_KEY_PREFIX = 'catalyst.pins.v1.';

function storageKey() {
	return auth.username ? STORAGE_KEY_PREFIX + auth.username : null;
}

export const pins = $state({
	/** @type {string[]} */
	items: []
});

function persist() {
	if (!browser) return;
	const key = storageKey();
	if (!key) return;
	try {
		localStorage.setItem(key, JSON.stringify(pins.items));
	} catch {
		/* storage full / disabled */
	}
}

export function hydratePins() {
	if (!browser) return;
	const key = storageKey();
	if (!key) return;
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return;
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) {
			pins.items = parsed.filter((v) => typeof v === 'string');
		}
	} catch {
		/* ignore */
	}
}

/** @param {string} href */
export function isPinned(href) {
	return pins.items.includes(href);
}

/** @param {string} href */
export function togglePin(href) {
	if (pins.items.includes(href)) {
		pins.items = pins.items.filter((h) => h !== href);
	} else {
		pins.items = [...pins.items, href];
	}
	persist();
}
