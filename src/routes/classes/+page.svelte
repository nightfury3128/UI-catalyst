<script>
	import { availableCourses, enrollment, featuredCourseCodes, termOptions } from '#lib/data/student.svelte.js';
	import {
		addToCart as storeAddToCart,
		enrollIn as storeEnrollIn,
		enrollment as enrollmentState,
		removeFromCart as storeRemoveFromCart,
		withdraw as storeWithdraw
	} from '#lib/stores/enrollment.svelte.js';

	let activeTab = $state('manage');
	let currentTermId = $state(termOptions.find((/** @type {any} */ t) => t.name === enrollment.term)?.id ?? termOptions[0].id);

	let search = $state('');
	let subject = $state('ALL');
	let expandedCode = $state(/** @type {string | null} */ (null));
	let showFilters = $state(false);

	const emptyDays = () => ({
		Mon: false,
		Tue: false,
		Wed: false,
		Thu: false,
		Fri: false,
		Sat: false,
		Sun: false
	});

	const defaultFilters = () => ({
		courseNumberOp: 'is exactly',
		courseNumber: '',
		career: '',
		session: '',
		college: '',
		campus: '',
		openOnly: true,
		startTimeOp: 'gte',
		startTime: '',
		endTimeOp: 'lte',
		endTime: '',
		daysMode: 'include-only',
		days: emptyDays(),
		instructorOp: 'begins with',
		instructor: '',
		classNbr: '',
		minUnitsOp: 'gte',
		minUnits: '',
		maxUnitsOp: 'lte',
		maxUnits: '',
		mode: '',
		attribute: '',
		attributeValue: '',
		requirement: ''
	});

	let filters = $state(defaultFilters());

	const careerOptions = ['Undergraduate', 'Graduate', 'Professional'];
	const sessionOptions = [
		'Regular Academic Session',
		'1st 7-Week Session',
		'2nd 7-Week Session',
		'Summer 6-Week',
		'Summer 10-Week'
	];
	const collegeOptions = [
		'CEAS',
		'Arts & Sciences',
		'Business',
		'CCM',
		'DAAP',
		'Education',
		'Nursing'
	];
	const campusOptions = ['Clifton', 'Blue Ash', 'Clermont', 'Online'];
	const modeOptions = ['In Person', 'Hybrid', 'Online Asynchronous', 'Online Synchronous'];
	const attributeOptions = ['Breadth of Knowledge', 'Diversity & Culture', 'Writing Intensive'];
	const attributeValueOptions = [
		'Historical Perspectives',
		'Natural Sciences',
		'Social Sciences',
		'Fine Arts',
		'Humanities',
		'CS Electives',
		'General Education course',
		'General Elective'
	];
	const requirementOptions = [
		'General Education course',
		'CS Electives',
		'General Elective',
		'Writing Intensive'
	];

	const currentTerm = $derived(
		termOptions.find((/** @type {any} */ t) => t.id === currentTermId) ?? termOptions[0]
	);
	const enrolled = $derived(enrollmentState.enrolledByTerm[currentTermId] ?? []);
	const cart = $derived(enrollmentState.cart);
	const totalCredits = $derived(enrolled.reduce((sum, c) => sum + c.credits, 0));

	const subjectOptions = $derived([
		'ALL',
		...Array.from(new Set(availableCourses.map((c) => c.code.replace(/\d.*$/, '')))).sort()
	]);

	const takenCodes = $derived(
		new Set([...enrolled.map((c) => c.code), ...cart.map((c) => c.code)])
	);

	/** @param {string} text */
	function parseDays(text) {
		return new Set(
			text
				.split('/')
				.map((s) => s.trim())
				.filter(Boolean)
		);
	}

	/** @param {string} hhmm @param {string} meridiem */
	function toMinutes12(hhmm, meridiem) {
		const [h, m] = hhmm.split(':').map(Number);
		let hour = h ?? 0;
		if (meridiem === 'AM' && hour === 12) hour = 0;
		if (meridiem === 'PM' && hour !== 12) hour += 12;
		return hour * 60 + (m ?? 0);
	}

	/** @param {string} hhmm */
	function toMinutes24(hhmm) {
		const [h, m] = hhmm.split(':').map(Number);
		return (h ?? 0) * 60 + (m ?? 0);
	}

	/** @param {string} text @returns {{ start: number, end: number } | null} */
	function parseCourseTime(text) {
		if (!text || text === '—') return null;
		const parts = text.split(/\s*[–-]\s*/).map((s) => s.trim());
		if (parts.length !== 2) return null;
		const [startRaw, endRaw] = parts;
		const endMeridiem = /(AM|PM)/i.exec(endRaw)?.[0]?.toUpperCase() ?? 'AM';
		const startMeridiem = /(AM|PM)/i.exec(startRaw)?.[0]?.toUpperCase() ?? endMeridiem;
		/** @param {string} s */
		const stripped = (s) => s.replace(/\s*(AM|PM)\s*/i, '');
		return {
			start: toMinutes12(stripped(startRaw), startMeridiem),
			end: toMinutes12(stripped(endRaw), endMeridiem)
		};
	}

	const activeFilterCount = $derived(
		[
			filters.courseNumber.trim(),
			filters.career,
			filters.session,
			filters.college,
			filters.campus,
			filters.instructor.trim(),
			filters.classNbr.trim(),
			filters.minUnits,
			filters.maxUnits,
			filters.startTime,
			filters.endTime,
			filters.mode,
			filters.attribute,
			filters.attributeValue,
			filters.requirement
		].filter(Boolean).length +
			Object.values(filters.days).filter(Boolean).length +
			(filters.openOnly ? 0 : 1)
	);

	const hasAnyFilter = $derived(
		search.trim() !== '' || subject !== 'ALL' || activeFilterCount > 0
	);

	const filteredAvailable = $derived(
		availableCourses.filter((c) => {
			if (takenCodes.has(c.code)) return false;

			if (!hasAnyFilter) {
				return featuredCourseCodes.has(c.code);
			}

			if (subject !== 'ALL' && !c.code.startsWith(subject)) return false;

			if (search.trim()) {
				const q = search.trim().toLowerCase();
				if (!c.code.toLowerCase().includes(q) && !c.name.toLowerCase().includes(q)) return false;
			}

			if (filters.courseNumber.trim()) {
				const num = c.code.replace(/\D/g, '');
				const q = filters.courseNumber.trim();
				if (filters.courseNumberOp === 'is exactly' && num !== q) return false;
				if (filters.courseNumberOp === 'begins with' && !num.startsWith(q)) return false;
				if (filters.courseNumberOp === 'contains' && !num.includes(q)) return false;
			}

			if (filters.career && c.career !== filters.career) return false;
			if (filters.session && c.session !== filters.session) return false;
			if (filters.college && c.college !== filters.college) return false;
			if (filters.campus && c.campus !== filters.campus) return false;
			if (filters.mode && c.mode !== filters.mode) return false;
			if (filters.attribute && c.attribute !== filters.attribute) return false;
			if (filters.attributeValue && c.attributeValue !== filters.attributeValue) return false;
			if (filters.requirement && c.requirement !== filters.requirement) return false;
			if (filters.openOnly && c.seats <= 0) return false;

			if (filters.instructor.trim()) {
				const last = (c.instructor ?? '').split(' ').pop()?.toLowerCase() ?? '';
				const q = filters.instructor.trim().toLowerCase();
				if (filters.instructorOp === 'begins with' && !last.startsWith(q)) return false;
				if (filters.instructorOp === 'contains' && !last.includes(q)) return false;
			}

			if (filters.classNbr.trim() && !String(c.classNbr ?? '').includes(filters.classNbr.trim()))
				return false;

			if (filters.minUnits) {
				const n = Number(filters.minUnits);
				if (!Number.isNaN(n)) {
					if (filters.minUnitsOp === 'gte' && c.credits < n) return false;
					if (filters.minUnitsOp === 'eq' && c.credits !== n) return false;
				}
			}
			if (filters.maxUnits) {
				const n = Number(filters.maxUnits);
				if (!Number.isNaN(n)) {
					if (filters.maxUnitsOp === 'lte' && c.credits > n) return false;
					if (filters.maxUnitsOp === 'eq' && c.credits !== n) return false;
				}
			}

			const selectedDays = Object.entries(filters.days)
				.filter(([, v]) => v)
				.map(([k]) => k);
			if (selectedDays.length > 0) {
				const courseDays = parseDays(c.days);
				if (filters.daysMode === 'include-only') {
					if (![...courseDays].every((d) => selectedDays.includes(d))) return false;
				} else {
					if (![...courseDays].some((d) => selectedDays.includes(d))) return false;
				}
			}

			if (filters.startTime || filters.endTime) {
				const t = parseCourseTime(c.time);
				if (!t) return false;
				if (filters.startTime) {
					const tgt = toMinutes24(filters.startTime);
					if (filters.startTimeOp === 'gte' && t.start < tgt) return false;
					if (filters.startTimeOp === 'lte' && t.start > tgt) return false;
					if (filters.startTimeOp === 'eq' && t.start !== tgt) return false;
				}
				if (filters.endTime) {
					const tgt = toMinutes24(filters.endTime);
					if (filters.endTimeOp === 'gte' && t.end < tgt) return false;
					if (filters.endTimeOp === 'lte' && t.end > tgt) return false;
					if (filters.endTimeOp === 'eq' && t.end !== tgt) return false;
				}
			}

			return true;
		})
	);

	function clearFilters() {
		filters = defaultFilters();
		search = '';
		subject = 'ALL';
	}

	/** @param {string} tab */
	function selectTab(tab) {
		activeTab = tab;
	}

	/** @param {string} code */
	function toggleExpand(code) {
		expandedCode = expandedCode === code ? null : code;
	}

	/**
	 * @param {string} code
	 * @param {string} name
	 */
	function withdraw(code, name) {
		const ok = confirm(`Withdraw from ${code} — ${name}?\n\nThis will remove it from ${currentTerm.name}.`);
		if (!ok) return;
		storeWithdraw(currentTermId, code);
		if (expandedCode === code) expandedCode = null;
	}

	/** @param {(typeof availableCourses)[number]} course */
	function addToCart(course) {
		storeAddToCart(course);
	}

	/** @param {string} code */
	function removeFromCart(code) {
		storeRemoveFromCart(code);
	}

	/** @param {(typeof availableCourses)[number]} course */
	function enrollNow(course) {
		const newRow = {
			code: course.code,
			section: '001',
			name: course.name,
			credits: course.credits,
			fulfills: course.fulfills,
			instructor: course.instructor ?? 'Staff — TBD',
			status: 'Enrolled',
			days: course.days,
			time: course.time,
			location: course.location
		};
		storeEnrollIn(currentTermId, newRow);
	}

	function printSchedule() {
		window.print();
	}
</script>

<svelte:head>
	<title>Classes & schedule | Catalyst</title>
</svelte:head>

<header class="header">
	<div>
		<h1>Classes &amp; schedule</h1>
		<p>Plan your semester, manage enrollment, and keep moving forward.</p>
	</div>
	<label class="term">
		<span class="sr-only">Term</span>
		<select bind:value={currentTermId}>
			{#each termOptions as t}
				<option value={t.id}>{t.name}</option>
			{/each}
		</select>
	</label>
</header>

{#if enrollment.windowOpen}
	<section class="banner">
		<div>
			<p class="eyebrow">Enrollment status</p>
			<strong>Your enrollment window is open.</strong>
			<p class="muted">Assigned enrollment time: {enrollment.assignedTime}</p>
		</div>
		<button type="button" class="btn-outline" disabled title="Coming soon">
			View enrollment time ↗ <span class="soon">Coming soon</span>
		</button>
	</section>
{/if}

<div class="tabs" role="tablist">
	<button
		type="button"
		role="tab"
		aria-selected={activeTab === 'manage'}
		class:active={activeTab === 'manage'}
		onclick={() => selectTab('manage')}
	>
		Manage classes
	</button>
	<button
		type="button"
		role="tab"
		aria-selected={activeTab === 'create'}
		class:active={activeTab === 'create'}
		onclick={() => selectTab('create')}
	>
		Create my schedule
	</button>
</div>

{#if activeTab === 'manage'}
	<section class="card enrolled">
		<div class="enrolled-head">
			<div>
				<h2>Enrolled classes · {currentTerm.name}</h2>
				<p class="muted">
					{enrolled.length} classes · {totalCredits} credits · {enrollment.enrollmentCap}
				</p>
			</div>
			<button type="button" class="btn-outline" onclick={printSchedule}>
				Print schedule ↗
			</button>
		</div>

		{#if enrolled.length === 0}
			<p class="empty-row">
				No enrolled classes for {currentTerm.name}. Browse "Find your next class" below to enroll.
			</p>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Class</th>
						<th>Schedule</th>
						<th>Credits</th>
						<th>Status</th>
						<th class="actions-col">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each enrolled as course (course.code)}
						<tr>
							<td>
								<strong>{course.code} · {course.section}</strong>
								<div>{course.name}</div>
							</td>
							<td>
								{course.days} · {course.time}
								<div>{course.location}</div>
							</td>
							<td>{course.credits.toFixed(2)}</td>
							<td><span class="badge ok">{course.status}</span></td>
							<td class="actions-col">
								<button
									type="button"
									class="link-btn"
									aria-expanded={expandedCode === course.code}
									onclick={() => toggleExpand(course.code)}
								>
									{expandedCode === course.code ? 'Hide' : 'Edit'}
								</button>
								<button
									type="button"
									class="link-btn danger"
									onclick={() => withdraw(course.code, course.name)}
								>
									Withdraw
								</button>
							</td>
						</tr>
						{#if expandedCode === course.code}
							<tr class="detail-row">
								<td colspan="5">
									<div class="detail">
										<div>
											<span class="label">Fulfills</span>
											<p>{course.fulfills ?? 'Program requirement'}</p>
										</div>
										<div>
											<span class="label">Section</span>
											<p>{course.section}</p>
										</div>
										<div>
											<span class="label">Instructor</span>
											<p>{course.instructor}</p>
										</div>
										<div>
											<span class="label">Meeting</span>
											<p>{course.days} · {course.time}</p>
											<p class="muted-inline">{course.location}</p>
										</div>
										<button type="button" class="btn-outline" disabled title="Coming soon">
											View syllabus ↗ <span class="soon">Coming soon</span>
										</button>
									</div>
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		{/if}
	</section>

	<section class="find">
		<h2>Find your next class</h2>
		<p class="muted">Browse courses and add them to your enrollment cart.</p>

		{#if cart.length > 0}
			<div class="cart" aria-label="Enrollment cart">
				<div class="cart-head">
					<strong>Enrollment cart</strong>
					<span class="muted">{cart.length} course{cart.length === 1 ? '' : 's'}</span>
				</div>
				<ul>
					{#each cart as course (course.code)}
						<li>
							<div>
								<strong>{course.code}</strong>
								<span class="muted">{course.name} · {course.credits} credits</span>
							</div>
							<div class="cart-actions">
								<button type="button" class="link-btn" onclick={() => removeFromCart(course.code)}>
									Remove
								</button>
								<button type="button" class="btn-dark small" onclick={() => enrollNow(course)}>
									Enroll
								</button>
							</div>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<form class="search" onsubmit={(e) => e.preventDefault()}>
			<span class="icon" aria-hidden="true">⌕</span>
			<input
				type="search"
				placeholder="Search by course code or title"
				bind:value={search}
			/>
			<select bind:value={subject} aria-label="Subject filter">
				{#each subjectOptions as opt}
					<option value={opt}>{opt === 'ALL' ? 'All subjects' : opt}</option>
				{/each}
			</select>
			<button
				type="button"
				class="btn-outline filter-toggle"
				aria-expanded={showFilters}
				onclick={() => (showFilters = !showFilters)}
			>
				{showFilters ? 'Hide filters ▴' : 'More filters ▾'}
				{#if activeFilterCount > 0}
					<span class="count">{activeFilterCount}</span>
				{/if}
			</button>
		</form>

		{#if showFilters}
			<section class="advanced" aria-label="Advanced class search">
				<p class="advanced-hint">
					Select at least 2 search criteria. Filters apply live to the results below.
				</p>

				<h4>Class Search</h4>

				<div class="row">
					<label for="f-coursenum">Course Number</label>
					<div class="control">
						<select bind:value={filters.courseNumberOp}>
							<option value="is exactly">is exactly</option>
							<option value="begins with">begins with</option>
							<option value="contains">contains</option>
						</select>
						<input id="f-coursenum" type="text" bind:value={filters.courseNumber} />
					</div>
				</div>

				<div class="row">
					<label for="f-career">Course Career</label>
					<div class="control">
						<select id="f-career" bind:value={filters.career}>
							<option value="">—</option>
							{#each careerOptions as opt}
								<option value={opt}>{opt}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="row">
					<label for="f-session">Session</label>
					<div class="control">
						<select id="f-session" bind:value={filters.session}>
							<option value="">—</option>
							{#each sessionOptions as opt}
								<option value={opt}>{opt}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="row">
					<label for="f-college">Offering College</label>
					<div class="control">
						<select id="f-college" bind:value={filters.college}>
							<option value="">—</option>
							{#each collegeOptions as opt}
								<option value={opt}>{opt}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="row">
					<label for="f-campus">Campus</label>
					<div class="control">
						<select id="f-campus" bind:value={filters.campus}>
							<option value="">—</option>
							{#each campusOptions as opt}
								<option value={opt}>{opt}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="row">
					<span></span>
					<label class="checkbox">
						<input type="checkbox" bind:checked={filters.openOnly} />
						Show Open Classes Only
					</label>
				</div>

				<h4>Additional Search Criteria</h4>

				<div class="row">
					<label for="f-start">Meeting Start Time</label>
					<div class="control">
						<select bind:value={filters.startTimeOp}>
							<option value="gte">greater than or equal to</option>
							<option value="lte">less than or equal to</option>
							<option value="eq">equals</option>
						</select>
						<input id="f-start" type="time" bind:value={filters.startTime} />
					</div>
				</div>

				<div class="row">
					<label for="f-end">Meeting End Time</label>
					<div class="control">
						<select bind:value={filters.endTimeOp}>
							<option value="lte">less than or equal to</option>
							<option value="gte">greater than or equal to</option>
							<option value="eq">equals</option>
						</select>
						<input id="f-end" type="time" bind:value={filters.endTime} />
					</div>
				</div>

				<div class="row">
					<label for="f-daysmode">Days of Week</label>
					<div class="control stack">
						<select id="f-daysmode" bind:value={filters.daysMode}>
							<option value="include-only">include only these days</option>
							<option value="include-any">include any of these days</option>
						</select>
						<div class="days">
							<label><input type="checkbox" bind:checked={filters.days.Mon} /> Mon</label>
							<label><input type="checkbox" bind:checked={filters.days.Tue} /> Tues</label>
							<label><input type="checkbox" bind:checked={filters.days.Wed} /> Wed</label>
							<label><input type="checkbox" bind:checked={filters.days.Thu} /> Thurs</label>
							<label><input type="checkbox" bind:checked={filters.days.Fri} /> Fri</label>
							<label><input type="checkbox" bind:checked={filters.days.Sat} /> Sat</label>
							<label><input type="checkbox" bind:checked={filters.days.Sun} /> Sun</label>
						</div>
					</div>
				</div>

				<div class="row">
					<label for="f-instr">Instructor Last Name</label>
					<div class="control">
						<select bind:value={filters.instructorOp}>
							<option value="begins with">begins with</option>
							<option value="contains">contains</option>
						</select>
						<input id="f-instr" type="text" bind:value={filters.instructor} />
					</div>
				</div>

				<div class="row">
					<label for="f-nbr">Class Nbr</label>
					<div class="control">
						<input id="f-nbr" type="text" inputmode="numeric" bind:value={filters.classNbr} />
					</div>
				</div>

				<div class="row">
					<label for="f-kw">Course Keyword</label>
					<div class="control">
						<input id="f-kw" type="text" bind:value={search} />
					</div>
				</div>

				<div class="row">
					<label for="f-min">Minimum Units</label>
					<div class="control">
						<select bind:value={filters.minUnitsOp}>
							<option value="gte">greater than or equal to</option>
							<option value="eq">equals</option>
						</select>
						<input
							id="f-min"
							type="number"
							min="0"
							step="1"
							bind:value={filters.minUnits}
						/>
					</div>
				</div>

				<div class="row">
					<label for="f-max">Maximum Units</label>
					<div class="control">
						<select bind:value={filters.maxUnitsOp}>
							<option value="lte">less than or equal to</option>
							<option value="eq">equals</option>
						</select>
						<input
							id="f-max"
							type="number"
							min="0"
							step="1"
							bind:value={filters.maxUnits}
						/>
					</div>
				</div>

				<div class="row">
					<label for="f-mode">Mode of Instruction</label>
					<div class="control">
						<select id="f-mode" bind:value={filters.mode}>
							<option value="">—</option>
							{#each modeOptions as opt}
								<option value={opt}>{opt}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="row">
					<label for="f-attr">Course Attribute</label>
					<div class="control">
						<select id="f-attr" bind:value={filters.attribute}>
							<option value="">—</option>
							{#each attributeOptions as opt}
								<option value={opt}>{opt}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="row">
					<label for="f-attrval">Course Attribute Value</label>
					<div class="control">
						<select id="f-attrval" bind:value={filters.attributeValue}>
							<option value="">—</option>
							{#each attributeValueOptions as opt}
								<option value={opt}>{opt}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="row">
					<label for="f-req">Requirement Designation</label>
					<div class="control">
						<select id="f-req" bind:value={filters.requirement}>
							<option value="">—</option>
							{#each requirementOptions as opt}
								<option value={opt}>{opt}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="advanced-actions">
					<button type="button" class="btn-outline" onclick={clearFilters}>Clear</button>
					<button type="button" class="btn-dark" onclick={() => (showFilters = false)}>
						Search
					</button>
				</div>
			</section>
		{/if}

		{#if filteredAvailable.length === 0}
			<p class="empty-row">
				No matching courses. Try clearing the search, adjusting the subject, or
				<button type="button" class="link-btn" onclick={clearFilters}>reset all filters</button>.
			</p>
		{:else}
			{#each filteredAvailable as course (course.code)}
				<article class="card result">
					<div class="result-main">
						<p class="label">{course.code}</p>
						<h3>{course.name}</h3>
						<p class="muted">
							{course.days} · {course.time} • {course.location} • {course.credits} credits
						</p>
						{#if course.fulfills}
							<p class="muted small">Fulfills: {course.fulfills}</p>
						{/if}
					</div>
					<div class="result-side">
						<span class="badge ok">{course.seats} seats available</span>
						{#if course.prereqs}
							<p class="muted small">Prerequisites apply</p>
						{/if}
					</div>
					<div class="result-actions">
						<button type="button" class="btn-outline" onclick={() => addToCart(course)}>
							Add to cart
						</button>
						<button type="button" class="btn-dark" onclick={() => enrollNow(course)}>
							Enroll now →
						</button>
					</div>
				</article>
			{/each}
		{/if}
	</section>
{:else}
	<section class="card empty">
		<h2>Create my schedule</h2>
		<p class="muted">
			Schedule builder is coming soon. Head to Manage classes to enroll in or drop courses for this
			term.
		</p>
	</section>
{/if}

<footer class="foot">
	<p class="muted">
		Enrollment changes may affect financial aid. Check deadlines before withdrawing.
	</p>
	<button type="button" class="link-btn" disabled title="Coming soon">
		View deadlines ↗ <span class="soon">Coming soon</span>
	</button>
</footer>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
		margin-bottom: 20px;
	}

	h1 {
		font-size: 28px;
		font-weight: normal;
	}

	.header p {
		margin-top: 6px;
		color: var(--muted);
		font-size: 14px;
	}

	.term select {
		border: 1px solid var(--line);
		background: var(--surface);
		padding: 8px 12px;
		font: inherit;
		font-size: 13px;
		color: var(--text);
	}

	.banner {
		background: var(--warn-soft);
		border: 1px solid var(--line);
		padding: 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 20px;
	}

	.eyebrow {
		color: var(--warn);
		font-size: 11px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.banner strong {
		display: block;
		font-size: 16px;
		margin: 6px 0 4px;
	}

	.muted {
		color: var(--muted);
		font-size: 13px;
	}

	.muted.small {
		font-size: 11px;
		margin-top: 4px;
	}

	.muted-inline {
		color: var(--muted);
		font-size: 12px;
	}

	.tabs {
		display: flex;
		gap: 24px;
		border-bottom: 1px solid var(--line);
		margin-bottom: 16px;
	}

	.tabs button {
		background: none;
		border: 0;
		padding: 10px 2px;
		font-size: 13px;
		color: var(--muted);
		border-bottom: 2px solid transparent;
		margin-bottom: -1px;
	}

	.tabs button.active {
		color: var(--text);
		border-bottom-color: var(--text);
		font-weight: bold;
	}

	.card {
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 16px;
	}

	.enrolled-head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
		margin-bottom: 14px;
	}

	h2 {
		font-size: 18px;
		font-weight: normal;
	}

	.btn-outline {
		display: inline-block;
		background: var(--page);
		border: 1px solid var(--line);
		color: var(--text);
		padding: 8px 12px;
		font-size: 13px;
		cursor: pointer;
		font: inherit;
	}

	.btn-outline[disabled] {
		cursor: not-allowed;
		opacity: 0.55;
	}

	.btn-dark {
		display: inline-block;
		background: var(--text);
		color: var(--page);
		padding: 8px 12px;
		font-size: 13px;
		border: 1px solid var(--text);
		cursor: pointer;
		font: inherit;
	}

	.btn-dark.small {
		padding: 4px 10px;
		font-size: 12px;
	}

	.link-btn {
		background: none;
		border: 0;
		padding: 0;
		margin-right: 12px;
		font: inherit;
		font-size: 13px;
		color: var(--text);
		text-decoration: underline;
		cursor: pointer;
	}

	.link-btn.danger {
		color: var(--sidebar);
	}

	.link-btn[disabled] {
		cursor: not-allowed;
		opacity: 0.55;
		text-decoration: none;
	}

	.soon {
		display: inline-block;
		font-size: 10px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		opacity: 0.85;
		margin-left: 6px;
	}

	.empty-row {
		color: var(--muted);
		font-size: 13px;
		padding: 18px 2px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}

	th,
	td {
		text-align: left;
		padding: 10px 12px;
		border-top: 1px solid var(--line);
		vertical-align: top;
	}

	th {
		font-size: 11px;
		color: var(--muted);
		font-weight: normal;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		background: var(--page);
	}

	td div {
		color: var(--muted);
		font-size: 12px;
		margin-top: 2px;
	}

	.detail-row td {
		background: var(--page);
		padding: 12px;
	}

	.detail {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
		gap: 12px 20px;
		align-items: start;
	}

	.detail .label {
		display: block;
		color: var(--muted);
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin-bottom: 4px;
	}

	.detail p {
		font-size: 13px;
	}

	.actions-col {
		white-space: nowrap;
	}

	.badge {
		display: inline-block;
		padding: 3px 8px;
		font-size: 12px;
		background: var(--chip);
		color: var(--text);
		white-space: nowrap;
	}

	.badge.ok {
		background: var(--ok-soft);
		color: var(--ok);
	}

	.find {
		margin-top: 24px;
	}

	.find h2 {
		font-size: 18px;
	}

	.find p.muted {
		margin-top: 4px;
		margin-bottom: 14px;
	}

	.cart {
		background: var(--surface);
		border: 1px solid var(--line);
		border-left: 3px solid var(--sidebar);
		padding: 12px 16px;
		margin-bottom: 12px;
	}

	.cart-head {
		display: flex;
		align-items: baseline;
		gap: 10px;
		margin-bottom: 8px;
	}

	.cart ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.cart li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		padding: 6px 0;
		border-top: 1px solid var(--line);
	}

	.cart li strong {
		margin-right: 6px;
	}

	.cart-actions {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.search {
		display: grid;
		grid-template-columns: 1fr auto auto;
		gap: 10px;
		align-items: center;
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 10px;
		margin-bottom: 12px;
		position: relative;
	}

	.search .icon {
		position: absolute;
		left: 20px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--muted);
		pointer-events: none;
	}

	.search input {
		padding: 10px 10px 10px 36px;
		border: 1px solid var(--line);
		background: var(--page);
		color: var(--text);
		font: inherit;
		font-size: 13px;
	}

	.search select {
		border: 1px solid var(--line);
		background: var(--page);
		color: var(--text);
		padding: 8px 12px;
		font: inherit;
		font-size: 13px;
	}

	.filter-toggle {
		position: relative;
	}

	.filter-toggle .count {
		display: inline-block;
		margin-left: 6px;
		background: var(--sidebar);
		color: #fff;
		border-radius: 10px;
		font-size: 11px;
		padding: 1px 7px;
		min-width: 18px;
		text-align: center;
	}

	.advanced {
		background: var(--surface);
		border: 1px solid var(--line);
		border-top: 0;
		padding: 18px 20px 20px;
		margin-top: -12px;
		margin-bottom: 16px;
		display: grid;
		grid-template-columns: 170px 1fr;
		gap: 10px 14px;
		align-items: center;
	}

	.advanced-hint {
		grid-column: 1 / -1;
		color: var(--muted);
		font-size: 12px;
		margin-bottom: 4px;
	}

	.advanced h4 {
		grid-column: 1 / -1;
		font-size: 11px;
		font-weight: bold;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 10px 0 2px;
		border-top: 1px solid var(--line);
		padding-top: 12px;
	}

	.advanced h4:first-of-type {
		border-top: 0;
		padding-top: 0;
		margin-top: 2px;
	}

	.advanced .row {
		display: contents;
	}

	.advanced label {
		text-align: right;
		font-size: 13px;
		color: var(--text);
	}

	.advanced label.checkbox {
		text-align: left;
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.advanced .control {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.advanced .control.stack {
		flex-direction: column;
		align-items: flex-start;
	}

	.advanced .control select,
	.advanced .control input {
		border: 1px solid var(--line);
		background: var(--page);
		color: var(--text);
		padding: 6px 8px;
		font: inherit;
		font-size: 13px;
	}

	.advanced .control input[type='text'],
	.advanced .control input[type='number'] {
		width: 180px;
	}

	.advanced .control input[type='time'] {
		width: 130px;
	}

	.days {
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
	}

	.days label {
		text-align: left;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 13px;
	}

	.advanced-actions {
		grid-column: 1 / -1;
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 14px;
		border-top: 1px solid var(--line);
		padding-top: 14px;
	}

	.result {
		display: grid;
		grid-template-columns: 1fr auto auto;
		gap: 16px;
		align-items: center;
		margin-bottom: 10px;
	}

	.result h3 {
		font-size: 16px;
		font-weight: normal;
		margin: 4px 0;
	}

	.label {
		color: var(--muted);
		font-size: 12px;
	}

	.result-side {
		text-align: right;
	}

	.result-actions {
		display: flex;
		gap: 8px;
	}

	.empty {
		padding: 32px;
		text-align: center;
	}

	.foot {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		margin-top: 20px;
		font-size: 13px;
	}

	@media print {
		.foot,
		.find,
		.banner,
		.tabs,
		.enrolled-head button,
		.actions-col {
			display: none !important;
		}
	}

	@media (max-width: 900px) {
		.search {
			grid-template-columns: 1fr;
		}

		.advanced {
			grid-template-columns: 1fr;
		}

		.advanced label {
			text-align: left;
			font-weight: bold;
			margin-top: 6px;
		}

		.advanced .control input[type='text'],
		.advanced .control input[type='number'] {
			width: 100%;
		}

		.result {
			grid-template-columns: 1fr;
			text-align: left;
		}

		.result-side {
			text-align: left;
		}

		.detail {
			grid-template-columns: 1fr 1fr;
		}

		table,
		thead,
		tbody,
		tr,
		th,
		td {
			display: block;
		}

		thead {
			display: none;
		}

		tr {
			border-top: 1px solid var(--line);
			padding: 10px 0;
		}

		td {
			border: 0;
			padding: 2px 0;
		}
	}

	@media (max-width: 600px) {
		.header,
		.banner,
		.enrolled-head,
		.foot {
			flex-direction: column;
			align-items: flex-start;
		}

		.detail {
			grid-template-columns: 1fr;
		}
	}
</style>
