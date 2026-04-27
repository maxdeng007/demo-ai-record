---
name: Counsellor Meeting Demo
description: AI-assisted financial counselling meeting workflow demo.
colors:
  brand-primary: "#1989fa"
  brand-primary-soft: "#3ea3ff"
  neutral-bg: "#f8fafc"
  neutral-surface: "#ffffff"
  neutral-text: "#334155"
  neutral-muted: "#94a3b8"
  success: "#10b981"
  warning: "#f59e0b"
  danger: "#f43f5e"
typography:
  display:
    fontFamily: "inherit"
    fontSize: "clamp(1.5rem, 2vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "inherit"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.6
  label:
    fontFamily: "inherit"
    fontSize: "11.5px"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  sm: "8px"
  md: "12px"
  lg: "20px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.brand-primary}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "10px 18px"
  button-secondary:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.pill}"
    padding: "10px 18px"
  panel-card:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System: Counsellor Meeting Demo

## 1. Overview

**Creative North Star: "Calm Operational Intelligence"**

This interface presents AI assistance as a reliable professional tool, not a spectacle. Visual hierarchy must make workflow state and next action obvious at a glance, especially during recording and review transitions.

The system rejects decorative AI clichés. It favors restrained color use, readable density, and concise status communication so users can stay focused on meeting quality and follow-up tasks.

Key characteristics:
- Clear two-column task orientation on desktop.
- Quiet neutrals with a single blue interaction accent.
- States that communicate progress without visual noise.
- Rounded, approachable surfaces with enterprise-level restraint.

## 2. Colors

### Primary
- **Advisor Blue** (`#1989fa`): Primary actions, active highlights, and status accents.
- **Advisor Blue Soft** (`#3ea3ff`): Gradient support and secondary blue emphasis.

### Neutral
- **Surface White** (`#ffffff`): Main cards and containers.
- **Canvas Mist** (`#f8fafc`): Background and low-emphasis containers.
- **Body Slate** (`#334155`): Primary text and core readable content.
- **Muted Slate** (`#94a3b8`): Hints, inactive labels, helper text.

### Semantic
- **Success Mint** (`#10b981`): Positive confirmation and completion cues.
- **Warning Amber** (`#f59e0b`): Risk and caution callouts.
- **Attention Rose** (`#f43f5e`): Recording/live urgency and destructive emphasis.

**The Accent Discipline Rule.** Blue is the primary accent. When another semantic color appears, it communicates state, never decoration.

## 3. Typography

Typography stays system-native and utilitarian to keep product focus high.

### Hierarchy
- **Display** (700, `clamp(1.5rem, 2vw, 2rem)`, 1.2): Major section headers and hero-level product titles.
- **Body** (500, `13px`, 1.6): Main transcript and explanatory content.
- **Label** (600, `11.5px`, 1.4): Chips, hints, metadata, status UI.

**The Readability Rule.** Labels and helper text can be muted, but essential status text must remain legible at first glance.

## 4. Elevation

Depth is subtle and structural. Cards use soft shadows to define hierarchy, not to create dramatic visual effects.

- **Panel Elevation** (`0 18px 36px -24px rgba(15, 36, 75, 0.18)`): Main summary and transcript containers.
- **Action Elevation** (`0 8px 18px -10px rgba(25, 137, 250, 0.7)`): Primary CTA emphasis only.

**The Flat-By-Default Rule.** Most surfaces remain visually quiet at rest; stronger elevation appears only for primary interaction emphasis.

## 5. Components

### Buttons
- **Primary CTA**: Blue gradient fill, white text, pill radius, centered icon+label.
- **Secondary/Ghost**: Neutral fill and border, lower visual weight than primary.
- **Temporary controls**: Dashed border + muted text to signal non-core utility.

### Transcript & Recording
- **Transcript card**: White surface with subtle border and soft shadow.
- **Inline recorder dock**: Attached footer-style bar with top hairline divider.
- **Idle hints**: Monotone iconography and muted text to avoid competing with primary action.

### Summary Panel
- **Collapsed state**: Minimal icon + one-line guidance.
- **Analyzing state**: Single focused animated loader with concise text.
- **Ready state**: Structured blocks for summary, profile, risk, topics, and actions.

### Modal
- **Client linker**: Non-dismissible by default flow, clear confirm/cancel actions, concise helper notes.

## 6. Do's and Don'ts

### Do
- **Do** keep AI status communication concise and state-specific.
- **Do** preserve action hierarchy (primary > secondary > temporary).
- **Do** use muted helper styling for instructional hints and placeholders.
- **Do** maintain bilingual parity for critical workflow messages.

### Don't
- **Don't** use generic AI visual tropes (purple gradients, glow-heavy glass effects).
- **Don't** overload loading states with multiple simultaneous indicators.
- **Don't** let secondary actions visually compete with primary CTAs.
- **Don't** introduce one-off typography or color values outside the token vocabulary.
