/** @typedef {{ code: string, credits: number, term: string, grade: string }} TranscriptEntry */
/** @typedef {{ entries: TranscriptEntry[] }} Transcript */
/** @typedef {{ code: string, title: string, credits: number }} RequiredCourse */
/** @typedef {{ minimumCredits: number, requiredCourses: RequiredCourse[], freeElectiveCredits: number, maxCreditsPerSemester: number }} Curriculum */

/** @type {Record<string, number>} */
const GRADE_POINTS = {
	A: 4.0,
	'A-': 3.7,
	'B+': 3.3,
	B: 3.0,
	'B-': 2.7,
	'C+': 2.3,
	C: 2.0,
	'C-': 1.7,
	'D+': 1.3,
	D: 1.0,
	'D-': 0.7,
	F: 0.0
};

const NON_GPA_PASSING = new Set(['S', 'CR', 'P']);
const NON_PASSING = new Set(['F', 'W', 'I', 'IP', 'NC', 'U']);

/**
 * D- or better counts as passing. S / CR / P are pass but not in GPA.
 * @param {string} grade
 */
export function isPassingGrade(grade) {
	if (!grade) return false;
	if (NON_PASSING.has(grade)) return false;
	if (NON_GPA_PASSING.has(grade)) return true;
	return grade in GRADE_POINTS && GRADE_POINTS[grade] >= GRADE_POINTS['D-'];
}

/** @param {Transcript} transcript */
export function earnedCredits(transcript) {
	return transcript.entries
		.filter((e) => isPassingGrade(e.grade))
		.reduce((sum, e) => sum + e.credits, 0);
}

/** @param {Transcript} transcript */
export function cumulativeGPA(transcript) {
	const graded = transcript.entries.filter((e) => e.grade in GRADE_POINTS);
	const totalPoints = graded.reduce((sum, e) => sum + GRADE_POINTS[e.grade] * e.credits, 0);
	const totalCredits = graded.reduce((sum, e) => sum + e.credits, 0);
	return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

/** @param {Transcript} transcript */
export function takenCodes(transcript) {
	return new Set(
		transcript.entries.filter((e) => isPassingGrade(e.grade)).map((e) => e.code)
	);
}

/**
 * Required courses the student has not yet passed.
 * @param {Curriculum} curriculum
 * @param {Set<string>} takenSet
 */
export function remainingRequiredCourses(curriculum, takenSet) {
	return curriculum.requiredCourses.filter((c) => !takenSet.has(c.code));
}

/**
 * Credits of free-elective bucket already satisfied.
 * Any passing credit from a course NOT in the required list counts.
 * @param {Curriculum} curriculum
 * @param {Transcript} transcript
 */
export function freeElectiveCreditsEarned(curriculum, transcript) {
	const requiredCodes = new Set(curriculum.requiredCourses.map((c) => c.code));
	return transcript.entries
		.filter((e) => isPassingGrade(e.grade) && !requiredCodes.has(e.code))
		.reduce((sum, e) => sum + e.credits, 0);
}

const MAJOR_PREFIXES = ['CS', 'EECE', 'IT', 'MATH', 'STAT', 'PHYS', 'CHEM', 'ENED', 'PD'];
const GENED_PREFIXES = ['ENGL', 'COMM', 'HIST', 'PSYC', 'PHIL', 'SOCI', 'ART'];

/** @param {string} code */
function codePrefix(code) {
	return code.replace(/\d.*$/, '');
}

/**
 * @param {string} code
 * @returns {'major' | 'genEd' | 'free'}
 */
export function classifyCourse(code) {
	const prefix = codePrefix(code);
	if (MAJOR_PREFIXES.includes(prefix)) return 'major';
	if (GENED_PREFIXES.includes(prefix)) return 'genEd';
	return 'free';
}

/**
 * @param {Transcript} transcript
 * @returns {{ major: number, genEd: number, free: number }}
 */
export function creditsByCategory(transcript) {
	let major = 0;
	let genEd = 0;
	let free = 0;
	for (const e of transcript.entries) {
		if (!isPassingGrade(e.grade)) continue;
		const cat = classifyCourse(e.code);
		if (cat === 'major') major += e.credits;
		else if (cat === 'genEd') genEd += e.credits;
		else free += e.credits;
	}
	return { major, genEd, free };
}

/**
 * @param {number} earned
 * @param {number} total
 * @returns {'Complete' | 'In progress' | 'Not started'}
 */
export function bucketStatus(earned, total) {
	if (earned >= total) return 'Complete';
	if (earned > 0) return 'In progress';
	return 'Not started';
}

/**
 * Add N fall/spring semesters to a term label like "Fall 2026" → "Spring 2027".
 * Only Fall and Spring; summer is skipped per spec.
 * @param {string} label
 * @param {number} n
 */
export function addSemesters(label, n) {
	const [seasonRaw, yearStr] = label.split(' ');
	let season = seasonRaw;
	let year = parseInt(yearStr, 10);
	for (let i = 0; i < n; i++) {
		if (season === 'Fall') {
			season = 'Spring';
			year += 1;
		} else {
			season = 'Fall';
		}
	}
	return `${season} ${year}`;
}

/**
 * Cap future semesters at `cap` credits; Fall/Spring only.
 * @param {string} currentTermLabel
 * @param {number} remainingCredits
 * @param {number} [cap]
 */
export function projectGraduation(currentTermLabel, remainingCredits, cap = 18) {
	if (remainingCredits <= 0) return currentTermLabel;
	const semestersNeeded = Math.ceil(remainingCredits / cap);
	return addSemesters(currentTermLabel, semestersNeeded);
}
