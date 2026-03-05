import os
import re
from collections import defaultdict

def get_imports(file_path):
    imports = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Tìm các import
            # import ... from '...'
            # import { ... } from '...'
            # export ... from '...'
            matches = re.findall(r"""(?:import|export)\s+(?:[\w\s{},*]+from\s+)?['"]([^'"]+)['"]""", content)
            for match in matches:
                if match.startswith('.'):
                    imports.append(match)
                elif match.startswith('@/'):
                     imports.append(match)
    except Exception as e:
        pass
    return imports

def resolve_path(current_file, import_path, root_dir):
    if import_path.startswith('@/'):
        # Đường dẫn tuyệt đối từ root src
        path_parts = import_path[2:].split('/')
        potential_path = os.path.join(root_dir, *path_parts)
    else:
        # Đường dẫn tương đối
        current_dir = os.path.dirname(current_file)
        potential_path = os.path.join(current_dir, import_path)
    
    # Chuẩn hóa đường dẫn
    potential_path = os.path.normpath(potential_path)

    # Thử các phần mở rộng
    extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx']
    
    # Nếu import là thư mục, thử index
    if os.path.isdir(potential_path):
         for ext in ['/index.ts', '/index.tsx', '/index.js', '/index.jsx']:
            if os.path.exists(potential_path + ext):
                return potential_path + ext
    
    # Nếu import là file
    if os.path.isfile(potential_path):
         return potential_path

    for ext in extensions:
        if os.path.exists(potential_path + ext):
            return potential_path + ext
            
    return None

def find_cycles(start_node, graph, visited, recursion_stack, cycles):
    visited.add(start_node)
    recursion_stack.add(start_node)

    for neighbor in graph[start_node]:
        if neighbor not in visited:
            find_cycles(neighbor, graph, visited, recursion_stack, cycles)
        elif neighbor in recursion_stack:
            cycles.append((start_node, neighbor))

    recursion_stack.remove(start_node)

def main():
    root_dir = '/Users/macbookprom1/mekong-cli/apps/apex-os/src'
    graph = defaultdict(list)
    files = []

    print(f"Scanning {root_dir}...")

    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith(('.ts', '.tsx', '.js', '.jsx')):
                file_path = os.path.join(dirpath, filename)
                files.append(file_path)

    print(f"Found {len(files)} files. Building dependency graph...")

    for file_path in files:
        imports = get_imports(file_path)
        for imp in imports:
            resolved = resolve_path(file_path, imp, root_dir)
            if resolved and resolved in files: # Chỉ quan tâm đến file trong src
                graph[file_path].append(resolved)

    print("Detecting cycles...")
    visited = set()
    recursion_stack = set()
    cycles = []

    for node in list(graph.keys()):
        if node not in visited:
            find_cycles(node, graph, visited, recursion_stack, cycles)

    if cycles:
        print(f"Found {len(cycles)} potential circular dependencies:")
        unique_cycles = set()
        for u, v in cycles:
            # Đơn giản hóa output
            rel_u = os.path.relpath(u, root_dir)
            rel_v = os.path.relpath(v, root_dir)
            if (rel_u, rel_v) not in unique_cycles and (rel_v, rel_u) not in unique_cycles:
                 unique_cycles.add((rel_u, rel_v))
                 print(f"{rel_u} <-> {rel_v}")
    else:
        print("No circular dependencies found.")

if __name__ == '__main__':
    main()
