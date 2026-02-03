import os
import re

TARGET_DIR = 'src'
LOGGER_FILE = 'src/lib/logger.ts'
LOGGER_IMPORT = "import { logger } from '@/lib/logger';"

def process_file(file_path):
    if file_path == LOGGER_FILE:
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # check for console usage
    if not re.search(r'console\.(log|info|warn|error|debug)', content):
        return

    # Replacements
    new_content = re.sub(r'console\.log\(', 'logger.info(', content)
    new_content = re.sub(r'console\.info\(', 'logger.info(', new_content)
    new_content = re.sub(r'console\.warn\(', 'logger.warn(', new_content)
    new_content = re.sub(r'console\.error\(', 'logger.error(', new_content)
    new_content = re.sub(r'console\.debug\(', 'logger.debug(', new_content)

    # Check if logger is already imported
    if "import { logger } from '@/lib/logger'" not in new_content and 'import { logger } from "@/lib/logger"' not in new_content:
        # Insert import
        lines = new_content.splitlines()
        insert_idx = 0

        # Check for directives like 'use client'
        if lines and (lines[0].strip().startswith("'use") or lines[0].strip().startswith('"use')):
            insert_idx = 1
            # Skip empty lines after directive
            while insert_idx < len(lines) and not lines[insert_idx].strip():
                insert_idx += 1

        lines.insert(insert_idx, LOGGER_IMPORT)
        new_content = '\n'.join(lines) + '\n' # Ensure trailing newline if it was lost or just to be safe

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Processed {file_path}")

def main():
    for root, dirs, files in os.walk(TARGET_DIR):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                file_path = os.path.join(root, file)
                process_file(file_path)

if __name__ == '__main__':
    main()
