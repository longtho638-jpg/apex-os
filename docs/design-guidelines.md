# Design Guidelines

**Version**: 1.0.0
**Date**: 2026-02-04

## 1. Design Philosophy
Apex-OS follows a "Data-First" design philosophy. The interface prioritizes clarity, speed, and accuracy of financial data. Visual noise is minimized to allow traders to focus on signals and execution.

## 2. Color Palette
The color scheme is designed for dark-mode first usage, typical of trading environments, to reduce eye strain during prolonged sessions.

- **Primary Background**: `#000000` (Pure Black) or `#0f172a` (Slate 900)
- **Secondary Background**: `#1e293b` (Slate 800) for cards/panels.
- **Accent**: Brand-specific blue/purple for primary actions.
- **Semantic Colors**:
  - **Buy/Long/Profit**: `#22c55e` (Green 500)
  - **Sell/Short/Loss**: `#ef4444` (Red 500)
  - **Warning**: `#eab308` (Yellow 500)
  - **Info**: `#3b82f6` (Blue 500)

## 3. Typography
- **Font Family**: Inter or system-ui for UI elements; Monospace (JetBrains Mono/Fira Code) for numbers and code.
- **Weights**:
  - Regular (400) for body text.
  - Medium (500) for labels.
  - Bold (700) for headers and critical values (e.g., current price).

## 4. Components

### 4.1 Cards
- Flat design with subtle borders (`border-slate-800`).
- No shadows in default state; subtle shadow on hover for interactive cards.

### 4.2 Buttons
- **Primary**: Solid background color, white text.
- **Secondary**: Outline or ghost style.
- **Destructive**: Red background or text.
- **Size**: Mobile-friendly touch targets (min 44px height).

### 4.3 Charts
- Clean axes, minimal grid lines.
- Tooltips enabled for detailed data inspection.
- Color-coded series matching semantic colors.

## 5. Layout & Grid
- **Desktop**: 12-column grid system. Dashboard typically uses a 3-panel layout (Nav, Main Content, Side Panel).
- **Mobile**: Single column stack. Complex tables scroll horizontally or convert to card view.

## 6. Tailwind CSS v4 Usage
- Use utility classes for layout and spacing.
- Define custom theme values in CSS variables if needed, but prefer standard Tailwind palette.
- Use `@apply` sparingly; prefer inline classes for component portability.

## 7. Accessibility (a11y)
- **Contrast**: Ensure text meets WCAG AA standards.
- **Keyboard**: All interactive elements must be focusable and actionable via keyboard.
- **Screen Readers**: Use `aria-label` for icon-only buttons.
