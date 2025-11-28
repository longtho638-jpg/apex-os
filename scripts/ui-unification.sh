#!/bin/bash

# UI UNIFICATION BATCH SCRIPT
# Automates repetitive find/replace patterns across all pages

set -e

echo "🎯 Starting UI Unification Batch Updates..."

# Directories to process
DIRS=(
  "src/app/[locale]/dashboard"
  "src/app/[locale]/admin"
  "src/app/[locale]/trading"
  "src/app/[locale]"
)

# Exclude these files (public/auth pages)
EXCLUDES=("landing" "blog" "pricing" "login" "signup" "reset-password")

# Counter
count=0

# Process each directory
for dir in "${DIRS[@]}"; do
  echo "📁 Processing $dir..."
  
  # Find all page.tsx files
  find "$dir" -name "page.tsx" -type f | while read file; do
    # Check if file should be excluded
    skip=false
    for exclude in "${EXCLUDES[@]}"; do
      if [[ "$file" == *"$exclude"* ]]; then
        skip=true
        break
      fi
    done
    
    if [ "$skip" = true ]; then
      echo "  ⏭️  Skipping $file (public/auth page)"
      continue
    fi
    
    echo "  🔧 Transforming $file..."
    
    # RULE 1: Replace Card import with GlassCard
    sed -i '' "s|import { Card.*from '@/components/ui/card';|import { GlassCard } from '@/components/ui/glass-card';|g" "$file"
    
    # RULE 2: Background colors
    sed -i '' 's/bg-black"/bg-[#030303]"/g' "$file"
    sed -i '' 's/bg-gray-900"/bg-[#030303]"/g' "$file"
    sed -i '' 's/bg-zinc-900"/bg-[#030303]"/g' "$file"
    
    # For TabsList specifically
    sed -i '' 's/className="bg-gray-900/className="bg-white\/5/g' "$file"
    sed -i '' 's/border-gray-800"/border-white\/10"/g' "$file"
    
    # RULE 3: Text colors
    sed -i '' 's/text-gray-400/text-zinc-400/g' "$file"
    sed -i '' 's/text-gray-500/text-zinc-500/g' "$file"
    
    # RULE 4: Card component to GlassCard (in JSX)
    # Simple cases first
    sed -i '' 's/<Card className="bg-gray-900[^"]*"/<GlassCard className="/g' "$file"
    sed -i '' 's/<\/Card>/<\/GlassCard>/g' "$file"
    sed -i '' 's/<Card /<GlassCard /g' "$file"
    
    # RULE 5: Spacing normalization
    # This is complex,skip for now - manual review needed
    
    # RULE 6: Typography (headers)
    sed -i '' 's/text-3xl font-bold/text-2xl font-bold/g' "$file"
    sed -i '' 's/text-xl font-semibold/text-lg font-bold/g' "$file"
    sed -i '' 's/text-xl font-bold/text-lg font-bold/g' "$file"
    
    count=$((count + 1))
  done
done

echo ""
echo "✅ Batch transformation complete!"
echo "📊 Processed $count files"
echo ""
echo "⚠️  NEXT STEPS:"
echo "1. Review changed files: git diff"
echo "2. Fix any broken syntax (some manual fixes may be needed)"
echo "3. Test build: npm run build"
echo "4. Commit: git add . && git commit -m 'feat(ui): batch UI unification'"
echo ""
