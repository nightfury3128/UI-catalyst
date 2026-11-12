import usersData from '#lib/data/users.json';

const browser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
const STORAGE_KEY = 'catalyst.auth.v1';

export const users = usersData.users;

function readStoredUsername() {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		return typeof parsed?.username === 'string' ? parsed.username : null;
	} catch {
		return null;
	}
}

export const auth = $state({
	/** @type {string | null} */
	username: readStoredUsername()
});

export function getCurrentUser() {
	return users.find((u) => u.username === auth.username) ?? null;
}

function persist() {
	if (!browser) return;
	try {
		if (auth.username) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: auth.username }));
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	} catch {
		/* storage disabled */
	}
}

/**
 * @param {string} username
 * @param {string} password
 * @returns {boolean} true if credentials matched
 */
export function login(username, password) {
	const match = users.find(
		(u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
	);
	if (!match) return false;
	auth.username = match.username;
	persist();
	return true;
}

export function logout() {
	auth.username = null;
	persist();
}
