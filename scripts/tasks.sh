#!/bin/bash

# Task Manager for ApexOS (Git-based)
# Usage:
#   ./scripts/tasks.sh list
#   ./scripts/tasks.sh add "Task description"
#   ./scripts/tasks.sh done <line_number>
#   ./scripts/tasks.sh today

TASK_FILE="task.md"

if [ ! -f "$TASK_FILE" ]; then
    echo "# Tasks" > "$TASK_FILE"
fi

case "$1" in
    list)
        echo "📋 Current Tasks:"
        grep -n "\[ \]" "$TASK_FILE"
        ;;
    add)
        if [ -z "$2" ]; then
            echo "Usage: ./scripts/tasks.sh add 'Task description'"
            exit 1
        fi
        echo "- [ ] $2" >> "$TASK_FILE"
        echo "✅ Task added: $2"
        ;;
    done)
        if [ -z "$2" ]; then
            echo "Usage: ./scripts/tasks.sh done <line_number>"
            exit 1
        fi
        # Simple sed to replace [ ] with [x] on specific line (approximated)
        # For robustness, we'd use a more complex logic, but for MVP:
        sed -i '' "${2}s/\[ \]/\[x\]/" "$TASK_FILE"
        echo "✅ Task $2 marked as done!"
        ;;
    today)
        echo "📅 Today's Focus:"
        grep "\[ \]" "$TASK_FILE" | head -n 5
        ;;
    *)
        echo "Usage: ./scripts/tasks.sh {list|add|done|today}"
        exit 1
        ;;
esac