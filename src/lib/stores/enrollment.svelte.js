import { termOptions } from '#lib/data/student.svelte.js';
import { auth } from '#lib/stores/user.svelte.js';

const browser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
const STORAGE_KEY_PREFIX = 'catalyst.enrollment.v1.';
export const CURRENT_TERM_ID = 'fall-2026';

function storageKey() {
	return auth.username ? STORAGE_KEY_PREFIX + auth.username : null;
}

function defaultEnrolled() {
	return Object.fromEntries(
		termOptions.map((/** @type {any} */ t) => [
			t.id,
			t.courses.map((/** @type {any} */ c) => ({ ...c }))
		])
	);
}

export const enrollment = $state({
	/** @type {Record<string, any[]>} */
	enrolledByTerm: defaultEnrolled(),
	/** @type {any[]} */
	cart: []
});

function persist() {
	if (!browser) return;
	const key = storageKey();
	if (!key) return;
	try {
		localStorage.setItem(
			key,
			JSON.stringify({
				enrolledByTerm: enrollment.enrolledByTerm,
				cart: enrollment.cart
			})
		);
	} catch {
		/* storage full / disabled — ignore */
	}
}

export function hydrateFromStorage() {
	if (!browser) return;
	const key = storageKey();
	if (!key) return;
	let saved;
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return;
		saved = JSON.parse(raw);
	} catch {
		return;
	}
	if (!saved || typeof saved !== 'object') return;
	if (saved.enrolledByTerm && typeof saved.enrolledByTerm === 'object') {
		for (const [key, list] of Object.entries(saved.enrolledByTerm)) {
			if (Array.isArray(list)) enrollment.enrolledByTerm[key] = list;
		}
	}
	if (Array.isArray(saved.cart)) {
		enrollment.cart = saved.cart;
	}
}

/**
 * @param {string} termId
 * @param {string} code
 */
export function withdraw(termId, code) {
	const current = enrollment.enrolledByTerm[termId] ?? [];
	enrollment.enrolledByTerm[termId] = current.filter((c) => c.code !== code);
	persist();
}

/**
 * @param {string} termId
 * @param {any} course
 */
export function enrollIn(termId, course) {
	const current = enrollment.enrolledByTerm[termId] ?? [];
	if (current.some((c) => c.code === course.code)) return;
	enrollment.enrolledByTerm[termId] = [...current, course];
	enrollment.cart = enrollment.cart.filter((c) => c.code !== course.code);
	persist();
}

/** @param {any} course */
export function addToCart(course) {
	if (enrollment.cart.some((c) => c.code === course.code)) return;
	enrollment.cart = [...enrollment.cart, course];
	persist();
}

/** @param {string} code */
export function removeFromCart(code) {
	enrollment.cart = enrollment.cart.filter((c) => c.code !== code);
	persist();
}

export function resetToDefaults() {
	enrollment.enrolledByTerm = defaultEnrolled();
	enrollment.cart = [];
	persist();
}
