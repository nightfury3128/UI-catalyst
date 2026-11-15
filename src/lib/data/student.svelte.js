import arthurPlan from './plans/arthur.json';
import joelPlan from './plans/joel.json';
import arthurTranscript from './transcripts/arthur.json';
import joelTranscript from './transcripts/joel.json';
import curriculumData from './curriculum.json';
import usersData from './users.json';
import {
	bucketStatus,
	creditsByCategory,
	cumulativeGPA,
	earnedCredits as calcEarned
} from './progression.js';
import { auth } from '#lib/stores/user.svelte.js';

/** @typedef {{ code: string, title: string, credits: number, status: string, fulfills?: string, grade?: string | null, isSampleSelection?: boolean, isIllustrativeCourse?: boolean }} PlanCourse */
/** @typedef {{ days: string, time: string, location: string }} ScheduleMeta */

/** @type {Record<string, any>} */
const PLAN_BY_USER = { arthur: arthurPlan, joel: joelPlan };
/** @type {Record<string, any>} */
const TRANSCRIPT_BY_USER = { arthur: arthurTranscript, joel: joelTranscript };

const activeUser = usersData.users.find((u) => u.username === auth.username) ?? null;
const activePlan = activeUser ? (PLAN_BY_USER[activeUser.username] ?? arthurPlan) : arthurPlan;
const activeTranscript = activeUser
	? (TRANSCRIPT_BY_USER[activeUser.username] ?? { entries: [] })
	: /** @type {{entries: any[]}} */ ({ entries: [] });

/** @param {ReadonlyArray<{ credits: number }>} courses */
const sumCredits = (courses) => courses.reduce((sum, c) => sum + c.credits, 0);
/** @param {number} i */
const padSection = (i) => String(((i * 2) % 7) + 1).padStart(3, '0');

/** @type {Record<string, ScheduleMeta>} */
const scheduleMeta = {
	CS5001: { days: 'Mon / Wed', time: '1:00 – 2:20 PM', location: 'Rhodes 801' },
	CS5170: { days: 'Tue / Thu', time: '11:00 AM – 12:20 PM', location: 'Rhodes 801' },
	CS5155: { days: 'Mon / Wed', time: '10:00 – 11:20 AM', location: 'Baldwin 641' },
	CS5165: { days: 'Tue / Thu', time: '2:00 – 3:20 PM', location: 'Rhodes 601' },
	ECON1001: { days: 'Fri', time: '9:00 – 11:50 AM', location: 'McMicken 120' },
	CS5002: { days: 'Mon / Wed', time: '10:00 – 11:20 AM', location: 'Rhodes 801' },
	CS5167: { days: 'Mon / Wed', time: '2:30 – 3:50 PM', location: 'Rhodes 801' },
	CS5124: { days: 'Tue / Thu', time: '10:00 – 11:20 AM', location: 'Rhodes 601' },
	CS5180: { days: 'Tue / Thu', time: '1:00 – 2:20 PM', location: 'Baldwin 641' },
	MUSC1001: { days: 'Fri', time: '10:00 AM – 12:50 PM', location: 'CCM 3230' },
	CS1100: { days: 'Mon', time: '9:00 – 9:50 AM', location: 'Rhodes 100' },
	CS1021C: { days: 'Tue / Thu', time: '11:00 AM – 12:20 PM', location: 'Rhodes 601' },
	MATH1061: { days: 'Mon / Wed / Fri', time: '10:00 – 10:50 AM', location: 'McMicken 400' },
	ENGL1001: { days: 'Tue / Thu', time: '1:00 – 2:20 PM', location: 'McMicken 110' },
	ENED1100: { days: 'Mon / Wed', time: '2:00 – 3:20 PM', location: 'Baldwin 800' }
};

/** @type {Record<string, number>} */
const seatsByCode = {
	CS5167: 24,
	CS5124: 18,
	CS5180: 12,
	CS5002: 30,
	MUSC1001: 60,
	CS1100: 120,
	CS1021C: 80,
	MATH1061: 90,
	ENGL1001: 60,
	ENED1100: 70
};

/** @type {Record<string, string>} */
const careerByCode = { CS5180: 'Graduate' };

/** @type {Record<string, string>} */
const collegeByCode = { ECON1001: 'Arts & Sciences', MUSC1001: 'CCM' };

/** @type {Record<string, string>} */
const instructorByCode = {
	// Computer Science
	CS1100: 'Lara Croft',
	CS1021C: 'Aloy',
	CS2011: 'Peter Parker',
	CS2023: 'Hershel Layton',
	CS2028C: 'Faith Connors',
	CS2071: 'Jesse Faden',
	CS3003: 'Agent 47',
	CS4033: 'Isaac Clarke',
	CS4065: 'Mary Jane Watson',
	CS4071: 'Delsin Rowe',
	CS4092: 'Samus Aran',
	CS5001: 'Commander Shepard',
	CS5002: 'Phoenix Wright',
	CS5124: 'Gordon Freeman',
	CS5155: 'Alyx Vance',
	CS5165: 'Ezio Auditore',
	CS5167: 'Faith Connors',
	CS5170: 'Agent 47',
	CS5180: 'Booker DeWitt',
	// Electrical & Computer Engineering
	EECE3093C: 'Chloe Price',
	EECE4029: 'Clive Rosfield',
	// Math & Stats
	MATH1061: 'Hershel Layton',
	MATH1062: 'Noctis Lucis Caelum',
	MATH2076: 'Yuna',
	STAT2037: 'Jill Valentine',
	// Sciences
	PHYS2001: 'Gordon Freeman',
	PHYS2001L: 'Alyx Vance',
	CHEM1040: 'Jesse Faden',
	CHEM1040L: 'Heartman',
	// Humanities
	ENGL1001: 'Max Payne',
	ENGL2089: 'Ethan Mars',
	ENGL4092: 'Mary Jane Watson',
	HIST1001: 'Lee Everett',
	HIST2001: 'Bayek of Siwa',
	PHIL1001: 'Elizabeth Comstock',
	PSYC1001: 'Max Caulfield',
	SOCI1001: 'Niko Bellic',
	COMM1071: 'Phoenix Wright',
	ECON1001: 'John Marston',
	// Arts
	ART1001: 'Delsin Rowe',
	MUSC1001: 'Ellie Williams',
	// Engineering & Design
	ENED1100: 'Isaac Clarke',
	ENED1120: 'Faith Connors',
	// IT
	IT2030C: 'Adam Jensen',
	// Professional Development
	PD1011: 'Phoenix Wright',
	PD2050: 'Michael De Santa',
	// Co-op (industry mentors)
	COOP2011: 'Marcus Fenix',
	COOP2012: 'Dom Santiago',
	COOP3011: 'Nathan Drake',
	COOP4011: 'Booker DeWitt',
	COOP4012: 'Michael De Santa'
};

/**
 * @param {PlanCourse} course
 * @param {number} i
 */
const toEnrolledEntry = (course, i) => ({
	code: course.code,
	section: padSection(i),
	name: course.title,
	credits: course.credits,
	fulfills: course.fulfills ?? null,
	instructor: instructorByCode[course.code] ?? 'Staff — TBD',
	status: 'Enrolled',
	...(scheduleMeta[course.code] ?? { days: 'TBD', time: '—', location: 'TBD' })
});

/** @param {PlanCourse} course */
const toAvailableEntry = (course) => {
	const num = Number(course.code.replace(/\D/g, '').slice(0, 4));
	const classNbr =
		20000 +
		(Math.abs(course.code.split('').reduce((h, ch) => h * 31 + ch.charCodeAt(0), 7)) % 70000);
	return {
		code: course.code,
		name: course.title,
		credits: course.credits,
		fulfills: course.fulfills ?? null,
		seats: seatsByCode[course.code] ?? 10,
		prereqs: course.code.startsWith('CS') && num >= 5000,
		career: careerByCode[course.code] ?? 'Undergraduate',
		college: collegeByCode[course.code] ?? 'CEAS',
		session: 'Regular Academic Session',
		campus: 'Clifton',
		mode: 'In Person',
		attribute: course.fulfills ? 'Breadth of Knowledge' : '',
		attributeValue: course.fulfills ?? '',
		requirement: course.fulfills ?? '',
		classNbr: String(classNbr),
		instructor: instructorByCode[course.code] ?? 'Staff — TBD',
		...(scheduleMeta[course.code] ?? { days: 'TBD', time: '—', location: 'TBD' })
	};
};

const defaultTermIdx = activePlan.terms.findIndex(
	(/** @type {any} */ t) => t.id === activePlan.ui.defaultTermId
);
const currentTermObj = activePlan.terms[defaultTermIdx] ?? activePlan.terms[0];
const nextTermObj =
	defaultTermIdx >= 0 && defaultTermIdx + 1 < activePlan.terms.length
		? activePlan.terms[defaultTermIdx + 1]
		: null;

const earnedValue = calcEarned(activeTranscript);
const gpaValue = cumulativeGPA(activeTranscript);
const inProgressValue = sumCredits(currentTermObj.courses);
const earnedByCategory = creditsByCategory(activeTranscript);

const BUCKET_TOTALS = { major: 78, genEd: 27, free: 21 };
const gradedCredits = activeTranscript.entries
	.filter((/** @type {any} */ e) => e.grade && /^[A-DF][+-]?$/.test(e.grade))
	.reduce((/** @type {number} */ s, /** @type {any} */ e) => s + e.credits, 0);

export const plan = activePlan;
export const transcript = activeTranscript;
export const degreePlan = activePlan;
export const curriculum = curriculumData;

export const student = {
	name: activeUser?.name ?? 'Guest',
	initials: activeUser?.initials ?? 'G',
	level: activeUser?.level ?? 'Undergraduate',
	major: activeUser?.major ?? `${activePlan.program.name} · B.S.`,
	college: activeUser?.college ?? activePlan.program.catalog,
	id: activeUser?.studentId ?? activePlan.student.id,
	year: activeUser?.year ?? 'Senior',
	enrollment: 'Full-time',
	standing: activeUser?.standing ?? 'Good standing',
	gpa: gradedCredits > 0 ? gpaValue.toFixed(3) : null,
	earnedCredits: earnedValue,
	enrolledCredits: inProgressValue
};

export const essentials = [
	{ title: 'My Academics', description: 'Progress, grades & records', href: '/progress' },
	{ title: 'My Finances', description: 'Balance & financial aid', href: '/finances' },
	{
		title: 'My Admissions',
		description: 'Applications & decisions',
		href: '/admissions',
		beta: true
	},
	{
		title: 'Quick Links & Helpful Contacts',
		description: 'Campus services & support',
		href: '/quick-links',
		beta: true
	},
	{
		title: 'Tasks',
		description: '1 to-do · 1 service indicator',
		href: '/tasks',
		badge: '2'
	},
	{ title: 'My Profile', description: 'Personal details & preferences', href: '/profile' },
	{
		title: 'Other Tools',
		description: 'Campus apps & resources',
		href: '/other-tools',
		beta: true
	},
	{
		title: 'Scholarship Search',
		description: 'Find your next opportunity',
		href: '/scholarships',
		beta: true
	},
	{ title: 'Classes & Schedule', description: 'Plan, enroll & manage classes', href: '/classes' }
];

export const finances = {
	balance: {
		current: 1240.5,
		dueDate: 'Dec 5, 2026',
		status: 'balance_due',
		statusLabel: 'Balance due'
	},
	nextPayment: { amount: 1240.5, dueDate: 'Dec 5, 2026' },
	term: 'Fall 2026',
	summary: {
		charges: 11840.0,
		aid: -8400.0,
		payments: -2199.5
	},
	aid: [
		{
			name: 'Cincinnatus Scholarship',
			amount: 5000,
			status: 'Awarded',
			period: 'Fall 2026'
		},
		{
			name: 'UC Grant',
			amount: 2400,
			status: 'Awarded',
			period: 'Fall 2026'
		},
		{
			name: 'Federal Direct Subsidized Loan',
			amount: 1000,
			status: 'Accepted',
			period: 'Fall 2026'
		}
	],
	transactions: [
		{ date: 'Nov 1, 2026', description: 'Tuition — Fall 2026', amount: -5920.0, kind: 'charge' },
		{
			date: 'Nov 1, 2026',
			description: 'Cincinnatus Scholarship',
			amount: 2500.0,
			kind: 'aid'
		},
		{
			date: 'Oct 28, 2026',
			description: 'Student payment — ACH',
			amount: 1500.0,
			kind: 'payment'
		},
		{ date: 'Sep 15, 2026', description: 'Housing — Morgens Hall', amount: -3200.0, kind: 'charge' },
		{
			date: 'Sep 1, 2026',
			description: 'UC Grant',
			amount: 1200.0,
			kind: 'aid'
		}
	]
};

export const tasks = {
	todo: [
		{
			id: 't1',
			title: 'Submit FAFSA verification form',
			due: 'Nov 20, 2026',
			office: 'Financial Aid',
			priority: 'high'
		},
		{
			id: 't2',
			title: 'Confirm spring co-op plans with advisor',
			due: 'Dec 1, 2026',
			office: 'CEAS Advising',
			priority: 'medium'
		}
	],
	indicators: [
		{
			id: 'i1',
			title: 'Advising hold — meet with advisor to clear',
			office: 'CEAS Advising',
			severity: 'warn',
			since: 'Nov 3, 2026'
		}
	]
};

export const profileDetails = {
	contact: {
		preferredName: activeUser?.name?.split(' ')[0] ?? 'Student',
		pronouns: 'he/him',
		email: `${activeUser?.username ?? 'student'}@mail.uc.edu`,
		phone: '(513) 555-0142',
		mailingAddress: '2600 Clifton Ave, Cincinnati, OH 45220'
	},
	emergency: {
		name: 'Dutch van der Linde',
		relationship: 'Guardian',
		phone: '(513) 555-0199'
	},
	preferences: {
		communication: 'Email',
		directoryVisible: true,
		textAlerts: true
	}
};

export const progress = {
	headline: {
		earnedCredits: earnedValue,
		totalCredits: curriculumData.minimumCredits,
		cumulativeGpa: gradedCredits > 0 ? gpaValue.toFixed(3) : null,
		remainingCredits: Math.max(
			0,
			curriculumData.minimumCredits - earnedValue - inProgressValue
		),
		expectedGraduation: activeUser?.expectedGraduation ?? 'Spring 2027'
	},
	degree: {
		title: `${activePlan.program.degree} in ${activePlan.program.name}`,
		subtitle: `${activePlan.program.catalog} · ${activeUser?.level ?? 'Undergraduate'} · ${activeUser?.year ?? 'Senior'}`,
		status: 'On track',
		lastUpdated: 'Nov 9, 2026',
		requirements: [
			{
				name: 'General education',
				earned: Math.min(earnedByCategory.genEd, BUCKET_TOTALS.genEd),
				total: BUCKET_TOTALS.genEd,
				status: bucketStatus(earnedByCategory.genEd, BUCKET_TOTALS.genEd)
			},
			{
				name: 'Major requirements',
				earned: Math.min(earnedByCategory.major, BUCKET_TOTALS.major),
				total: BUCKET_TOTALS.major,
				status: bucketStatus(earnedByCategory.major, BUCKET_TOTALS.major)
			},
			{
				name: 'Free electives',
				earned: Math.min(earnedByCategory.free, BUCKET_TOTALS.free),
				total: BUCKET_TOTALS.free,
				status: bucketStatus(earnedByCategory.free, BUCKET_TOTALS.free)
			}
		],
		checks: ['GPA requirement met', 'Residency requirement met']
	},
	advisors: [
		{ name: 'Max Hadley', role: 'CEAS Academic Advisor', email: 'hadleym1@ucmail.uc.edu' },
		{ name: 'Dewey Clark', role: 'Co-op Advisor', email: 'clark2dw@ucmail.uc.edu' }
	],
	finishing: currentTermObj.courses.map(
		(/** @type {any} */ c) => ({ code: c.code, name: c.title, credits: c.credits })
	),
	stats: {
		completedCredits: earnedValue,
		inProgressCredits: inProgressValue,
		plannedCredits: nextTermObj ? sumCredits(nextTermObj.courses) : 0,
		minimumCredits: activePlan.program.minimumCredits
	}
};

export const enrollment = {
	term: currentTermObj.name,
	windowOpen: true,
	assignedTime: 'Nov 2, 2026 · 8:00 AM',
	enrollmentCap: 'Full-time'
};

export const schedule = currentTermObj.courses.map(toEnrolledEntry);

/** @type {PlanCourse[]} */
const catalogSource = [
	...activePlan.terms.flatMap((/** @type {any} */ t) => t.courses),
	...(activePlan.additionalGeneralEducationRequirements ?? []).map(
		(/** @type {any} */ r) => ({
			code: r.sampleCourse.code,
			title: r.sampleCourse.title,
			credits: r.sampleCourse.credits,
			status: 'planned',
			fulfills: r.description
		})
	)
];

/** @type {Map<string, PlanCourse>} */
const uniqueByCode = new Map();
for (const c of catalogSource) {
	if (!uniqueByCode.has(c.code)) uniqueByCode.set(c.code, c);
}

export const availableCourses = Array.from(uniqueByCode.values())
	.map(toAvailableEntry)
	.sort((a, b) => a.code.localeCompare(b.code));

export const featuredCourseCodes = new Set(
	(nextTermObj?.courses ?? []).map((/** @type {any} */ c) => c.code)
);

/** @param {any} t */
function termPhase(t) {
	const codes = t.courses.map((/** @type {any} */ c) => c.status?.toLowerCase?.() ?? '');
	if (codes.length === 0) return 'future';
	if (codes.every((/** @type {string} */ s) => s === 'planned')) return 'future';
	if (codes.some((/** @type {string} */ s) => s === 'in_progress' || s === 'in-progress')) {
		return 'current';
	}
	return 'past';
}

export const termOptions = activePlan.terms.map((/** @type {any} */ t) => ({
	id: t.id,
	name: t.name,
	courses: t.courses.map(toEnrolledEntry),
	plannedCourses: t.courses.map((/** @type {any} */ c, /** @type {number} */ i) => ({
		...toEnrolledEntry(c, i),
		planStatus: c.status
	})),
	credits: sumCredits(t.courses),
	season: t.season,
	year: t.year,
	phase: termPhase(t)
}));
