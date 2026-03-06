import os
from pathlib import Path
from collections import defaultdict
import sys

def print_file_contents_and_stats(root_dir='.'):
    """
    Recursively print all file contents (except .pyc files) and generate statistics.
    
    Args:
        root_dir: Root directory to start scanning from
    """
    # Statistics tracking
    file_stats = defaultdict(lambda: {'count': 0, 'lines': 0, 'files': []})
    total_files = 0
    total_lines = 0
    
    # Convert to absolute path for better handling
    root_path = Path(root_dir).resolve()
    
    print("=" * 80)
    print(f"SCANNING DIRECTORY: {root_path}")
    print("=" * 80)
    print()
    
    # Walk through all directories
    for root, dirs, files in os.walk(root_path):
        # Skip __pycache__ directories
        if '__pycache__' in dirs:
            dirs.remove('__pycache__')
        
        if '.git' in dirs:
            dirs.remove(".git")
        
        for file in files:
            file_path = Path(root) / file
            
            # Skip .pyc files
            if file.endswith('.pyc'):
                continue
            
            # Get file extension
            extension = file_path.suffix.lower()
            if not extension:  # Files without extension
                extension = '(no extension)'
            
            try:
                # Read file contents
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    lines = content.count('\n') + (1 if content and not content.endswith('\n') else 0)
                    
                    # Update statistics
                    file_stats[extension]['count'] += 1
                    file_stats[extension]['lines'] += lines
                    file_stats[extension]['files'].append(str(file_path.relative_to(root_path)))
                    total_files += 1
                    total_lines += lines
                    
                    # Print file header
                    print("-" * 60)
                    print(f"FILE: {file_path.relative_to(root_path)}")
                    print(f"TYPE: {extension if extension != '(no extension)' else 'No extension'}")
                    print(f"LINES: {lines}")
                    print("-" * 60)
                    print()
                    
                    # Print file contents
                    print(content)
                    print()
                    
            except UnicodeDecodeError:
                # Skip binary files
                print(f"⚠️  Skipping binary file: {file_path.relative_to(root_path)}")
                file_stats['(binary)']['count'] += 1
                file_stats['(binary)']['files'].append(str(file_path.relative_to(root_path)))
                continue
            except Exception as e:
                print(f"❌ Error reading {file_path.relative_to(root_path)}: {e}")
                continue
    
    # Print statistics
    print("\n" + "=" * 80)
    print("STATISTICS")
    print("=" * 80)
    print(f"\nTotal files processed: {total_files}")
    print(f"Total lines of code: {total_lines}")
    print("\nBreakdown by file type:")
    print("-" * 40)
    
    # Sort by total lines (descending)
    sorted_stats = sorted(file_stats.items(), key=lambda x: x[1]['lines'], reverse=True)
    
    for extension, stats in sorted_stats:
        if stats['count'] > 0:
            percentage = (stats['lines'] / total_lines * 100) if total_lines > 0 else 0
            print(f"\n{extension.upper()}:")
            print(f"  Files: {stats['count']}")
            print(f"  Lines: {stats['lines']} ({percentage:.1f}%)")
            if stats['files']:
                print(f"  Files list:")
                for file in sorted(stats['files']):
                    print(f"    - {file}")

if __name__ == "__main__":
    # You can specify a different root directory as a command-line argument
    root_dir = sys.argv[1] if len(sys.argv) > 1 else '.'
    print_file_contents_and_stats(root_dir)