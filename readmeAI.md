# Smart Tagging — AI Feature Documentation

## What Problem It Solves

In a deal list with 100+ records, partners spend time manually identifying which deals need attention. Smart Tagging surfaces actionable signal directly in the list — a "Stale Deal" tag immediately tells a partner manager that an open deal has been sitting for over 30 days without action, without them needing to sort by date and calculate age manually.

## Why It Improves UX

- **Reduces cognitive load** — instead of reading raw numbers and dates, users see human-readable intent labels ("High Value", "Stale Deal") at a glance.
- **Enables faster triage** — partners can scan for "Recently Created" tags to prioritise new leads, or filter by "Stale Deal" to run a follow-up campaign, without building a custom filter.
- **Zero latency** — tags are computed synchronously during rendering. There is no loading state, no spinner, no network round-trip. The UI feels instantaneous.
- **Consistent** — tags apply the same business rules for every user and every page load. A partner in Tokyo and an admin in Berlin see the same tag for the same deal.

## Overview

Smart Tagging automatically classifies deals with descriptive labels based on their properties. Tags are computed client-side on every render with zero latency and no external API calls.

## Implementation

**File**: `src/utils/smartTags.ts`

```typescript
export function computeSmartTags(deal: Deal): SmartTag[] {
  const tags: SmartTag[] = []
  const daysSinceCreated = (Date.now() - new Date(deal.createdDate).getTime()) / 86_400_000

  if (deal.amount > 10_000) tags.push('High Value')
  if (deal.amount > 30_000) tags.push('Large Enterprise')
  if (daysSinceCreated < 7) tags.push('Recently Created')
  if (deal.status === 'Open' && daysSinceCreated > 30) tags.push('Stale Deal')

  return tags
}
```

## Tag Definitions

| Tag | Condition | Color |
|---|---|---|
| **High Value** | `amount > $10,000` | Green |
| **Large Enterprise** | `amount > $30,000` | Purple |
| **Recently Created** | Created within the last 7 days | Blue |
| **Stale Deal** | Status is `Open` and created > 30 days ago | Amber |

## Where Tags Appear

- **Deal list table** — in the Tags column (desktop) or on the card (mobile)
- **Deal detail panel** — displayed prominently below the deal name in the inline slide-in panel

## Approach: Rule-Based, Not ML

**Why rule-based?** The tagging criteria are straightforward business rules with clear thresholds that a product manager can define and adjust without training data. Rule-based logic is:
- Deterministic and auditable (no black-box predictions)
- Zero-latency (computed synchronously in the browser)
- Testable with standard unit tests (see `src/utils/__tests__/smartTags.test.ts`)
- Zero additional infrastructure cost

**When to upgrade to ML**: If client wanted to predict deal win probability or classify deals from unstructured notes, a lightweight model (e.g., fine-tuned text classifier via Claude API) would be appropriate. The `computeSmartTags` function is designed as a pure function, making it trivial to swap the implementation.

## AI Disclosure

This feature does **not** call any AI/ML API. The word "Smart" refers to automated business-rule classification, not machine learning inference. No user data is sent to external AI services.

## Extending Tags

To add a new tag:
1. Add the tag string to the `SmartTag` union type in `smartTags.ts`
2. Add the condition in `computeSmartTags()`
3. Add a color class in `SMART_TAG_COLORS`
4. Add a translation key in all 5 locale files under `smartTags.*` (en/de/ja/es/zh)
5. Add a unit test in `src/utils/__tests__/smartTags.test.ts`
