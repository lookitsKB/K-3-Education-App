# Mastery Tutor (K–3, Alberta)

A mastery-learning tutor for reading and math. Children advance when they prove a skill, not by grade.

## Open it

Double-click `index.html`. It opens in your browser and needs nothing installed.
Progress is saved in that browser only; use **Grown-ups → Download backup** now and then.

## How it works

| File | What it does |
| --- | --- |
| `js/curriculum.js` | The curriculum graph: 25 reading and 28 math skills, K to Grade 3, with prerequisites |
| `js/words.js` | Word lists and reading passages |
| `js/items.js` | Turns a skill into a practice question |
| `js/engine.js` | Mastery rules: 5 of the last 6 correct, then spaced reviews at 1, 3, 7, 21 and 60 days |
| `js/planner.js` | Builds each day's session, and runs the placement check |
| `js/app.js` | The screens: kid app and grown-ups area |

- **First time:** a short placement check (about 20 questions) finds where the child is in each subject.
- **Each session:** warm-up reviews, then reading, then math, then one easy finisher. A strong learner can master many skills in one day.
- **Wrong answers:** one retry, then the answer is shown. Three misses on a skill pauses it until the next session.
- **Grown-ups area** (behind a multiplication question): skill map, settings, overrides, session history, backup.

## Not built yet

- Science, Social Studies, Wellness and Fine Arts
- Offline missions and the content approval queue
- Hosting, so it can run on the iPad
- Accounts and a database, for use across devices and by other families
- Grade labels mapped to exact Alberta outcome codes (current labels are estimates)
