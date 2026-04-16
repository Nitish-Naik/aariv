---
description: "Use when designing or refactoring frontend UI in the web app, including pages, components, styles, and theming. Enforces a production-grade design system with centralized tokens, strict spacing/typography scales, reusable primitives, and premium interaction quality."
name: "Frontend Design System Standards"
applyTo:
  - "web/src/**/*.ts"
  - "web/src/**/*.tsx"
  - "web/src/**/*.js"
  - "web/src/**/*.jsx"
  - "web/src/**/*.css"
---

# Frontend Design System Standards

These are hard rules for UI work in `web/src`. Build with one cohesive visual language. Target outcomes: minimal, fast, clean, premium, and consistent.

## 1) Design Tokens Are the Single Source of Truth

- Define all visual primitives as CSS variables using HSL values.
- Include token groups for:
  - backgrounds: `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
  - text: `--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverted`
  - borders: `--border-subtle`, `--border-strong`
  - brand: `--brand`, `--brand-hover`, `--brand-active`
  - semantic: `--success`, `--warning`, `--error`, `--info`
- Support both light and dark themes with validated contrast.
- Do not hardcode raw hex/rgb/hsl values in component styles.

## 2) Visual Hierarchy and Depth

- Use layered surfaces consistently:
  - base backgrounds
  - elevated surfaces (cards, modals)
  - floating layers (menus, popovers, tooltips)
- Prefer subtle borders for separation.
- Use soft shadows sparingly and consistently.
- Use backdrop blur for overlays where appropriate.
- Avoid flat, depthless UI and avoid heavy shadow stacks.

## 3) Typography System

- Enforce a strict type scale and reuse semantic text styles.
- Standardize:
  - font sizes
  - font weights
  - line heights
  - letter spacing
- Maintain clear hierarchy across title, subtitle, body, and caption styles.
- Do not introduce ad-hoc text sizing per component.

## 4) Spacing System (8px Grid)

- Use a strict spacing scale derived from 4/8 increments: `4, 8, 12, 16, 24, 32, 40, 48...`.
- Keep spacing consistent for paddings, margins, gaps, and section rhythm.
- No random one-off spacing values.

## 5) Reusable Component Primitives

- Build and use reusable primitives for: Button, Input, Card, Modal, Table, Badge, Dropdown.
- Every primitive must:
  - support light and dark themes
  - include hover, focus, active, and disabled states
  - use tokens only (no hardcoded visual values)
- Prefer composition of primitives over page-specific one-off components.

## 6) Interaction Quality

- Use subtle transitions in the 150-250ms range with smooth easing.
- Ensure hover states are responsive but restrained.
- Keep focus states accessible and visually clean.
- Add small micro-interactions for tactile feel (for example button press depth).
- Avoid flashy or distracting motion and avoid janky animation.

## 7) Dark Mode Quality

- Do not invert light theme colors directly.
- Use layered grays and slightly desaturated surfaces.
- Avoid pure black backgrounds.
- Optimize for readability and eye comfort.

## 8) Consistency Enforcement

- Remove hardcoded colors and inconsistent spacing.
- Standardize border radius and shadow scales.
- Keep component dimensions and alignments predictable.

## 9) Layout System

- Use consistent container widths and horizontal paddings.
- Keep page grids aligned and reusable across screens.
- Ensure navbar, sidebar, and content panels feel unified.

## 10) Developer Experience

- Prefer a shared `useTheme()` hook for theme-aware behavior.
- Provide helper utilities/classes for tokenized styling and state handling.
- Keep component APIs predictable and documented with concise comments where needed.

## 11) Definition of Done

- No visible section feels off-system.
- New UI changes can be implemented by reusing primitives and tokens.
- Light and dark themes both look intentional, not patched.
