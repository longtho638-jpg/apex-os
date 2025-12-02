#!/bin/bash

# ApexOS Agent Startup Check
# Ensures the Full Agent (Claude Kit) is active before system start.

echo -e "\n\033[1;36m🤖 APEX-OS INTELLIGENT AGENT SYSTEM \033[0m"
echo "==============================================="

# 1. Check ClaudeKit CLI
if command -v ck &> /dev/null; then
    echo -e "✓ CLI: \033[32mDetected\033[0m"
    
    # 2. Run Diagnostics (Fast Mode)
    echo -n "↻ Reading Agent Status... "
    if ck doctor > /dev/null 2>&1; then
        echo -e "\033[32mACTIVE\033[0m"
        
        # 3. Count Capabilities
        AGENT_COUNT=$(find .claude/agents -name "*.md" | wc -l | xargs)
        SKILL_COUNT=$(find .claude/skills -maxdepth 1 -type d | wc -l | xargs)
        echo -e "   ├─ Agents: \033[1m${AGENT_COUNT}\033[0m Ready"
        echo -e "   └─ Skills: \033[1m${SKILL_COUNT}\033[0m Loaded"
        
        echo -e "\n\033[1;32m✅ FULL AGENT INITIALIZED\033[0m"
    else
        echo -e "\033[31mERROR\033[0m"
        echo "⚠️  Agent configuration found but failed diagnostics."
        echo "   Run 'ck doctor' to fix."
    fi
else
    echo -e "⚠️  \033[33mClaudeKit CLI not found.\033[0m"
    echo "   Agent capabilities will be limited."
fi

echo "==============================================="
echo -e "🚀 Starting System...\n"
