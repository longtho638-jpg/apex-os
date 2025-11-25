---
description: Full feature workflow using Gemini agents - Plan, Code, Test, Review.
argument-hint: [feature-description] [requirements]
---

## Arguments
- FEATURE: $1 (A detailed description of the feature to be built)
- REQUIREMENTS: $2 (Optional: Specific constraints, libraries, or patterns to use)

## Mission

Execute a complete, end-to-end, agentic feature development workflow for: **$FEATURE**

This command will orchestrate a sequence of specialized Gemini agents to take a feature request from idea to production-ready code.

## Requirements
$REQUIREMENTS

## Agentic Workflow Steps

### Step 1: Planning (Gemini Planner Agent)
- **Action**: Deconstruct the feature request into a detailed, step-by-step technical plan.
- **Responsibilities**:
    - Analyze requirements and constraints.
    - Design a scalable and maintainable architecture.
    - Define the specific tasks for the Implementer and Tester agents.
- **Output**: A comprehensive plan saved to `plans/YYMMDD-[feature]-plan.md`.

### Step 2: Implementation (Gemini Implementer Agent)
- **Action**: Generate production-ready code based on the tasks defined in the plan.
- **Responsibilities**:
    - Follow the plan from the Planner agent precisely.
    - Generate TypeScript components, API routes, and database schemas.
    - Ensure all code adheres to the project's coding standards.
- **Output**: Source code files in the `src/` directory.

### Step 3: Testing (Gemini Tester Agent)
- **Action**: Generate a comprehensive suite of tests for the newly created code.
- **Responsibilities**:
    - Create unit, component, and integration tests.
    - Focus on testing behavior and critical edge cases.
    - Aim for meaningful test coverage of >85%.
- **Output**: `*.test.ts` files alongside the source code.

### Step 4: Code Review (Gemini Reviewer Agent)
- **Action**: Perform a deep, semantic review of the generated code and tests.
- **Responsibilities**:
    - Validate code against the original plan and project standards.
    - Check for logical flaws, security vulnerabilities, and performance bottlenecks.
    - Provide actionable feedback or approve the code for merging.
- **Output**: A detailed review report in `plans/reports/YYMMDD-review-report.md`.

### Step 5: Documentation (Gemini Implementer Agent - Docs Mode)
- **Action**: Generate JSDoc comments and basic documentation for the new feature.
- **Responsibilities**:
    - Document all public APIs, props, and functions.
    - Create or update the relevant README files.
- **Output**: Updated source code files with documentation.

## Standards to Follow

- **Code Quality**: TypeScript strict mode, no `any` types, Zod for validation, robust error handling.
- **Testing**: Meaningful coverage (>85%), behavior-driven tests, and no flaky tests.
- **Architecture**: Clean, component-based, separation of concerns, and adherence to the plan.
- **Documentation**: JSDoc for everything, clear READMEs, and usage examples.

## Final Output

This workflow produces a complete, production-ready feature, including:

1.  **Plan**: `plans/YYMMDD-[feature]-plan.md`
2.  **Source Code**: New components, APIs, and utilities in `src/`.
3.  **Tests**: A full suite of `*.test.ts` files.
4.  **Review Report**: A quality and security assessment report.
5.  **Documentation**: Code is documented with JSDoc.

## Success Criteria

- A complete, working feature that meets all requirements.
- >85% meaningful test coverage.
- Zero TypeScript errors in strict mode.
- A successful review from the Gemini Reviewer agent.
- All public APIs and components are documented.
- The feature is ready for production deployment.

---

**Command**: `/cook [feature] [requirements]`
**Agents**: `gemini-planner` → `gemini-implementer` → `gemini-tester` → `gemini-reviewer`
**Workflow Type**: Sequential, Fully Agentic
**Estimated Time**: 1-3 hours per feature, depending on complexity.
