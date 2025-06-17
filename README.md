# Progress v0.1 (MVP)

My personal gamified productivity app. Allows for tracking habits, projects, ideas, tags and much more. I am already using it for a while and i love it!

However it might still be confusing for users who don't know whats going on under the hood. Will add improvements with time.
(btw. Editing mode is hidden -> hit e on keyboard lol)

---

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS (did not test)
$ npm run build:mac

# For Linux (did not test)
$ npm run build:linux
```

Find the .exe file in the dist -> win-unpacked folder

---

## Tech-Stack

- Electron
- Vue
- Pinia
- Vite
- Lowdb

---

## Modules

### Timer

Tracks time spent on a project. Acts like a flexible pomodoro timer. (1-120 minutes). In case of not using the PC you can manually add time to a project. It will always be added to the currently active project and the quest which is assigned first inside this project.

### Quests

Represent my projects. Each questline (project) can have multiple sub-quests. Sub-quests can be assigned a tag and various tasks. Depending on the amount of time spent and completed tasks, the quest rewards will be calculated.

Rewards include:

- Global EXP
- Tag EXP
- Crystals

### Ideas

Serve as a backlog for my ideas. I can store them and convert them to quests later if I decide to tackle them.

### Habit (Stacks)

Represent my habits. I can create habit stacks and add habits to them. They level up based on the counter & best streak. Rewards grow with your streak. Streaks reset if you miss a day.

Rewards include:

- Global EXP
- Tag EXP
- Crystals

### Tags

Tags represent your passions and skills in real life. They level up based on the amount of time spent on a project with this tag and on your habit completions.

### Rewards

You can declare your own rewards and set a price for them. You can then buy them with crystals. They are either repeatable or one-time purchases.

### Progression

Leveling up comes with a rank progression for tags, habits and projects. The level cap is 60. It is an exponential progression. (The higher the level, the more EXP is needed to level up)

Ranks:

- Common (white)
- Uncommon (green)
- Rare (blue)
- Epic (purple)
- Legendary (orange)

---

## Future Improvements

**Code Cleanup**

- SCSS -> BEM
- Extract DB Handler logic to reusable functions (if needed)
- Rework parts of the architecture
- Think about ways to minimize separate files

**Features**

- Achievements
- Settings (Themes, Import/Export DB...)
- More sophisticated Statistics

**UI/UX**

- Rework UI to be more intuitive
- Redesign UI
- Animations
- Sound Effects

---

## Bug Log (starting with MVP 0.1)

- 17.06.2025: Quest Rewards calculate wrong | resolved ✅ (adapted IPC handler)
- 17.06.2025: Timer finished Notification Spams | not resolved ⛔
- 17.06.2025: Edit-Mode lags when editing multiple items | not resolved ⛔
- 16.06.2025: Timer throttling when minimized | resolved ✅ (moved to main process)
- 15.06.2025: Loose Data After Quest Deletion | resolved ✅ (cascading delete)
- 14.06.2025: Corrupted Position values in DB | resolved ✅ (implemented normalize function)
- 13.06.2025: Tags not accessible in Quests | resolved ✅ (fixed passed ref to component)
