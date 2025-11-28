---
description: Generate React/Next.js component with Claude Sonnet
argument-hint: [component-name] [requirements]
---

## Arguments
- COMPONENT_NAME: $1 (e.g., UserCard, DashboardChart, LoginForm)
- REQUIREMENTS: $2 (specific requirements and features)

## Mission
Generate a production-ready React component named $COMPONENT_NAME with the following requirements:
$REQUIREMENTS

## Standards & Best Practices
- Use TypeScript with strict mode enabled
- Follow Next.js 16.0.3 conventions
- Use React 19.2.0 patterns
- Include proper error handling
- Add TypeScript interfaces for props
- Use Tailwind CSS for styling
- Include JSDoc comments for public methods
- No console.logs in production code
- Proper accessibility (a11y) attributes
- Mobile-responsive design
- Return proper TypeScript types

## Component Structure
```
export interface ComponentProps {
  // Props definition
}

export function ComponentName(props: ComponentProps) {
  // Implementation
  return (/* JSX */)
}
```

## Quality Checklist
- ✓ TypeScript types defined
- ✓ Props interface exported
- ✓ No any types
- ✓ Error handling implemented
- ✓ Responsive design
- ✓ Accessibility attributes (aria-*, role, etc)
- ✓ JSDoc comments
- ✓ No console.logs

## Output Format
Return only the component code without markdown backticks or explanations.
