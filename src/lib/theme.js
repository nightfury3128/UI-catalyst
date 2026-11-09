import { writable } from 'svelte/store';

/** @type {'light' | 'dark'} */
const initial =
	typeof localStorage !== 'undefined' && localStorage.getItem('catalyst-theme') === 'dark'
		? 'dark'
		: 'light';

export const theme = writable(initial);

/**
 * @param {'light' | 'dark'} value
 */
export function setTheme(value) {
	theme.set(value);
	if (typeof document !== 'undefined') {
		document.documentElement.dataset.theme = value;
	}
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('catalyst-theme', value);
	}
}

export function toggleTheme() {
	theme.update((current) => {
		const next = current === 'light' ? 'dark' : 'light';
		if (typeof document !== 'undefined') {
			document.documentElement.dataset.theme = next;
		}
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('catalyst-theme', next);
		}
		return next;
	});
}
