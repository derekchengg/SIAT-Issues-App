# SIAT Issue Management App Prototype
---
Website Link: https://pages.github.sfu.ca/dca130/SIATIssueApp/login.html
Figma Process: https://www.figma.com/design/91C7mADXqcoZdUAZkTJS1C/Project-4?node-id=239-2859&t=zkfBNoV7XB3wAfNx-1

## Page Features

### Login Page
- SFU-branded layout
- Username and password fields
- “Forgot password?” and “Need help?” links
- Sign-in button redirects to dashboard
- Fully responsive and centered layout

---

### Dashboard
- Shows all submitted issues
- Filter tabs: `All`, `Open`, `Solved`
- Issue cards include:
  - Status indicator (New, In Progress, Completed)
  - Tags, votes, and description
  - Voting system (with localStorage to save state)
  - Reply section
- Clicking a card shows detailed view in side panel
- Mobile: Cards expand to full screen

---

### Create Issue
- Form with fields:
  - Title
  - Description
  - Tags and Categories
- Buttons for “Create” and “Cancel”
- Mobile-friendly form layout
- Uses shared form styles from design system

---

### Notification Page
- List of recent updates:
  - New comments
  - Proposed solutions
- Filter tabs: `All`, `Unread`
- Clicking an item shows the related issue details
- Includes vote count, comments, and solution info
- Fully responsive, with tab switching on mobile

---

### Profile Page
- Displays user avatar, name, and role
- Tabs: `My Issues`, `Activity`
  - **My Issues**: List of issues user submitted
  - **Activity**: Shows things like comments, updates
- All cards are styled like dashboard
- Tabs switch content dynamically

---

### Search Page
- Search bar with recent searches
- Slide-in filter panel with:
  - Category filters (Feature, Bug, UI/UX, etc.)
  - Status filters (New, Completed)
- Mobile: Filter sidebar slides in with overlay
- Clicking a recent search fills the search box

---

## How It Works

- `global.css`: Shared colors, fonts, spacing, buttons, and layouts
- `global.js`: Handles logic like:
  - Voting
  - Tab switching
  - Showing/hiding issue details
  - Mobile adaptations

---

## Responsive Design

- Desktop: sidebar + wide layout
- Mobile:
  - Sidebar hidden, replaced with bottom navigation
  - Cards, forms, filters adapt to smaller screens
- Built with **Flexbox**, **Grid**, and **media queries**

---

