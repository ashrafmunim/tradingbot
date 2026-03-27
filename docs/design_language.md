# GovTravel Design Language Guide

A comprehensive design system for building modern government enterprise applications with React/Next.js and Tailwind CSS.

---

## Table of Contents
1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Components](#components)
5. [Navigation](#navigation)
6. [Icons](#icons)
7. [Animation](#animation)
8. [Feedback & Notifications](#feedback--notifications)
9. [Empty States & Error Pages](#empty-states--error-pages)
10. [Chat UI Patterns](#chat-ui-patterns)
11. [Approval Workflow UI](#approval-workflow-ui)
12. [Dark Mode](#dark-mode)
13. [Internationalization (BM/EN)](#internationalization-bmen)
14. [Responsive Design](#responsive-design)
15. [Z-Index & Shadows](#z-index--shadows)
16. [Accessibility](#accessibility)

---

## Color System

### Primary Colors
```css
/* Primary Blue - Main actions, links, highlights */
--primary: #1a73e8;
--primary-hover: #1557b0;
--primary-light: #e8f0fe;

/* In Tailwind */
text-[#1a73e8]
bg-[#1a73e8]
hover:bg-[#1557b0]
border-[#1a73e8]
```

### Semantic Colors
```css
/* Success - Approvals, completed, positive */
--success: emerald-500/600
--success-bg: emerald-50 / dark:emerald-900/20

/* Warning - Pending, attention needed */
--warning: amber-500/600
--warning-bg: amber-50 / dark:amber-900/20

/* Error - Rejections, errors, critical */
--error: rose-500/600
--error-bg: rose-50 / dark:rose-900/20

/* Info - Informational, neutral */
--info: blue-500/600
--info-bg: blue-50 / dark:blue-900/20
```

### Background Colors
```css
/* Light Mode */
--bg-page: #f0f4f8          /* bg-[#f0f4f8] */
--bg-card: white            /* bg-white */
--bg-elevated: slate-50     /* bg-slate-50 */

/* Dark Mode */
--bg-page: slate-900        /* dark:bg-slate-900 */
--bg-card: slate-800        /* dark:bg-slate-800 */
--bg-elevated: slate-800/50 /* dark:bg-slate-800/50 */
```

### Text Colors
```css
/* Light Mode */
--text-primary: gray-900      /* text-gray-900 */
--text-secondary: gray-600    /* text-gray-600 */
--text-muted: gray-400        /* text-gray-400 */

/* Dark Mode */
--text-primary: slate-100     /* dark:text-slate-100 */
--text-secondary: slate-400   /* dark:text-slate-400 */
--text-muted: slate-500       /* dark:text-slate-500 */
```

### Border Colors
```css
/* Light Mode */
--border: gray-200           /* border-gray-200 */
--border-hover: gray-300     /* hover:border-gray-300 */

/* Dark Mode */
--border: slate-700          /* dark:border-slate-700 */
--border-hover: slate-600    /* dark:hover:border-slate-600 */
```

---

## Typography

### Font Stack
```css
/* Sans-serif (Primary) */
font-family: var(--font-geist-sans), system-ui, sans-serif;

/* Monospace (Code, numbers) */
font-family: var(--font-geist-mono), monospace;
```

### Type Scale
```css
/* Headings */
.h1 { @apply text-2xl font-bold; }      /* 24px */
.h2 { @apply text-xl font-semibold; }   /* 20px */
.h3 { @apply text-lg font-semibold; }   /* 18px */
.h4 { @apply text-base font-medium; }   /* 16px */

/* Body */
.body { @apply text-base; }             /* 16px */
.body-sm { @apply text-sm; }            /* 14px */
.caption { @apply text-xs; }            /* 12px */

/* Special */
.mono { @apply font-mono; }             /* For numbers, codes */
```

### Text Patterns
```jsx
{/* Page Title */}
<h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
  Page Title
</h1>

{/* Section Title */}
<h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
  Section Title
</h2>

{/* Description */}
<p className="text-gray-600 dark:text-slate-400">
  Description text here
</p>

{/* Label */}
<label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
  Field Label
</label>

{/* Helper Text */}
<span className="text-xs text-gray-500 dark:text-slate-500">
  Helper or hint text
</span>
```

---

## Spacing & Layout

### Spacing Scale
```css
/* Base unit: 4px (Tailwind default) */
space-1: 4px   | p-1, m-1, gap-1
space-2: 8px   | p-2, m-2, gap-2
space-3: 12px  | p-3, m-3, gap-3
space-4: 16px  | p-4, m-4, gap-4
space-6: 24px  | p-6, m-6, gap-6
space-8: 32px  | p-8, m-8, gap-8
```

### Container Patterns
```jsx
{/* Page Container */}
<main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* Content */}
</main>

{/* Wide Container */}
<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>

{/* Full Width with Padding */}
<div className="w-full px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Grid Patterns
```jsx
{/* 2-Column Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

{/* 3-Column Grid */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

{/* 4-Column Quick Actions */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

{/* Responsive Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## Components

### Cards
```jsx
{/* Basic Card */}
<div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
  {/* Content */}
</div>

{/* Interactive Card */}
<div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:border-[#1a73e8] dark:hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer">
  {/* Content */}
</div>

{/* Elevated Card */}
<div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
  {/* Content */}
</div>
```

### Buttons
```jsx
{/* Primary Button */}
<button className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium rounded-lg transition-colors">
  Primary Action
</button>

{/* Secondary Button */}
<button className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 font-medium rounded-lg transition-colors">
  Secondary
</button>

{/* Outline Button */}
<button className="px-4 py-2 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-medium rounded-lg transition-colors">
  Outline
</button>

{/* Ghost Button */}
<button className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-medium rounded-lg transition-colors">
  Ghost
</button>

{/* Danger Button */}
<button className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors">
  Delete
</button>

{/* Small Button */}
<button className="px-3 py-1.5 text-sm bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg transition-colors">
  Small
</button>
```

### Form Inputs
```jsx
{/* Text Input */}
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
  placeholder="Enter text..."
/>

{/* Select */}
<select className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100">
  <option>Option 1</option>
  <option>Option 2</option>
</select>

{/* Textarea */}
<textarea
  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 resize-none"
  rows={4}
  placeholder="Enter description..."
/>

{/* Checkbox */}
<label className="flex items-center gap-2 cursor-pointer">
  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#1a73e8] focus:ring-[#1a73e8]" />
  <span className="text-sm text-gray-700 dark:text-slate-300">Checkbox label</span>
</label>

{/* Radio */}
<label className="flex items-center gap-2 cursor-pointer">
  <input type="radio" name="group" className="w-4 h-4 border-gray-300 text-[#1a73e8] focus:ring-[#1a73e8]" />
  <span className="text-sm text-gray-700 dark:text-slate-300">Radio label</span>
</label>
```

### Status Badges
```jsx
{/* Approved / Success */}
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
  Approved
</span>

{/* Pending / Warning */}
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
  Pending
</span>

{/* Rejected / Error */}
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300">
  Rejected
</span>

{/* Draft / Neutral */}
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300">
  Draft
</span>

{/* Info */}
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
  Info
</span>
```

### Alerts
```jsx
{/* Success Alert */}
<div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
  <div className="flex items-start gap-3">
    <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
    <div>
      <h4 className="font-medium text-emerald-800 dark:text-emerald-300">Success</h4>
      <p className="text-sm text-emerald-700 dark:text-emerald-400">Your request has been submitted.</p>
    </div>
  </div>
</div>

{/* Warning Alert */}
<div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
  <div className="flex items-start gap-3">
    <ExclamationIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
    <div>
      <h4 className="font-medium text-amber-800 dark:text-amber-300">Warning</h4>
      <p className="text-sm text-amber-700 dark:text-amber-400">Please review your submission.</p>
    </div>
  </div>
</div>

{/* Error Alert */}
<div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
  <div className="flex items-start gap-3">
    <XCircleIcon className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5" />
    <div>
      <h4 className="font-medium text-rose-800 dark:text-rose-300">Error</h4>
      <p className="text-sm text-rose-700 dark:text-rose-400">Something went wrong.</p>
    </div>
  </div>
</div>
```

### Tables
```jsx
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="border-b border-gray-200 dark:border-slate-700">
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
          Column
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
      <tr className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
        <td className="px-4 py-3 text-sm text-gray-900 dark:text-slate-100">
          Cell content
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Modals/Dialogs
```jsx
{/* Modal Backdrop */}
<div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40" />

{/* Modal Content */}
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
    {/* Header */}
    <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
        Modal Title
      </h3>
    </div>

    {/* Body */}
    <div className="px-6 py-4">
      {/* Content */}
    </div>

    {/* Footer */}
    <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
      <button className="px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
        Cancel
      </button>
      <button className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg">
        Confirm
      </button>
    </div>
  </div>
</div>
```

### Ticker/Banner
```jsx
{/* Scrolling Ticker */}
<div className="relative bg-slate-50 dark:bg-slate-800/50 py-2 border-b border-slate-200 dark:border-slate-700 overflow-hidden">
  <div className="ticker-wrapper">
    <div className="ticker-content flex animate-ticker">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-3 px-6 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
          <span className="font-semibold text-slate-600 dark:text-slate-300">{item.code}</span>
          <span className="font-mono text-slate-700 dark:text-slate-200">{item.value}</span>
        </div>
      ))}
    </div>
  </div>

  {/* Live Indicator */}
  <div className="absolute right-0 top-0 bottom-0 flex items-center px-4 bg-gradient-to-l from-slate-50 dark:from-slate-800/80 to-transparent">
    <div className="flex items-center gap-1.5 text-xs text-slate-500">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span>LIVE</span>
    </div>
  </div>
</div>

<style jsx>{`
  @keyframes ticker {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-ticker {
    animation: ticker 30s linear infinite;
  }
  .animate-ticker:hover {
    animation-play-state: paused;
  }
`}</style>
```

### AI Branding

Use AI indicators to highlight AI-powered features and simplify user engagement with intelligent components.

#### AI Badge (Gradient)
```jsx
{/* AI Badge - Use next to AI-powered feature titles */}
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-white">
  <SparkleIcon />
  AI
</span>

{/* Sparkle Icon */}
function SparkleIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}
```

#### AI Section Header
```jsx
{/* AI Feature Header with Badge */}
<div className="flex items-center gap-2">
  <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
    {t("home", "travelAssistant")}  {/* "AI Travel Assistant" */}
  </h2>
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-white">
    <SparkleIcon />
    AI
  </span>
</div>
```

#### AI-Powered Message Prefix
```jsx
{/* Welcome message with AI indicator */}
const welcomeMessage = `✨ ${t("chatbox", "aiPowered")} - ${t("chatbox", "enterTravelRequestNaturalLanguage")}`;
// Output: "✨ Enter a travel request in natural language."
// Output (BM): "✨ Dikuasakan AI - Masukkan permohonan perjalanan dalam bahasa semula jadi."
```

#### AI Badge Variants
```jsx
{/* Standard AI Badge */}
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-white">
  <SparkleIcon />
  AI
</span>

{/* AI Badge - Outline Style */}
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border border-purple-400 text-purple-600 dark:text-purple-400">
  <SparkleIcon />
  AI
</span>

{/* AI Badge - Subtle */}
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
  <SparkleIcon />
  AI
</span>

{/* AI-Powered Label (Text only) */}
<span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
  ✨
</span>

{/* Beta/New AI Feature */}
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white">
  <SparkleIcon />
  AI Beta
</span>
```

#### AI Provider Selector
```jsx
{/* AI Provider Dropdown */}
<select className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-slate-200">
  <option value="sovereignai">MyGov SovereignAI</option>
  <option value="openai">OpenAI</option>
  <option value="anthropic">Anthropic</option>
</select>
```

#### AI Translations
```typescript
// translations.ts
chatbox: {
  aiPowered: { en: "AI-Powered", bm: "Dikuasakan AI" },
  // ...
},
home: {
  travelAssistant: { en: "AI Travel Assistant", bm: "Pembantu Perjalanan AI" },
  // ...
},
```

#### When to Use AI Branding

| Use Case | Component |
|----------|-----------|
| AI-powered feature title | Gradient badge next to heading |
| Chat/assistant interface | AI-Powered prefix in welcome message |
| Smart suggestions | Subtle badge or sparkle emoji |
| AI provider selection | Dropdown with provider names |
| Beta AI features | Amber/orange gradient badge |

---

## Navigation

### Sidebar

```jsx
{/* Sidebar Container */}
<aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 overflow-y-auto z-20">
  <nav className="p-4 space-y-1">
    {/* Nav Item - Active */}
    <a
      href="/dashboard"
      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#e8f0fe] dark:bg-blue-900/30 text-[#1a73e8] dark:text-blue-400 font-medium"
    >
      <HomeIcon className="w-5 h-5" />
      <span>Dashboard</span>
    </a>

    {/* Nav Item - Default */}
    <a
      href="/requests"
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
    >
      <ClipboardIcon className="w-5 h-5" />
      <span>My Requests</span>
      {/* Badge */}
      <span className="ml-auto bg-[#1a73e8] text-white text-xs px-2 py-0.5 rounded-full">3</span>
    </a>

    {/* Section Divider */}
    <div className="pt-4 pb-2">
      <p className="px-3 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
        Administration
      </p>
    </div>

    {/* Nav Item with Sub-items */}
    <div className="space-y-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
      >
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-5 h-5" />
          <span>Settings</span>
        </div>
        <ChevronIcon className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>
      {expanded && (
        <div className="ml-8 space-y-1">
          <a href="/settings/profile" className="block px-3 py-1.5 text-sm text-gray-600 dark:text-slate-400 hover:text-[#1a73e8] dark:hover:text-blue-400">
            Profile
          </a>
          <a href="/settings/security" className="block px-3 py-1.5 text-sm text-gray-600 dark:text-slate-400 hover:text-[#1a73e8] dark:hover:text-blue-400">
            Security
          </a>
        </div>
      )}
    </div>
  </nav>
</aside>

{/* Main content with sidebar offset */}
<main className="ml-64 pt-16">
  {/* Page content */}
</main>
```

### Dropdown Menu

```jsx
{/* Dropdown Container */}
<div className="relative">
  <button
    onClick={() => setOpen(!open)}
    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
  >
    <span>Menu</span>
    <ChevronDownIcon className="w-4 h-4" />
  </button>

  {open && (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50 py-1">
        {/* Menu Item */}
        <a
          href="/profile"
          className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile</span>
        </a>

        {/* Divider */}
        <div className="my-1 border-t border-gray-200 dark:border-slate-700" />

        {/* Danger Item */}
        <button className="w-full flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700">
          <LogoutIcon className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  )}
</div>
```

### Tabs

```jsx
{/* Tab Container */}
<div className="border-b border-gray-200 dark:border-slate-700">
  <nav className="flex gap-4 -mb-px">
    {/* Active Tab */}
    <button className="px-4 py-3 text-sm font-medium text-[#1a73e8] border-b-2 border-[#1a73e8]">
      Overview
    </button>

    {/* Inactive Tab */}
    <button className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-slate-600">
      Details
    </button>

    {/* Tab with Badge */}
    <button className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 border-b-2 border-transparent flex items-center gap-2">
      Comments
      <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full">12</span>
    </button>
  </nav>
</div>

{/* Tab Content */}
<div className="py-4">
  {activeTab === "overview" && <OverviewContent />}
  {activeTab === "details" && <DetailsContent />}
</div>
```

### Pill Tabs (Alternative Style)

```jsx
<div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
  {/* Active Pill */}
  <button className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-slate-700 rounded-md shadow-sm">
    All
  </button>

  {/* Inactive Pill */}
  <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white rounded-md">
    Pending
  </button>

  <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white rounded-md">
    Approved
  </button>
</div>
```

### Breadcrumbs

```jsx
<nav className="flex items-center gap-2 text-sm">
  {/* Home */}
  <a href="/" className="text-gray-500 dark:text-slate-400 hover:text-[#1a73e8] dark:hover:text-blue-400">
    <HomeIcon className="w-4 h-4" />
  </a>

  {/* Separator */}
  <ChevronRightIcon className="w-4 h-4 text-gray-400 dark:text-slate-500" />

  {/* Parent Link */}
  <a href="/requests" className="text-gray-500 dark:text-slate-400 hover:text-[#1a73e8] dark:hover:text-blue-400">
    Requests
  </a>

  <ChevronRightIcon className="w-4 h-4 text-gray-400 dark:text-slate-500" />

  {/* Current Page (not clickable) */}
  <span className="text-gray-900 dark:text-slate-100 font-medium">
    TR-2024-001
  </span>
</nav>
```

### Pagination

```jsx
<div className="flex items-center justify-between">
  {/* Info */}
  <p className="text-sm text-gray-600 dark:text-slate-400">
    Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{" "}
    <span className="font-medium">97</span> results
  </p>

  {/* Controls */}
  <div className="flex items-center gap-2">
    {/* Previous */}
    <button
      disabled={page === 1}
      className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Previous
    </button>

    {/* Page Numbers */}
    <div className="flex items-center gap-1">
      <button className="w-8 h-8 text-sm font-medium text-white bg-[#1a73e8] rounded-lg">1</button>
      <button className="w-8 h-8 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">2</button>
      <button className="w-8 h-8 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">3</button>
      <span className="px-2 text-gray-400">...</span>
      <button className="w-8 h-8 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">10</button>
    </div>

    {/* Next */}
    <button className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
      Next
    </button>
  </div>
</div>
```

### Stepper / Wizard

```jsx
{/* Horizontal Stepper */}
<div className="flex items-center justify-between">
  {steps.map((step, index) => (
    <div key={step.id} className="flex items-center">
      {/* Step */}
      <div className="flex items-center gap-3">
        {/* Step Number */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
            index < currentStep
              ? "bg-emerald-500 text-white"              // Completed
              : index === currentStep
              ? "bg-[#1a73e8] text-white"                // Current
              : "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400"  // Upcoming
          }`}
        >
          {index < currentStep ? (
            <CheckIcon className="w-5 h-5" />
          ) : (
            index + 1
          )}
        </div>

        {/* Step Label */}
        <div className="hidden sm:block">
          <p className={`text-sm font-medium ${
            index <= currentStep ? "text-gray-900 dark:text-slate-100" : "text-gray-500 dark:text-slate-400"
          }`}>
            {step.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-500">{step.description}</p>
        </div>
      </div>

      {/* Connector Line */}
      {index < steps.length - 1 && (
        <div className={`flex-1 h-0.5 mx-4 ${
          index < currentStep ? "bg-emerald-500" : "bg-gray-200 dark:bg-slate-700"
        }`} />
      )}
    </div>
  ))}
</div>

{/* Step Content */}
<div className="mt-8">
  {steps[currentStep].content}
</div>

{/* Step Navigation */}
<div className="mt-8 flex justify-between">
  <button
    onClick={() => setCurrentStep(prev => prev - 1)}
    disabled={currentStep === 0}
    className="px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-50"
  >
    Back
  </button>
  <button
    onClick={() => setCurrentStep(prev => prev + 1)}
    className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg"
  >
    {currentStep === steps.length - 1 ? "Submit" : "Continue"}
  </button>
</div>
```

### Command Palette / Search Modal

```jsx
{/* Command Palette */}
<div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
  {/* Backdrop */}
  <div className="fixed inset-0 bg-black/50" onClick={onClose} />

  {/* Modal */}
  <div className="relative w-full max-w-xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
    {/* Search Input */}
    <div className="flex items-center gap-3 px-4 border-b border-gray-200 dark:border-slate-700">
      <SearchIcon className="w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search requests, users, or type a command..."
        className="flex-1 py-4 bg-transparent text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:outline-none"
        autoFocus
      />
      <kbd className="px-2 py-1 text-xs text-gray-400 bg-gray-100 dark:bg-slate-700 rounded">ESC</kbd>
    </div>

    {/* Results */}
    <div className="max-h-80 overflow-y-auto p-2">
      {/* Section */}
      <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Recent</p>

      {/* Result Item */}
      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-left">
        <ClipboardIcon className="w-5 h-5 text-gray-400" />
        <div>
          <p className="text-sm text-gray-900 dark:text-slate-100">TR-2024-001</p>
          <p className="text-xs text-gray-500">Singapore Training Trip</p>
        </div>
        <span className="ml-auto text-xs text-gray-400">Request</span>
      </button>

      {/* Command Item */}
      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-left">
        <PlusIcon className="w-5 h-5 text-[#1a73e8]" />
        <span className="text-sm text-gray-900 dark:text-slate-100">Create new request</span>
        <kbd className="ml-auto px-2 py-0.5 text-xs text-gray-400 bg-gray-100 dark:bg-slate-700 rounded">⌘N</kbd>
      </button>
    </div>
  </div>
</div>
```

---

## Icons

### Icon Style
- Use outline icons (stroke-based) for navigation and actions
- Use solid icons for status indicators
- Standard size: 20x20 (w-5 h-5) or 24x24 (w-6 h-6)
- Use `currentColor` for fill/stroke to inherit text color

### Common Icon Patterns
```jsx
{/* Navigation Icon */}
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="..." />
</svg>

{/* Status Icon */}
<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
  <path fillRule="evenodd" d="..." clipRule="evenodd" />
</svg>

{/* Icon Button */}
<button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
  <svg className="w-5 h-5 text-gray-600 dark:text-slate-400" ...>
</button>
```

---

## Animation

### Transitions
```css
/* Standard transition */
transition-colors      /* Color changes */
transition-all         /* All properties */
transition-transform   /* Scale, rotate, translate */

/* Duration */
duration-150          /* Fast (hover states) */
duration-200          /* Default */
duration-300          /* Slow (modals, large elements) */
```

### Loading States
```jsx
{/* Spinner */}
<div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-[#1a73e8]" />

{/* Pulse */}
<div className="animate-pulse bg-gray-200 dark:bg-slate-700 rounded h-4 w-32" />

{/* Skeleton */}
<div className="space-y-3">
  <div className="animate-pulse bg-gray-200 dark:bg-slate-700 rounded h-4 w-3/4" />
  <div className="animate-pulse bg-gray-200 dark:bg-slate-700 rounded h-4 w-1/2" />
</div>

{/* Live Indicator (Ping) */}
<span className="relative flex h-3 w-3">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
</span>
```

---

## Feedback & Notifications

### Toast Notifications

```jsx
{/* Toast Container - Fixed position */}
<div className="fixed bottom-4 right-4 z-50 space-y-2">
  {/* Success Toast */}
  <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 min-w-[320px]">
    <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
      <CheckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Request submitted</p>
      <p className="text-xs text-gray-500 dark:text-slate-400">Your travel request has been sent for approval.</p>
    </div>
    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
      <XIcon className="w-5 h-5" />
    </button>
  </div>

  {/* Error Toast */}
  <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-rose-200 dark:border-rose-800 min-w-[320px]">
    <div className="flex-shrink-0 w-8 h-8 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center">
      <XCircleIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Submission failed</p>
      <p className="text-xs text-gray-500 dark:text-slate-400">Please check your connection and try again.</p>
    </div>
    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
      <XIcon className="w-5 h-5" />
    </button>
  </div>

  {/* Warning Toast */}
  <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-amber-200 dark:border-amber-800 min-w-[320px]">
    <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
      <ExclamationIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Session expiring</p>
      <p className="text-xs text-gray-500 dark:text-slate-400">Your session will expire in 5 minutes.</p>
    </div>
    <button className="text-xs text-[#1a73e8] font-medium hover:underline">
      Extend
    </button>
  </div>

  {/* Info Toast with Action */}
  <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 min-w-[320px]">
    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
      <InfoIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">New feature available</p>
      <p className="text-xs text-gray-500 dark:text-slate-400">Currency exchange is now integrated.</p>
    </div>
    <button className="text-xs text-[#1a73e8] font-medium hover:underline">
      Try it
    </button>
  </div>
</div>
```

### Toast with Progress Bar

```jsx
<div className="relative flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 min-w-[320px] overflow-hidden">
  <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
    <CheckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
  </div>
  <div className="flex-1">
    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Changes saved</p>
  </div>
  {/* Auto-dismiss progress bar */}
  <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 animate-shrink-width" />
</div>

<style jsx>{`
  @keyframes shrink-width {
    from { width: 100%; }
    to { width: 0%; }
  }
  .animate-shrink-width {
    animation: shrink-width 5s linear forwards;
  }
`}</style>
```

### Tooltips

```jsx
{/* Tooltip Wrapper */}
<div className="relative group">
  {/* Trigger */}
  <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
    <InfoIcon className="w-5 h-5 text-gray-500" />
  </button>

  {/* Tooltip - Top */}
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-slate-700 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
    Helpful information
    {/* Arrow */}
    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-slate-700" />
  </div>
</div>

{/* Tooltip Positions */}
{/* Top */}    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2"
{/* Bottom */} className="absolute top-full left-1/2 -translate-x-1/2 mt-2"
{/* Left */}   className="absolute right-full top-1/2 -translate-y-1/2 mr-2"
{/* Right */}  className="absolute left-full top-1/2 -translate-y-1/2 ml-2"
```

### Progress Indicators

```jsx
{/* Linear Progress Bar */}
<div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
  <div
    className="bg-[#1a73e8] h-2 rounded-full transition-all duration-300"
    style={{ width: `${progress}%` }}
  />
</div>

{/* Progress with Label */}
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span className="text-gray-600 dark:text-slate-400">Uploading...</span>
    <span className="text-gray-900 dark:text-slate-100 font-medium">{progress}%</span>
  </div>
  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
    <div
      className="bg-[#1a73e8] h-2 rounded-full transition-all duration-300"
      style={{ width: `${progress}%` }}
    />
  </div>
</div>

{/* Circular Progress */}
<div className="relative w-16 h-16">
  <svg className="w-full h-full -rotate-90">
    {/* Background circle */}
    <circle
      cx="32" cy="32" r="28"
      className="fill-none stroke-gray-200 dark:stroke-slate-700"
      strokeWidth="8"
    />
    {/* Progress circle */}
    <circle
      cx="32" cy="32" r="28"
      className="fill-none stroke-[#1a73e8]"
      strokeWidth="8"
      strokeLinecap="round"
      strokeDasharray={`${progress * 1.76} 176`}
    />
  </svg>
  <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-900 dark:text-slate-100">
    {progress}%
  </span>
</div>

{/* Indeterminate Progress */}
<div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
  <div className="bg-[#1a73e8] h-2 rounded-full animate-indeterminate" />
</div>

<style jsx>{`
  @keyframes indeterminate {
    0% { transform: translateX(-100%); width: 50%; }
    50% { transform: translateX(0%); width: 50%; }
    100% { transform: translateX(200%); width: 50%; }
  }
  .animate-indeterminate {
    animation: indeterminate 1.5s ease-in-out infinite;
  }
`}</style>
```

### Inline Notifications

```jsx
{/* Inline Info Banner */}
<div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
  <InfoIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
  <div className="flex-1">
    <p className="text-sm text-blue-800 dark:text-blue-300">
      <strong>Note:</strong> International travel requests require 30 days advance notice.
    </p>
  </div>
  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
    <XIcon className="w-4 h-4" />
  </button>
</div>

{/* Dismissible Warning */}
<div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
  <ExclamationIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
  <div className="flex-1">
    <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Budget Warning</h4>
    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
      You have used 85% of your international travel quota.
    </p>
    <div className="mt-3 flex gap-2">
      <button className="text-xs font-medium text-amber-800 dark:text-amber-300 hover:underline">
        View details
      </button>
      <button className="text-xs font-medium text-amber-600 dark:text-amber-500 hover:underline">
        Dismiss
      </button>
    </div>
  </div>
</div>
```

### Confirmation Dialog

```jsx
{/* Confirmation Modal */}
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="fixed inset-0 bg-black/50" onClick={onCancel} />

  <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6">
    {/* Icon */}
    <div className="mx-auto w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-4">
      <TrashIcon className="w-6 h-6 text-rose-600 dark:text-rose-400" />
    </div>

    {/* Content */}
    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 text-center">
      Delete Request?
    </h3>
    <p className="text-gray-600 dark:text-slate-400 text-center mt-2">
      This action cannot be undone. The travel request and all associated data will be permanently removed.
    </p>

    {/* Actions */}
    <div className="mt-6 flex gap-3">
      <button
        onClick={onCancel}
        className="flex-1 px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg font-medium"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium"
      >
        Delete
      </button>
    </div>
  </div>
</div>
```

---

## Empty States & Error Pages

### Empty State - No Data

```jsx
<div className="flex flex-col items-center justify-center py-12 px-4">
  {/* Illustration */}
  <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
    <ClipboardIcon className="w-12 h-12 text-gray-400 dark:text-slate-500" />
  </div>

  {/* Message */}
  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
    No requests yet
  </h3>
  <p className="text-gray-600 dark:text-slate-400 text-center max-w-sm mb-6">
    You haven't created any travel requests. Start by creating your first request.
  </p>

  {/* Action */}
  <button className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium rounded-lg">
    Create Request
  </button>
</div>
```

### Empty State - No Search Results

```jsx
<div className="flex flex-col items-center justify-center py-12 px-4">
  <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
    <SearchIcon className="w-12 h-12 text-gray-400 dark:text-slate-500" />
  </div>

  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
    No results found
  </h3>
  <p className="text-gray-600 dark:text-slate-400 text-center max-w-sm mb-6">
    We couldn't find any requests matching "<span className="font-medium">singapore</span>".
    Try adjusting your search or filters.
  </p>

  <button
    onClick={clearFilters}
    className="text-[#1a73e8] hover:underline font-medium"
  >
    Clear all filters
  </button>
</div>
```

### Empty State - No Permissions

```jsx
<div className="flex flex-col items-center justify-center py-12 px-4">
  <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6">
    <LockIcon className="w-12 h-12 text-amber-600 dark:text-amber-400" />
  </div>

  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
    Access Restricted
  </h3>
  <p className="text-gray-600 dark:text-slate-400 text-center max-w-sm mb-6">
    You don't have permission to view this content. Contact your administrator if you believe this is an error.
  </p>

  <button
    onClick={() => router.back()}
    className="text-[#1a73e8] hover:underline font-medium"
  >
    Go back
  </button>
</div>
```

### Error Page - 404

```jsx
<div className="min-h-screen bg-[#f0f4f8] dark:bg-slate-900 flex items-center justify-center px-4">
  <div className="text-center">
    {/* Error Code */}
    <h1 className="text-9xl font-bold text-gray-200 dark:text-slate-800">404</h1>

    {/* Message */}
    <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-4">
      Page not found
    </h2>
    <p className="text-gray-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
      Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
    </p>

    {/* Actions */}
    <div className="mt-8 flex items-center justify-center gap-4">
      <button
        onClick={() => router.back()}
        className="px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg font-medium"
      >
        Go back
      </button>
      <a
        href="/"
        className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium rounded-lg"
      >
        Home
      </a>
    </div>
  </div>
</div>
```

### Error Page - 500

```jsx
<div className="min-h-screen bg-[#f0f4f8] dark:bg-slate-900 flex items-center justify-center px-4">
  <div className="text-center">
    {/* Icon */}
    <div className="mx-auto w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-6">
      <ExclamationIcon className="w-10 h-10 text-rose-600 dark:text-rose-400" />
    </div>

    {/* Message */}
    <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
      Something went wrong
    </h2>
    <p className="text-gray-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
      We're experiencing technical difficulties. Please try again later or contact support if the problem persists.
    </p>

    {/* Error ID for support */}
    <p className="text-xs text-gray-400 dark:text-slate-500 mt-4">
      Error ID: <code className="bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">ERR-2024-ABC123</code>
    </p>

    {/* Actions */}
    <div className="mt-8 flex items-center justify-center gap-4">
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg font-medium"
      >
        Try again
      </button>
      <a
        href="/"
        className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium rounded-lg"
      >
        Home
      </a>
    </div>
  </div>
</div>
```

### Loading Skeleton - Card

```jsx
<div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 animate-pulse">
  {/* Header */}
  <div className="flex items-center gap-3 mb-4">
    <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/4" />
    </div>
  </div>

  {/* Content */}
  <div className="space-y-3">
    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full" />
    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-5/6" />
    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-4/6" />
  </div>

  {/* Footer */}
  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-between">
    <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-20" />
    <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-24" />
  </div>
</div>
```

### Loading Skeleton - Table

```jsx
<div className="animate-pulse">
  {/* Table Header */}
  <div className="flex gap-4 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4" />
    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4" />
    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4" />
    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4" />
  </div>

  {/* Table Rows */}
  {[1, 2, 3, 4, 5].map((i) => (
    <div key={i} className="flex gap-4 px-4 py-4 border-b border-gray-200 dark:border-slate-700">
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4" />
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4" />
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4" />
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4" />
    </div>
  ))}
</div>
```

---

## Chat UI Patterns

### Chat Container

```jsx
<div className="flex flex-col h-[400px] bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
  {/* Chat Header */}
  <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
      <SparkleIcon className="w-4 h-4 text-white" />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100"> Travel Assistant</h3>
      <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
        Online
      </p>
    </div>
  </div>

  {/* Messages Area */}
  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-900">
    {/* Messages */}
  </div>

  {/* Input Area */}
  <div className="p-4 border-t border-gray-200 dark:border-slate-700">
    {/* Input */}
  </div>
</div>
```

### Chat Bubbles

```jsx
{/* System/Bot Message */}
<div className="flex gap-3">
  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
    <SparkleIcon className="w-4 h-4 text-white" />
  </div>
  <div className="max-w-[80%]">
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg rounded-tl-none px-4 py-2">
      <p className="text-sm text-gray-700 dark:text-slate-200">
        Hello! I can help you plan your travel. Where would you like to go?
      </p>
    </div>
    <span className="text-xs text-gray-400 dark:text-slate-500 mt-1 block">10:30 AM</span>
  </div>
</div>

{/* User Message */}
<div className="flex gap-3 justify-end">
  <div className="max-w-[80%]">
    <div className="bg-[#1a73e8] text-white rounded-lg rounded-tr-none px-4 py-2">
      <p className="text-sm">
        I need to travel to Singapore for a conference next month.
      </p>
    </div>
    <span className="text-xs text-gray-400 dark:text-slate-500 mt-1 block text-right">10:31 AM</span>
  </div>
  <div className="flex-shrink-0 w-8 h-8 bg-[#1a73e8] rounded-full flex items-center justify-center text-white text-sm font-medium">
    JD
  </div>
</div>

{/* Parsed/Success Message */}
<div className="flex gap-3">
  <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
    <CheckIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
  </div>
  <div className="max-w-[80%]">
    <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg rounded-tl-none px-4 py-2">
      <p className="text-sm text-emerald-800 dark:text-emerald-300">
        ✓ Travel request created successfully!
      </p>
      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
        Reference: TR-2024-001
      </p>
    </div>
  </div>
</div>
```

### Typing Indicator

```jsx
<div className="flex gap-3">
  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
    <SparkleIcon className="w-4 h-4 text-white" />
  </div>
  <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg rounded-tl-none px-4 py-3">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce" />
      <div className="w-2 h-2 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.1s]" />
      <div className="w-2 h-2 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
    </div>
  </div>
</div>
```

### Chat Input

```jsx
<div className="flex items-end gap-2">
  {/* Attachment Button */}
  <button className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
    <PaperclipIcon className="w-5 h-5" />
  </button>

  {/* Input */}
  <div className="flex-1 relative">
    <input
      type="text"
      placeholder="Type your message..."
      className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
    />
    {/* Emoji Button */}
    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
      <EmojiIcon className="w-5 h-5" />
    </button>
  </div>

  {/* Send Button */}
  <button
    disabled={!message}
    className="p-2 bg-[#1a73e8] hover:bg-[#1557b0] disabled:bg-gray-300 dark:disabled:bg-slate-700 text-white rounded-lg transition-colors"
  >
    <SendIcon className="w-5 h-5" />
  </button>
</div>
```

### Quick Reply Chips

```jsx
<div className="flex flex-wrap gap-2 mt-3">
  <button className="px-3 py-1.5 text-sm text-[#1a73e8] bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full border border-blue-200 dark:border-blue-800 transition-colors">
    Book flight
  </button>
  <button className="px-3 py-1.5 text-sm text-[#1a73e8] bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full border border-blue-200 dark:border-blue-800 transition-colors">
    Check rates
  </button>
  <button className="px-3 py-1.5 text-sm text-[#1a73e8] bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full border border-blue-200 dark:border-blue-800 transition-colors">
    View requests
  </button>
</div>
```

### Message with Card

```jsx
<div className="flex gap-3">
  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
    <SparkleIcon className="w-4 h-4 text-white" />
  </div>
  <div className="max-w-[85%]">
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg rounded-tl-none overflow-hidden">
      <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700">
        <p className="text-sm text-gray-700 dark:text-slate-200">
          I found a flight for your trip:
        </p>
      </div>

      {/* Embedded Card */}
      <div className="p-4 bg-gray-50 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">KUL → SIN</p>
            <p className="text-xs text-gray-500">Malaysia Airlines MH607</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-[#1a73e8]">RM 450</p>
            <p className="text-xs text-gray-500">per person</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-slate-400">
          <span>08:00 - 09:05</span>
          <span>•</span>
          <span>1h 5m</span>
          <span>•</span>
          <span>Direct</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-slate-700 flex gap-2">
        <button className="flex-1 px-3 py-1.5 text-sm font-medium text-[#1a73e8] hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg">
          View details
        </button>
        <button className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-[#1a73e8] hover:bg-[#1557b0] rounded-lg">
          Select
        </button>
      </div>
    </div>
  </div>
</div>
```

---

## Approval Workflow UI

### Status Timeline

```jsx
<div className="space-y-4">
  {/* Completed Step */}
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
        <CheckIcon className="w-5 h-5 text-white" />
      </div>
      <div className="w-0.5 h-full bg-emerald-500 mt-2" />
    </div>
    <div className="pb-8">
      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Request Submitted</p>
      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Jan 15, 2024 at 10:30 AM</p>
      <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">
        Travel request TR-2024-001 submitted by Ahmad bin Ali
      </p>
    </div>
  </div>

  {/* Completed Step */}
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
        <CheckIcon className="w-5 h-5 text-white" />
      </div>
      <div className="w-0.5 h-full bg-emerald-500 mt-2" />
    </div>
    <div className="pb-8">
      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Supervisor Approved</p>
      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Jan 15, 2024 at 2:45 PM</p>
      <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">
        Approved by Mohd Faizal (Supervisor)
      </p>
      <div className="mt-2 p-2 bg-gray-50 dark:bg-slate-800 rounded text-xs text-gray-600 dark:text-slate-400 italic">
        "Approved. Please ensure all receipts are submitted."
      </div>
    </div>
  </div>

  {/* Current Step */}
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 bg-[#1a73e8] rounded-full flex items-center justify-center animate-pulse">
        <div className="w-3 h-3 bg-white rounded-full" />
      </div>
      <div className="w-0.5 h-full bg-gray-200 dark:bg-slate-700 mt-2" />
    </div>
    <div className="pb-8">
      <p className="text-sm font-medium text-[#1a73e8]">Pending HR Review</p>
      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Waiting since Jan 15, 2024</p>
      <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">
        Awaiting review from HR Department
      </p>
    </div>
  </div>

  {/* Upcoming Step */}
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
        <span className="text-sm text-gray-500 dark:text-slate-400">4</span>
      </div>
    </div>
    <div>
      <p className="text-sm font-medium text-gray-400 dark:text-slate-500">Finance Approval</p>
      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Pending previous step</p>
    </div>
  </div>
</div>
```

### Approval Card

```jsx
<div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
  {/* Header */}
  <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 flex items-center gap-3">
    <ClockIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
    <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Pending Your Approval</span>
  </div>

  {/* Content */}
  <div className="p-4">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-slate-100">TR-2024-001</h3>
        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Singapore Training Trip</p>
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-slate-100">RM 2,500</span>
    </div>

    {/* Details */}
    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-gray-500 dark:text-slate-400">Requested by</p>
        <p className="font-medium text-gray-900 dark:text-slate-100">Ahmad bin Ali</p>
      </div>
      <div>
        <p className="text-gray-500 dark:text-slate-400">Travel dates</p>
        <p className="font-medium text-gray-900 dark:text-slate-100">20-22 April 2024</p>
      </div>
    </div>

    {/* Actions */}
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex gap-3">
      <button className="flex-1 px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg font-medium">
        View Details
      </button>
      <button className="px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg font-medium">
        Reject
      </button>
      <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium">
        Approve
      </button>
    </div>
  </div>
</div>
```

### Approval Chain Visualization

```jsx
<div className="flex items-center justify-between">
  {/* Requester */}
  <div className="flex flex-col items-center">
    <div className="w-12 h-12 bg-[#1a73e8] rounded-full flex items-center justify-center text-white font-medium">
      AA
    </div>
    <p className="text-xs text-gray-600 dark:text-slate-400 mt-2 text-center">Ahmad Ali</p>
    <p className="text-xs text-gray-400 dark:text-slate-500">Requester</p>
  </div>

  {/* Connector - Completed */}
  <div className="flex-1 h-0.5 bg-emerald-500 mx-2" />

  {/* Supervisor - Approved */}
  <div className="flex flex-col items-center">
    <div className="relative">
      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white">
        <CheckIcon className="w-6 h-6" />
      </div>
      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center">
        <CheckIcon className="w-3 h-3 text-emerald-500" />
      </div>
    </div>
    <p className="text-xs text-gray-600 dark:text-slate-400 mt-2 text-center">Supervisor</p>
    <p className="text-xs text-emerald-600 dark:text-emerald-400">Approved</p>
  </div>

  {/* Connector - In Progress */}
  <div className="flex-1 h-0.5 bg-gradient-to-r from-emerald-500 to-gray-200 dark:to-slate-700 mx-2" />

  {/* HR - Pending */}
  <div className="flex flex-col items-center">
    <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
      <ClockIcon className="w-6 h-6 text-white" />
    </div>
    <p className="text-xs text-gray-600 dark:text-slate-400 mt-2 text-center">HR</p>
    <p className="text-xs text-amber-600 dark:text-amber-400">Pending</p>
  </div>

  {/* Connector - Not Started */}
  <div className="flex-1 h-0.5 bg-gray-200 dark:bg-slate-700 mx-2" />

  {/* Finance - Waiting */}
  <div className="flex flex-col items-center">
    <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-gray-400 dark:text-slate-500">
      <UserIcon className="w-6 h-6" />
    </div>
    <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 text-center">Finance</p>
    <p className="text-xs text-gray-400 dark:text-slate-500">Waiting</p>
  </div>
</div>
```

### Rejection Form

```jsx
<div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
    Reject Request
  </h3>

  <div className="space-y-4">
    {/* Reason Selection */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
        Reason for rejection
      </label>
      <select className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100">
        <option value="">Select a reason...</option>
        <option value="budget">Budget constraints</option>
        <option value="dates">Date conflicts</option>
        <option value="justification">Insufficient justification</option>
        <option value="policy">Policy violation</option>
        <option value="other">Other</option>
      </select>
    </div>

    {/* Comments */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
        Additional comments
      </label>
      <textarea
        rows={3}
        placeholder="Provide additional details for the requester..."
        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400"
      />
    </div>

    {/* Actions */}
    <div className="flex justify-end gap-3 pt-4">
      <button className="px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg font-medium">
        Cancel
      </button>
      <button className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium">
        Confirm Rejection
      </button>
    </div>
  </div>
</div>
```

---

## Dark Mode (Day/Night Mode)

A complete theme system supporting light mode, dark mode, and system preference detection.

### Theme Context
```tsx
// src/context/ThemeContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;                      // User's preference (light/dark/system)
  resolvedTheme: "light" | "dark";   // Actual theme being displayed
  setTheme: (theme: Theme) => void;  // Set specific theme
  toggleTheme: () => void;           // Toggle between light/dark
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = "govtravel-theme";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Apply theme to document
  const applyTheme = useCallback((newTheme: "light" | "dark") => {
    setResolvedTheme(newTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
  }, []);

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initialTheme = stored || "system";
    setThemeState(initialTheme);
    applyTheme(initialTheme === "system" ? getSystemTheme() : initialTheme);
  }, [applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") applyTheme(getSystemTheme());
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, applyTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(newTheme === "system" ? getSystemTheme() : newTheme);
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
```

### Flash Prevention (layout.tsx)
```jsx
{/* Inline script to prevent theme flash on page load */}
<script dangerouslySetInnerHTML={{
  __html: `
    (function() {
      try {
        var theme = localStorage.getItem('govtravel-theme');
        var resolved = theme;
        if (!theme || theme === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.classList.add(resolved);
      } catch (e) {}
    })();
  `,
}} />
```

### Theme Toggle Button
```jsx
import { useTheme } from "@/context/ThemeContext";

function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
      aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

// Sun Icon (shown in dark mode - click to switch to light)
function SunIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

// Moon Icon (shown in light mode - click to switch to dark)
function MoonIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}
```

### Theme Selector (3 options)
```jsx
function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setTheme("light")}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          theme === "light"
            ? "bg-[#1a73e8] text-white"
            : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
        }`}
      >
        <SunIcon className="w-4 h-4 inline mr-1" />
        Light
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          theme === "dark"
            ? "bg-[#1a73e8] text-white"
            : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
        }`}
      >
        <MoonIcon className="w-4 h-4 inline mr-1" />
        Dark
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          theme === "system"
            ? "bg-[#1a73e8] text-white"
            : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
        }`}
      >
        <ComputerIcon className="w-4 h-4 inline mr-1" />
        System
      </button>
    </div>
  );
}
```

### Implementation Pattern
```jsx
{/* Always pair light and dark classes */}
<div className="
  bg-white dark:bg-slate-800
  text-gray-900 dark:text-slate-100
  border-gray-200 dark:border-slate-700
">
```

### Color Mapping (Light → Dark)

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| **Page Background** | `bg-[#f0f4f8]` | `dark:bg-slate-900` |
| **Card Background** | `bg-white` | `dark:bg-slate-800` |
| **Elevated Surface** | `bg-gray-50` | `dark:bg-slate-800/50` |
| **Hover Background** | `hover:bg-gray-100` | `dark:hover:bg-slate-700` |
| **Border** | `border-gray-200` | `dark:border-slate-700` |
| **Border Hover** | `hover:border-gray-300` | `dark:hover:border-slate-600` |
| **Primary Text** | `text-gray-900` | `dark:text-slate-100` |
| **Secondary Text** | `text-gray-600` | `dark:text-slate-400` |
| **Muted Text** | `text-gray-500` | `dark:text-slate-500` |
| **Placeholder** | `placeholder-gray-400` | `dark:placeholder-slate-500` |
| **Input Background** | `bg-white` | `dark:bg-slate-800` |
| **Input Border** | `border-gray-300` | `dark:border-slate-600` |

### Component Dark Mode Examples

```jsx
{/* Header */}
<header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">

{/* Card */}
<div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">

{/* Button (Secondary) */}
<button className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200">

{/* Input */}
<input className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100">

{/* Badge */}
<span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">

{/* Link */}
<a className="text-[#1a73e8] hover:text-[#1557b0] dark:text-blue-400 dark:hover:text-blue-300">

{/* User Menu Dropdown */}
<div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
  <div className="font-medium text-gray-900 dark:text-slate-100">{user.name}</div>
  <div className="text-sm text-gray-500 dark:text-slate-400">{user.email}</div>
</div>
```

### Tailwind Config
```js
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  // ...
}
```

### Provider Setup
```jsx
// src/app/providers.tsx
"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
```

---

## Internationalization (BM/EN)

A complete bilingual system supporting English (EN) and Bahasa Malaysia (BM) with type-safe translations.

### Language Context

```tsx
// src/context/LanguageContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations, TranslationSection, TranslationKey } from "@/lib/translations";

type Language = "en" | "bm";

interface LanguageContextType {
  language: Language;                                    // Current language
  setLanguage: (lang: Language) => void;                // Set specific language
  toggleLanguage: () => void;                           // Toggle EN ↔ BM
  t: <S extends TranslationSection>(               // Type-safe translate function
    section: S,
    key: TranslationKey<S>
  ) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
const STORAGE_KEY = "govtravel_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && (stored === "en" || stored === "bm")) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    const newLang = language === "en" ? "bm" : "en";
    setLanguage(newLang);
  }, [language, setLanguage]);

  // Type-safe translation function
  const t = useCallback(<S extends TranslationSection>(
    section: S,
    key: TranslationKey<S>
  ): string => {
    const sectionData = translations[language][section];
    if (sectionData && key in sectionData) {
      return (sectionData as Record<string, string>)[key as string];
    }
    // Fallback to English
    const fallback = translations.en[section];
    if (fallback && key in fallback) {
      return (fallback as Record<string, string>)[key as string];
    }
    return `${section}.${key}`; // Debug: show missing key
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
```

### Translation File Structure

```tsx
// src/lib/translations.ts
export const translations = {
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      submit: "Submit",
      loading: "Loading...",
      search: "Search",
      filter: "Filter",
      clear: "Clear",
      close: "Close",
      confirm: "Confirm",
      back: "Back",
      next: "Next",
      previous: "Previous",
      // ... more common translations
    },
    header: {
      myRequests: "My Requests",
      managePermissions: "Manage Permissions",
      integrationSettings: "Integration Settings",
    },
    nav: {
      home: "Home",
      newRequest: "New Request",
      myRequests: "My Requests",
      approvals: "Approvals",
      reports: "Reports",
      profile: "Profile",
      settings: "Settings",
    },
    home: {
      welcomeToGovTravel: "Welcome to GovTravel",
      comprehensiveSolution: "A comprehensive travel management solution for government employees",
      travelAssistant: "Travel Assistant",
      flightBooking: "Flight Booking",
      findAndBookFlight: "Find and book flights for your official travel",
      bookAFlight: "Book a Flight",
      hotelReservations: "Hotel Reservations",
      findIdealAccommodation: "Find the ideal accommodation for your trip",
      bookAHotel: "Book a Hotel",
      carRentals: "Car Rentals",
      rentACarForTrip: "Rent a car for your business trip",
      rentACar: "Rent a Car",
    },
    status: {
      draft: "Draft",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      cancelled: "Cancelled",
      completed: "Completed",
      inProgress: "In Progress",
    },
    // ... more sections
  },
  bm: {
    common: {
      save: "Simpan",
      cancel: "Batal",
      delete: "Padam",
      edit: "Sunting",
      submit: "Hantar",
      loading: "Memuatkan...",
      search: "Cari",
      filter: "Tapis",
      clear: "Kosongkan",
      close: "Tutup",
      confirm: "Sahkan",
      back: "Kembali",
      next: "Seterusnya",
      previous: "Sebelumnya",
      // ... more common translations
    },
    header: {
      myRequests: "Permohonan Saya",
      managePermissions: "Urus Kebenaran",
      integrationSettings: "Tetapan Integrasi",
    },
    nav: {
      home: "Laman Utama",
      newRequest: "Permohonan Baharu",
      myRequests: "Permohonan Saya",
      approvals: "Kelulusan",
      reports: "Laporan",
      profile: "Profil",
      settings: "Tetapan",
    },
    home: {
      welcomeToGovTravel: "Selamat Datang ke GovTravel",
      comprehensiveSolution: "Penyelesaian pengurusan perjalanan menyeluruh untuk kakitangan kerajaan",
      travelAssistant: "Pembantu Perjalanan",
      flightBooking: "Tempahan Penerbangan",
      findAndBookFlight: "Cari dan tempah penerbangan untuk perjalanan rasmi anda",
      bookAFlight: "Tempah Penerbangan",
      hotelReservations: "Tempahan Hotel",
      findIdealAccommodation: "Cari penginapan yang sesuai untuk perjalanan anda",
      bookAHotel: "Tempah Hotel",
      carRentals: "Sewaan Kereta",
      rentACarForTrip: "Sewa kereta untuk perjalanan perniagaan anda",
      rentACar: "Sewa Kereta",
    },
    status: {
      draft: "Draf",
      pending: "Menunggu",
      approved: "Diluluskan",
      rejected: "Ditolak",
      cancelled: "Dibatalkan",
      completed: "Selesai",
      inProgress: "Sedang Diproses",
    },
    // ... more sections
  },
} as const;

// Type helpers for type-safe translations
export type TranslationSection = keyof typeof translations.en;
export type TranslationKey<S extends TranslationSection> = keyof typeof translations.en[S];
```

### Translation Sections

Organize translations by feature area:

| Section | Description | Examples |
|---------|-------------|----------|
| `common` | Shared UI elements | Save, Cancel, Loading, Search |
| `header` | Header navigation | My Requests, Manage Permissions |
| `nav` | Navigation menu items | Home, New Request, Reports |
| `home` | Home page content | Welcome message, service cards |
| `travel` | Travel request features | Trip details, destinations |
| `status` | Status labels | Draft, Pending, Approved |
| `approvals` | Approval workflow | Approve, Reject, Review |
| `user` | User management | Profile, Employee ID |
| `reports` | Reports section | Generate Report, Export |
| `dashboard` | Dashboard elements | Welcome back, Overview |
| `login` | Auth pages | Sign In, Password, Remember me |
| `validation` | Form validation | Required field, Invalid email |
| `errors` | Error messages | Not found, Server error |
| `success` | Success messages | Saved successfully |
| `confirm` | Confirmation dialogs | Are you sure?, Confirm delete |
| `roles` | Role names | Employee, Supervisor, Admin |
| `language` | Language settings | Switch language |
| `compliance` | Compliance alerts | Policy violation |
| `chatbox` | Chat interface | Type a message, Send |
| `table` | Table elements | Showing results, No data |

### Language Toggle Button

```jsx
import { useLanguage } from "@/context/LanguageContext";

function LanguageToggle() {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="px-2 py-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-gray-300 dark:border-slate-600"
      aria-label={t("language", "switchLanguage")}
      title={t("language", "switchLanguage")}
    >
      {language === "en" ? "BM" : "EN"}
    </button>
  );
}
```

### Using Translations in Components

```jsx
import { useLanguage } from "@/context/LanguageContext";

function TravelRequestPage() {
  const { t } = useLanguage();

  return (
    <div>
      {/* Page title */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
        {t("nav", "newRequest")}
      </h1>

      {/* Status badge */}
      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        {t("status", "pending")}
      </span>

      {/* Form labels */}
      <label className="block text-sm font-medium text-gray-700">
        {t("travel", "destination")}
      </label>

      {/* Buttons */}
      <button className="px-4 py-2 bg-[#1a73e8] text-white rounded-lg">
        {t("common", "submit")}
      </button>
      <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
        {t("common", "cancel")}
      </button>

      {/* Error messages */}
      {error && (
        <div className="text-red-600 text-sm">
          {t("errors", "serverError")}
        </div>
      )}

      {/* Success messages */}
      {saved && (
        <div className="text-green-600 text-sm">
          {t("success", "requestSubmitted")}
        </div>
      )}
    </div>
  );
}
```

### Dynamic Text with Variables

```jsx
// For text with variables, use template literals
const { t, language } = useLanguage();

// Simple approach - define in translations
translations: {
  en: {
    dashboard: {
      welcome: "Welcome",
      welcomeBack: "Welcome back",
    }
  }
}

// Usage with user name
<h1>{t("dashboard", "welcome")}, {user.name}</h1>
// Output: "Welcome, Ahmad" or "Selamat Datang, Ahmad"

// For more complex interpolation, create helper
function formatMessage(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] || `{${key}}`);
}

// Translation with placeholder
translations: {
  en: { reports: { showing: "Showing {count} of {total} results" } },
  bm: { reports: { showing: "Menunjukkan {count} daripada {total} hasil" } }
}

// Usage
<p>{formatMessage(t("reports", "showing"), { count: "10", total: "50" })}</p>
```

### Date & Number Formatting

```jsx
const { language } = useLanguage();

// Date formatting
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat(language === "bm" ? "ms-MY" : "en-MY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

// Currency formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat(language === "bm" ? "ms-MY" : "en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(amount);
};

// Usage
<span>{formatDate(new Date())}</span>      // "29 Januari 2026" or "January 29, 2026"
<span>{formatCurrency(1500.50)}</span>     // "RM1,500.50"
```

### Provider Setup

```jsx
// src/app/providers.tsx
"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
```

### Adding New Translations

When adding new features, follow this pattern:

```tsx
// 1. Add to English translations first
en: {
  newFeature: {
    title: "Feature Title",
    description: "Feature description",
    actionButton: "Do Action",
  }
}

// 2. Add corresponding BM translations
bm: {
  newFeature: {
    title: "Tajuk Ciri",
    description: "Penerangan ciri",
    actionButton: "Lakukan Tindakan",
  }
}

// 3. Use in component
const { t } = useLanguage();
<h2>{t("newFeature", "title")}</h2>
```

### Common Translation Patterns

```jsx
// Page titles
{t("nav", "pageName")}

// Form labels
{t("common", "fieldName")} or {t("feature", "fieldName")}

// Buttons
{t("common", "save")}
{t("common", "cancel")}
{t("common", "submit")}
{t("common", "delete")}

// Status
{t("status", "pending")}
{t("status", "approved")}

// Messages
{t("success", "saved")}
{t("errors", "required")}
{t("confirm", "deleteMessage")}

// Navigation
{t("nav", "home")}
{t("header", "myRequests")}
```

### Translation Keys Naming Convention

- Use **camelCase** for all keys: `welcomeMessage`, `submitRequest`
- Keep keys **descriptive but concise**: `flightBooking` not `fb`
- Group related keys in the same section
- Use consistent verbs: `create`, `edit`, `delete`, `view`, `submit`
- Status keys should match enum values when possible

---

## Responsive Design

### Breakpoints
```css
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Common Patterns
```jsx
{/* Mobile-first responsive */}
<div className="
  grid grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
  gap-4
">

{/* Hide on mobile */}
<div className="hidden md:block">Desktop only</div>

{/* Show on mobile only */}
<div className="md:hidden">Mobile only</div>

{/* Responsive padding */}
<div className="px-4 sm:px-6 lg:px-8">

{/* Responsive text */}
<h1 className="text-xl sm:text-2xl lg:text-3xl">
```

---

## Z-Index & Shadows

### Z-Index Scale

Use consistent z-index values to maintain proper layering:

| Layer | Z-Index | Usage |
|-------|---------|-------|
| **Base** | `z-0` | Default content |
| **Dropdown** | `z-10` | Dropdown menus, autocomplete |
| **Sticky** | `z-20` | Sticky headers, sidebar |
| **Fixed** | `z-30` | Fixed navigation, headers |
| **Modal Backdrop** | `z-40` | Modal/dialog backdrops |
| **Modal Content** | `z-50` | Modal/dialog content |
| **Popover** | `z-50` | Popovers, tooltips |
| **Toast** | `z-50` | Toast notifications |
| **Max** | `z-[100]` | Critical overlays |

```jsx
{/* Header */}
<header className="sticky top-0 z-30">

{/* Sidebar */}
<aside className="fixed left-0 top-16 z-20">

{/* Dropdown */}
<div className="absolute z-10">

{/* Modal */}
<div className="fixed inset-0 z-40" /> {/* Backdrop */}
<div className="fixed inset-0 z-50">   {/* Content */}

{/* Toast */}
<div className="fixed bottom-4 right-4 z-50">
```

### Shadow Scale

```jsx
{/* No shadow - Flat elements */}
className="shadow-none"

{/* Extra small - Subtle depth */}
className="shadow-xs"  // 0 1px 2px rgba(0,0,0,0.05)

{/* Small - Cards, buttons */}
className="shadow-sm"  // 0 1px 2px rgba(0,0,0,0.05)

{/* Default - Elevated cards */}
className="shadow"     // 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)

{/* Medium - Dropdowns */}
className="shadow-md"  // 0 4px 6px rgba(0,0,0,0.1)

{/* Large - Modals, popovers */}
className="shadow-lg"  // 0 10px 15px rgba(0,0,0,0.1)

{/* Extra large - Dialogs */}
className="shadow-xl"  // 0 20px 25px rgba(0,0,0,0.1)

{/* 2XL - Maximum emphasis */}
className="shadow-2xl" // 0 25px 50px rgba(0,0,0,0.25)
```

### Shadow Usage by Component

| Component | Shadow | Notes |
|-----------|--------|-------|
| Card (flat) | `shadow-none` | Use border instead |
| Card (elevated) | `shadow-sm` | Subtle elevation |
| Button (hover) | `shadow-sm` | On hover state |
| Dropdown | `shadow-lg` | Floating menus |
| Modal | `shadow-xl` | Important dialogs |
| Toast | `shadow-lg` | Notifications |
| Popover | `shadow-lg` | Contextual info |
| Command Palette | `shadow-2xl` | Maximum emphasis |

### Dark Mode Shadows

Shadows are less visible in dark mode. Consider using borders for depth:

```jsx
{/* Light mode: shadow */}
className="shadow-lg"

{/* Dark mode: often use border or lighter shadow */}
className="shadow-lg dark:shadow-slate-900/50"

{/* Or use border for definition */}
className="shadow-lg border border-gray-200 dark:border-slate-700"
```

### Border Radius Scale

```jsx
{/* None */}
className="rounded-none"  // 0

{/* Small */}
className="rounded-sm"    // 2px

{/* Default */}
className="rounded"       // 4px

{/* Medium */}
className="rounded-md"    // 6px

{/* Large - Primary choice for cards, buttons */}
className="rounded-lg"    // 8px

{/* Extra large */}
className="rounded-xl"    // 12px

{/* 2XL */}
className="rounded-2xl"   // 16px

{/* Full (pills, avatars) */}
className="rounded-full"  // 9999px
```

### Component Border Radius

| Component | Radius | Class |
|-----------|--------|-------|
| Buttons | 8px | `rounded-lg` |
| Cards | 8px | `rounded-lg` |
| Modals | 12px | `rounded-xl` |
| Inputs | 8px | `rounded-lg` |
| Badges | Full | `rounded-full` |
| Avatars | Full | `rounded-full` |
| Tooltips | 8px | `rounded-lg` |
| Tabs (pill) | 6px | `rounded-md` |

---

## Accessibility

### Focus States

Always provide visible focus indicators for keyboard navigation:

```jsx
{/* Default focus ring */}
className="focus:ring-2 focus:ring-[#1a73e8] focus:ring-offset-2 focus:outline-none"

{/* Focus within container */}
className="focus-within:ring-2 focus-within:ring-[#1a73e8]"

{/* Input focus */}
<input className="focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent" />

{/* Button focus */}
<button className="focus:ring-2 focus:ring-[#1a73e8] focus:ring-offset-2 focus:outline-none">

{/* Card focus (for keyboard navigation) */}
<div tabIndex={0} className="focus:ring-2 focus:ring-[#1a73e8] focus:outline-none rounded-lg">

{/* Skip to main content link */}
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 px-4 py-2 bg-[#1a73e8] text-white rounded-lg z-50"
>
  Skip to main content
</a>
```

### ARIA Labels

```jsx
{/* Icon buttons must have labels */}
<button aria-label="Close dialog">
  <XIcon className="w-5 h-5" />
</button>

{/* Toggle buttons */}
<button
  aria-pressed={isActive}
  aria-label="Toggle dark mode"
>
  {isDark ? <SunIcon /> : <MoonIcon />}
</button>

{/* Loading states */}
<button disabled aria-busy="true">
  <Spinner aria-hidden="true" />
  <span>Loading...</span>
</button>

{/* Expandable sections */}
<button
  aria-expanded={isOpen}
  aria-controls="panel-content"
>
  Details
</button>
<div id="panel-content" hidden={!isOpen}>
  {/* Content */}
</div>

{/* Live regions for announcements */}
<div role="status" aria-live="polite" className="sr-only">
  {announcement}
</div>
```

### Screen Reader Only Text

```jsx
{/* Visually hidden but accessible */}
<span className="sr-only">Open menu</span>

{/* Or using Tailwind's sr-only class */}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Keyboard Navigation

```jsx
{/* Trap focus in modal */}
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {children}
    </div>
  );
}

{/* Keyboard shortcuts */}
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Cmd/Ctrl + K for search
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      openSearch();
    }

    // Cmd/Ctrl + N for new request
    if ((e.metaKey || e.ctrlKey) && e.key === "n") {
      e.preventDefault();
      createNewRequest();
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, []);
```

### Color Contrast

Ensure sufficient contrast ratios (WCAG 2.1):
- **Normal text**: 4.5:1 minimum
- **Large text (18px+)**: 3:1 minimum
- **UI components**: 3:1 minimum

```jsx
{/* Good contrast examples */}
<p className="text-gray-900">Dark text on light background</p>      {/* ✓ High contrast */}
<p className="text-gray-600">Secondary text</p>                      {/* ✓ Acceptable */}
<p className="text-gray-400">Muted text - use sparingly</p>          {/* ⚠ Lower contrast */}

{/* Dark mode */}
<p className="dark:text-slate-100">Light text on dark background</p> {/* ✓ High contrast */}
<p className="dark:text-slate-400">Secondary text in dark mode</p>   {/* ✓ Acceptable */}

{/* Avoid */}
<p className="text-gray-300">Very low contrast - avoid</p>           {/* ✗ Poor contrast */}
```

### Reduced Motion

Respect user preferences for reduced motion:

```jsx
{/* Disable animations for reduced motion preference */}
<div className="animate-bounce motion-reduce:animate-none">

{/* Or use CSS */}
@media (prefers-reduced-motion: reduce) {
  .animate-bounce,
  .animate-spin,
  .animate-pulse {
    animation: none;
  }

  * {
    transition-duration: 0.01ms !important;
  }
}
```

### Form Accessibility

```jsx
{/* Proper label association */}
<div>
  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
    Email address
  </label>
  <input
    type="email"
    id="email"
    name="email"
    aria-describedby="email-hint email-error"
    className="mt-1 w-full px-3 py-2 border rounded-lg"
  />
  <p id="email-hint" className="mt-1 text-xs text-gray-500">
    We'll never share your email.
  </p>
  {error && (
    <p id="email-error" role="alert" className="mt-1 text-xs text-red-600">
      {error}
    </p>
  )}
</div>

{/* Required fields */}
<label>
  Name <span className="text-red-500" aria-hidden="true">*</span>
  <span className="sr-only">(required)</span>
</label>

{/* Form errors */}
<form aria-describedby="form-errors">
  {errors.length > 0 && (
    <div id="form-errors" role="alert" className="p-4 bg-red-50 rounded-lg mb-4">
      <p className="font-medium text-red-800">Please fix the following errors:</p>
      <ul className="mt-2 list-disc list-inside text-sm text-red-700">
        {errors.map((error, i) => (
          <li key={i}>{error}</li>
        ))}
      </ul>
    </div>
  )}
  {/* Form fields */}
</form>
```

### Table Accessibility

```jsx
<table>
  <caption className="sr-only">Travel requests for January 2024</caption>
  <thead>
    <tr>
      <th scope="col">Request ID</th>
      <th scope="col">Destination</th>
      <th scope="col">Status</th>
      <th scope="col">
        <span className="sr-only">Actions</span>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">TR-2024-001</th>
      <td>Singapore</td>
      <td>
        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
          Pending
        </span>
      </td>
      <td>
        <button aria-label="View details for TR-2024-001">View</button>
      </td>
    </tr>
  </tbody>
</table>
```

### Accessibility Checklist

- [ ] All images have alt text
- [ ] Form inputs have associated labels
- [ ] Buttons have accessible names
- [ ] Color is not the only indicator
- [ ] Focus states are visible
- [ ] Keyboard navigation works
- [ ] Skip links are present
- [ ] Headings are hierarchical
- [ ] ARIA roles used appropriately
- [ ] Live regions for dynamic content
- [ ] Reduced motion respected

---

## Quick Reference

### Component Class Snippets

```jsx
// Card
"bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4"

// Interactive Card
"bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:border-[#1a73e8] dark:hover:border-blue-400 hover:shadow-sm transition-all"

// Primary Button
"px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium rounded-lg transition-colors"

// Input
"w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"

// Badge (Success)
"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300"

// Page Title
"text-2xl font-bold text-gray-900 dark:text-slate-100"

// Section Title
"text-lg font-semibold text-gray-900 dark:text-slate-100"

// Description Text
"text-gray-600 dark:text-slate-400"

// Helper Text
"text-xs text-gray-500 dark:text-slate-500"
```

---

## User Profile Page

A comprehensive profile page structure with avatar, personal info, employment details, roles & permissions, and security settings.

### Page Layout
```jsx
<div className="min-h-screen bg-[#f0f4f8] py-8">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Header with Back Button */}
    {/* Profile Card with Banner */}
    {/* Details Cards Grid (2 columns) */}
    {/* Security Section */}
  </div>
</div>
```

### Profile Header
```jsx
{/* Back Button */}
<button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
  <ArrowLeftIcon className="w-5 h-5" />
  <span>Back</span>
</button>

{/* Page Title */}
<h1 className="text-2xl font-bold text-gray-900">Profile</h1>
<p className="text-gray-600">Manage your account settings and preferences</p>
```

### Profile Card with Banner & Avatar
```jsx
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  {/* Gradient Banner */}
  <div className="h-24 bg-gradient-to-r from-[#1a73e8] to-[#4285f4]"></div>

  <div className="px-6 pb-6">
    {/* Avatar - Overlapping Banner */}
    <div className="relative -mt-12 mb-4 flex items-end gap-3">
      <div className="relative cursor-pointer" onClick={handleAvatarClick}>
        {/* Avatar Circle */}
        <div className="w-24 h-24 rounded-full border-4 border-white bg-[#1a73e8] text-white text-2xl font-bold shadow-lg relative overflow-hidden">
          {/* Initials as fallback */}
          <span className="absolute inset-0 flex items-center justify-center">
            {getInitials(user.name)}
          </span>
          {/* Image overlay if available */}
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
        {/* Camera overlay on hover */}
        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 hover:bg-black/30 transition-all">
          <CameraIcon className="w-6 h-6 text-white opacity-0 hover:opacity-100" />
        </div>
        {/* Loading spinner */}
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>
      {/* Remove photo link */}
      {avatarUrl && (
        <button className="text-sm text-red-600 hover:text-red-700 hover:underline">
          Remove photo
        </button>
      )}
    </div>

    {/* User Info */}
    <div className="flex items-start justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
        <p className="text-gray-500">{user.email}</p>
      </div>
      <button className="px-4 py-2 text-sm font-medium text-[#1a73e8] hover:bg-[#e8f0fe] rounded-lg transition-colors">
        Edit Profile
      </button>
    </div>
  </div>
</div>
```

### Collapsible Details Section
```jsx
{/* Toggle Button */}
<button
  onClick={() => setShowDetails(!showDetails)}
  className="mt-4 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
>
  <ChevronIcon className={`w-4 h-4 transition-transform ${showDetails ? "rotate-90" : ""}`} />
  <span>{showDetails ? "Hide details" : "Show details"}</span>
</button>

{/* Expandable Content */}
{showDetails && (
  <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
    <div>
      <span className="text-gray-500">Field Label:</span>
      <p className="font-medium text-gray-900">{value || "Not set"}</p>
    </div>
    {/* More fields... */}
  </div>
)}
```

### Edit Form Layout
```jsx
<div className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Text Input */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Full Name
      </label>
      <input
        type="text"
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent text-gray-900"
      />
    </div>

    {/* Select Input */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Gender
      </label>
      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent text-gray-900 bg-white">
        <option value="">Select gender...</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
    </div>

    {/* Full Width Textarea */}
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Address
      </label>
      <textarea
        rows={2}
        placeholder="Full address..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent text-gray-900"
      />
    </div>
  </div>

  {/* Action Buttons */}
  <div className="flex gap-3">
    <button className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium rounded-lg transition-colors disabled:opacity-50">
      {saving ? "Saving..." : "Save Changes"}
    </button>
    <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 font-medium rounded-lg transition-colors">
      Cancel
    </button>
  </div>
</div>
```

### Information Card with Icon Header
```jsx
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  {/* Section Header with Icon */}
  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <BuildingIcon className="w-5 h-5 text-[#1a73e8]" />
    Employment Information
  </h3>

  <div className="space-y-4">
    {/* Two Column Layout */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Employee ID
        </label>
        <p className="text-gray-900 font-medium">{user.employee_id || "Not assigned"}</p>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Grade
        </label>
        <p className="text-gray-900 font-medium">
          <span className="bg-[#1a73e8] text-white text-xs px-2 py-0.5 rounded font-bold">
            {user.grade}
          </span>
        </p>
      </div>
    </div>

    {/* Single Column */}
    <div>
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Position
      </label>
      <p className="text-gray-900 font-medium">{user.position}</p>
    </div>

    {/* Sub-section with Border */}
    <div className="pt-2 border-t border-gray-100">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
        Organization Hierarchy
      </p>
      {/* Hierarchy items... */}
    </div>
  </div>
</div>
```

### Access Level Indicator
```jsx
<div>
  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
    Access Level
  </label>
  <div className="flex items-center gap-2 mt-1">
    {/* Level dots */}
    <div className="flex">
      {[1, 2, 3, 4, 5, 6, 7].map((level) => (
        <div
          key={level}
          className={`w-4 h-4 rounded-full border-2 ${
            level <= currentLevel
              ? "bg-[#1a73e8] border-[#1a73e8]"
              : "bg-gray-100 border-gray-300"
          } ${level > 1 ? "-ml-1" : ""}`}
        />
      ))}
    </div>
    <span className="text-sm text-gray-600">
      Level {currentLevel} of 7
    </span>
  </div>
</div>
```

### Permissions List
```jsx
<div className="pt-4 border-t border-gray-100">
  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-3">
    <KeyIcon className="w-3.5 h-3.5" />
    Permissions
  </label>
  <div className="grid grid-cols-2 gap-3">
    {Object.entries(permissionGroups).map(([group, perms]) => (
      perms.length > 0 && (
        <div key={group}>
          <h4 className="text-xs font-medium text-gray-600 mb-1.5">{group}</h4>
          <ul className="space-y-0.5">
            {perms.map((p) => (
              <li key={p} className="text-xs text-gray-500 flex items-center gap-1">
                <CheckIcon className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span className="capitalize">{formatPermission(p)}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    ))}
  </div>
</div>
```

### Special Permission Card
```jsx
<div className="p-2.5 bg-purple-50 border border-purple-100 rounded-lg">
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-sm font-medium text-gray-900">
      {permission.label}
    </span>
    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
      {permission.scope}
    </span>
  </div>
  <div className="text-xs text-gray-600 mt-1">
    Scope: <span className="font-medium">{permission.scope_id}</span>
  </div>
  <div className="text-xs text-gray-400 mt-0.5">
    Granted {grantDate}
    {expiresAt && (
      <span className="ml-2 text-amber-600">
        · Expires {expiresDate}
      </span>
    )}
  </div>
</div>
```

### Security Section
```jsx
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <LockIcon className="w-5 h-5 text-[#1a73e8]" />
    Security
  </h3>

  {/* Default State */}
  <p className="text-gray-600 mb-4">
    Keep your account secure by using a strong password.
  </p>
  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
    Change Password
  </button>

  {/* Password Form (when expanded) */}
  <div className="max-w-md space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Current Password
      </label>
      <input
        type="password"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent text-gray-900"
      />
    </div>
    {/* New Password, Confirm Password fields... */}
  </div>
</div>
```

### Success/Error Messages
```jsx
{/* Success Message */}
<div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
  Profile updated successfully
</div>

{/* Error Message */}
<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
  Failed to update profile
</div>
```

### Profile Page Icons
```jsx
// Camera Icon (for avatar upload)
<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>

// Building Icon (for employment)
<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
</svg>

// Shield Icon (for roles/access)
<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
</svg>

// Lock Icon (for security)
<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
</svg>

// Key Icon (for permissions)
<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
</svg>

// Users Icon (for special permissions)
<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
</svg>

// Chevron Icon (for expandable sections)
<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
</svg>
```

### Profile Card Variants

```jsx
{/* Compact Info Card */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <Icon className="w-5 h-5 text-[#1a73e8]" />
    Section Title
  </h3>
  <div className="space-y-4">
    {/* Content */}
  </div>
</div>

{/* Two Column Grid for Cards */}
<div className="grid md:grid-cols-2 gap-6">
  {/* Employment Info Card */}
  {/* Role & Access Card */}
</div>
```

### Helper Functions
```typescript
// Get initials from name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Format permission for display
const formatPermission = (permission: string) => {
  return permission
    .replace("request:", "")
    .replace("users:", "")
    .replace(/_/g, " ");
};

// Group permissions by category
const groupPermissions = (permissions: string[]) => {
  const groups: Record<string, string[]> = {
    Requests: [],
    Users: [],
    Reports: [],
    System: [],
  };
  permissions.forEach((p) => {
    if (p.startsWith("request:")) groups.Requests.push(p);
    else if (p.startsWith("users:")) groups.Users.push(p);
    else if (p.startsWith("reports:")) groups.Reports.push(p);
    else groups.System.push(p);
  });
  return groups;
};
```

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   └── [feature]/
│       └── page.tsx
├── components/
│   ├── common/             # Shared components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── CurrencyTicker.tsx
│   ├── layout/             # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── [feature]/          # Feature-specific components
├── context/                # React contexts
│   ├── AuthContext.tsx
│   └── LanguageContext.tsx
├── hooks/                  # Custom hooks
├── lib/                    # Utilities & API clients
│   ├── travelApi.ts
│   └── currencyApi.ts
├── types/                  # TypeScript types
└── data/                   # Static data
```

---

*Last updated: January 2026*
*GovTravel Design System v1.0*
