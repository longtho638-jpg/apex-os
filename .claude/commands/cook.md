---
description: Full feature workflow - Plan, Code, Test, Review, Docs
argument-hint: [feature-description] [requirements]
---

## Arguments
- FEATURE: $1 (Feature description)
- REQUIREMENTS: $2 (Additional requirements)

## Mission

Execute complete feature development workflow for: $FEATURE

## Requirements
$REQUIREMENTS

## Workflow Steps

### Step 1: Planning (Planner Agent)
- Analyze feature requirements
- Design architecture
- Identify components and APIs
- Create implementation plan
- Save: `plans/YYMMDD-[feature]-plan.md`

### Step 2: Implementation (Implementer Agent)
- Follow plan from Planner
- Generate TypeScript components
- Create API routes
- Implement data layer
- Add error handling
- Ensure type safety

### Step 3: Testing (Tester Agent)
- Create unit tests for utilities
- Create component tests for UI
- Create integration tests
- Achieve >80% coverage
- Test error cases
- Test loading/empty states

### Step 4: Code Review (Reviewer Agent)
- Review code quality
- Verify TypeScript compliance
- Check error handling
- Validate test coverage
- Check documentation
- Provide feedback/approval

### Step 5: Documentation (Docs Agent)
- Auto-generate API docs
- Update README
- Document components
- Update guides
- Create examples

## Standards to Follow

### Code Quality
- TypeScript strict mode
- No `any` types
- Proper error handling
- Input validation (Zod)
- JSDoc comments
- Clean code principles

### Testing
- Unit tests (>80% coverage)
- Component tests
- Integration tests
- Error case tests
- Edge case tests
- Loading state tests

### Architecture
- Component-based
- Separation of concerns
- Reusable patterns
- Proper type safety
- Clean API design
- Database schema

### Documentation
- Code comments
- API documentation
- README updates
- Component stories
- Example usage
- Deployment notes

## Output

The workflow produces:

1. **Plan**: `plans/YYMMDD-[feature]-plan.md`
2. **Code**: New components, APIs, utilities
3. **Tests**: Test files with >80% coverage
4. **Review**: Quality assessment report
5. **Docs**: Updated documentation

## Quality Checklist

- ✅ Feature plan created and reviewed
- ✅ All code TypeScript strict mode
- ✅ Error handling comprehensive
- ✅ Tests written and passing
- ✅ Code review approved
- ✅ Documentation updated
- ✅ Ready for deployment

## Success Criteria

- Complete, working feature
- >80% test coverage
- Zero TypeScript errors
- Code review approved
- Documentation complete
- Ready for production

---

**Command**: `/cook [feature] [requirements]`  
**Agents**: Planner → Implementer → Tester → Reviewer → DocsManager  
**Workflow Type**: Sequential  
**Estimated Time**: 1-2 hours per feature
