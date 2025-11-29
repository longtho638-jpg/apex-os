# CLI CLEANUP MASTER (TỔNG VỆ SINH)

## Strategic Context: 清道夫 (The Sweeper)

**Sun Tzu Principle**: "After the battle, clear the field to prepare for the next campaign."

**Application**: A cluttered root directory confuses developers and agents. We must archive historical context and organize strategic documents to maintain high velocity.

**Objective**: Clean Project Root & Standardize Codebase.
**Timeline**: Immediate (10-15 mins CLI execution)

---

## TASK 1: ARCHIVE ARTIFACTS

### 1.1 Create Archive Directory
```bash
mkdir -p docs/archive/cli_history
```

### 1.2 Move Files
**Target**: All `CLI_*.txt`, `CLI_*.md`, `GEMINI_*.md`, `GEMINI_*.txt`.
**Destination**: `docs/archive/cli_history/`

*Exception*: Keep `CLI_CLEANUP_MASTER.md` (this file) until finished.

---

## TASK 2: ORGANIZE STRATEGY

### 2.1 Create Strategy Directory
```bash
mkdir -p docs/strategy
```

### 2.2 Move Files
**Target**: `*_STRATEGY.md`, `*_PLAN.md`, `PROPOSAL_*.md`, `*_LOGIC.md`.
**Destination**: `docs/strategy/`

---

## TASK 3: REMOVE TRASH

### 3.1 Delete Temp Files
**Targets**:
- `*.backup`
- `*.tmp`
- `.DS_Store`
- `npm-debug.log`

---

## TASK 4: CODE QUALITY

### 4.1 Lint & Format
```bash
npm run lint -- --fix
# If prettier is installed:
# npx prettier --write .
```

### 4.2 Final Verification
```bash
ls -la
npm run build
```

---

## DELIVERABLES

1. ✅ **Clean Root**: Only config files and main folders remain.
2. ✅ **Organized Docs**: History preserved in `docs/archive`.
3. ✅ **Polished Code**: Linted and formatted.

---

## EXECUTION COMMAND

```bash
Execute CLEANUP MASTER

Implement:
1. Archive CLI/Gemini files
2. Move Strategy files
3. Delete Trash
4. Run Lint Fix
```
