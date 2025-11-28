#!/bin/bash

# Quick script to assign task to Gemini CLI
# Usage: ./assign-to-gemini.sh

echo "🎯 ASSIGNING TASK TO GEMINI..."
echo "================================"
echo ""
echo "📋 Task: Viral Economics Verification"
echo "📄 Details: GEMINI_TASK.md"
echo "⏰ Duration: ~15-30 minutes"
echo ""
echo "================================"
echo ""
echo "🚀 COPY THIS COMMAND AND PASTE INTO GEMINI TERMINAL:"
echo ""
echo "────────────────────────────────────────────────────"
cat .gemini-prompt.txt
echo ""
echo "────────────────────────────────────────────────────"
echo ""
echo "OR use file reference:"
echo ""
echo "@GEMINI_TASK.md"
echo ""
echo "================================"
echo "📊 Expected output: VERIFICATION_REPORT_2025-11-27.md"
echo "================================"
