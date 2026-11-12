# Catalyst prototype handoff

## Run locally

```bash
npm install
npm run dev
```

```bash
npm run check
npm run build
```

## Currently built

- App shell: red sidebar (`#A0010F`), top bar, light/dark theme toggle
- Student Home at `/` — profile card, essentials grid, schedule list
- Mock data in `src/lib/data/student.js`
- Simple Arial styling (intentionally low-fidelity)

## Figma frame-to-route map

Source: [Catalyst Figma redesign](https://www.figma.com/design/QmzVctFez8wJ2DL9re1hA9/Untitled?node-id=0-1)

| Figma frame | Node | Route | Status |
| --- | --- | --- | --- |
| Student home: List view | `3:2` | `/` | Built |
| Student home: Calendar view | `5:8` | `/` | Not started |
| Academic progress | `3:84` | `/progress` | Built |
| Classes & schedule | `3:43` | `/classes` | Built |
| Academic services | `3:125` | `/services` | Not started |

## Next work

### Calendar view on Home

- Add a `ScheduleCalendar.svelte` component based on frame `5:8`.
- Wire List / Calendar toggle on the schedule panel.
- Reuse `schedule` from `src/lib/data/student.js`; do not duplicate course data.

### Academic progress page

- Add `/progress` route from frame `3:84`.
- Restore sidebar link: Academic progress.
- Point the My Academics essential card to `/progress`.
- Summary metrics, progress bars, advising contacts, in-progress requirements.

### Classes & schedule page

- Add `/classes` route from frame `3:43`.
- Restore sidebar link: Classes & schedule.
- Point the Classes & Schedule essential card (and any Manage classes link) to `/classes`.

### Academic services page

- Add `/services` route from frame `3:125`.
- Restore sidebar link: Academic services.
- Point Quick Links / related essentials to `/services`.
- Local mock search/filter for services.

### Polish

- Keyboard-accessible search overlay for `Cmd/Ctrl + K`.
- Local SVG icons from Figma (no temporary Figma asset URLs in code).
- Mobile nav drawer; check 375px / 768px / 1440px.
- Tests after interactions stabilize.

## Project map

- `src/routes/+layout.svelte` — shared app shell
- `src/routes/+page.svelte` — Student Home
- `src/lib/components/Sidebar.svelte` — navigation
- `src/lib/components/TopBar.svelte` — workspace bar + theme toggle
- `src/lib/components/ProfileCard.svelte` — student summary
- `src/lib/components/EssentialCard.svelte` — essential link tile
- `src/lib/components/ScheduleList.svelte` — weekly list
- `src/lib/data/student.js` — mock content
- `src/lib/theme.js` — light/dark theme store
- `src/app.css` — tokens

## Guardrails

- Keep API work out of UI components; swap the mock module via a load function later.
- One data source for student and schedule content.
- Routes in `src/routes`, reusable UI in `src/lib/components`.
