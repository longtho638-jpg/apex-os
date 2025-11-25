---
name: gemini-3.0-pro
version: 1.0.0
category: model
last-updated: 2025-11-25
---

# Skill: Gemini 3.0 Pro

## Overview

This document outlines the best practices and patterns for leveraging the Gemini 3.0 Pro model within the Apex-OS agentic framework. Gemini 3.0 Pro is a highly capable multimodal model with advanced reasoning, a large context window, and native tool use, making it ideal for complex, multi-step development tasks.

## Core Principles for Using Gemini

1.  **Embrace Agentic Workflows**: Gemini excels at breaking down large, complex problems into smaller, sequential tasks. Always use agentic commands like `/cook` for features.
2.  **Leverage Deep Reasoning**: Trust Gemini's ability to understand code semantics, not just syntax. Prompt it to reason about logic, edge cases, and potential bugs.
3.  **Utilize the Large Context Window**: Provide as much relevant context as possible. This includes the plan, related code files, and documentation. Gemini can process it all to make better decisions.
4.  **Be Specific with Instructions**: While powerful, Gemini works best with clear, specific instructions. A well-defined plan from the `gemini-planner` is crucial for success.
5.  **Iterate with Feedback**: Use the `gemini-reviewer` to get detailed feedback. Gemini is excellent at understanding and incorporating feedback in subsequent iterations.

## Best Practices for Agentic Tasks

### 1. Planning (`gemini-planner`)
- **Decomposition is Key**: Encourage the planner to create a detailed, step-by-step plan with clear tasks for each subsequent agent. This is the most critical step for a successful outcome.
- **Example Prompt**: `/plan "Build a user profile page with editable fields and an avatar upload feature" "Use Supabase for storage and ensure the design is responsive."`

### 2. Implementation (`gemini-implementer`)
- **Follow the Plan**: The implementer should be instructed to follow the plan from the planner precisely.
- **Generate in Small Chunks**: For complex features, break down the implementation into smaller tasks (e.g., "create the API route," then "create the frontend component").
- **Self-Correction**: Gemini can be prompted to review and correct its own code before outputting the final version.

### 3. Testing (`gemini-tester`)
- **Behavior-Driven Tests**: Ask the tester to generate tests that verify the *behavior* of the application, not just the implementation details.
- **Edge Case Generation**: Prompt Gemini to "think of all possible edge cases" for a given function or component and generate tests for them.
- **Example Prompt**: `/test "The user profile avatar upload component" "Include tests for file size limits, invalid file types, and API errors."`

### 4. Reviewing (`gemini-reviewer`)
- **Semantic Review**: Ask the reviewer to perform a "semantic and logical review" to catch bugs that linters would miss.
- **Security Audit**: Prompt the reviewer to "act as a security expert and audit the code for potential vulnerabilities."
- **Holistic Analysis**: Because of its large context window, the reviewer can analyze the entire feature (code, tests, and plan) to ensure everything is aligned.

## Gemini vs. Claude: When to Use Which

| Task                      | Recommended Model   | Why                                                                                             |
| ------------------------- | ------------------- | ----------------------------------------------------------------------------------------------- |
| **Agentic Workflows**     | **Gemini 3.0 Pro**  | Superior reasoning and planning capabilities make it ideal for multi-step, complex tasks.         |
| **Complex Architecture**  | **Gemini 3.0 Pro**  | Excels at understanding and designing complex, distributed systems.                             |
| **Code Generation**       | Both (Context-based) | Claude is excellent for boilerplate. Gemini is better for complex logic and algorithms.       |
| **Test Generation**       | **Gemini 3.0 Pro**  | Better at identifying logical edge cases and generating comprehensive, behavior-driven tests.   |
| **Code Review**           | **Gemini 3.0 Pro**  | Advanced reasoning helps find subtle bugs and security issues.                                  |
| **Documentation/Research**| Gemini 3.0 Pro      | Faster and more cost-effective for summarization, research, and documentation tasks.            |

**Default Recommendation**: Use the **Gemini agentic workflow (`/cook`)** for all new feature development.

## Performance & Cost

- **Cost-Effective**: Gemini 3.0 Pro is significantly more cost-effective than previous generation models, making complex agentic workflows economically viable.
- **Speed**: The model is optimized for speed, providing fast responses that are crucial for an interactive development experience.

## Future-Proofing

The agentic architecture built around Gemini is designed to be future-proof. As new, more powerful versions of Gemini are released in 2026 and beyond, they can be easily integrated into this framework by updating the model name in the agent definitions. The core principles of planning, implementing, testing, and reviewing will remain the same.

---

**Version**: 1.0.0
**Updated**: 2025-11-25
**Primary Model**: `google/gemini-3.0-pro`
