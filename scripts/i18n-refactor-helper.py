#!/usr/bin/env python3
"""
i18n一致性检查脚本
专注于检查翻译文件的结构一致性
"""

import json
import os
import sys
import re
from typing import Dict, Set, List, Any, Optional
from pathlib import Path

class I18nConsistencyChecker:
    def __init__(self):
        self.languages = self.load_languages_from_ts(verbose=True)
        if not self.languages:
            print("❌ Error: Could not load languages from config file. Aborting.", file=sys.stderr)
            sys.exit(1)
            
        self.messages_dir = Path("messages")
            

    def load_languages_from_ts(self, verbose: bool = True) -> List[str]:
        """从 lib/config/language-config.ts 加载支持的语言列表"""
        # 脚本位于 scripts/ 目录，TS 文件路径相对于项目根目录
        project_root = Path(__file__).resolve().parent.parent
        ts_file_path = project_root / "lib/config/language-config.ts"
    
        if not ts_file_path.exists():
            print(f"❌ Language config file not found at: {ts_file_path}", file=sys.stderr)
            return []

        try:
            content = ts_file_path.read_text(encoding="utf-8")

            # 查找 SUPPORTED_LANGUAGES 对象体（非贪婪匹配）
            match = re.search(
                r"export\s+const\s+SUPPORTED_LANGUAGES\s*=\s*{(.+?)}\s*as\s+const;",
                content,
                re.DOTALL,
            )
            if not match:
                print("❌ Could not find SUPPORTED_LANGUAGES in the config file.", file=sys.stderr)
                return []

            obj_content = match.group(1)

            # 匹配更通用的语言代码（支持 en, zh-Hans, es-419, sr-Latn-RS 等）
            lang_codes = re.findall(
                r"\s*['\"]([a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*)['\"]\s*:",
                obj_content,
            )

            if lang_codes:
                if verbose:
                    print(f"✅ Loaded {len(lang_codes)} languages: {', '.join(lang_codes)}")
            else:
                print("❌ No languages found in language-config.ts", file=sys.stderr)

            return lang_codes

        except Exception as e:
            print(f"❌ Error reading or parsing {ts_file_path}: {e}", file=sys.stderr)
            return []

    def get_all_keys(self, obj: Any, prefix: str = "") -> Set[str]:
        """递归获取所有键路径"""
        keys = set()
        if isinstance(obj, dict):
            for key, value in obj.items():
                current_path = f"{prefix}.{key}" if prefix else key
                keys.add(current_path)
                if isinstance(value, dict):
                    keys.update(self.get_all_keys(value, current_path))
        return keys
    
    def find_key_line_number(self, file_path: Path, key_path: str) -> Optional[int]:
        """查找键在文件中的行号"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            # 提取最后一级键名
            key_parts = key_path.split('.')
            target_key = key_parts[-1]
            
            # 搜索包含该键的行
            for i, line in enumerate(lines, 1):
                if f'"{target_key}":' in line:
                    return i
            
            return None
        except Exception:
            return None
    
    def load_translation_files(self) -> Optional[Dict[str, Dict]]:
        """加载所有翻译文件"""
        translations = {}
        
        for lang in self.languages:
            file_path = self.messages_dir / f"{lang}.json"
            
            if not file_path.exists():
                print(f"❌ Translation file not found: {file_path}")
                return None
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    translations[lang] = json.load(f)
            except json.JSONDecodeError as e:
                print(f"❌ Invalid JSON in {file_path}: {e}")
                return None
            except Exception as e:
                print(f"❌ Error loading {file_path}: {e}")
                return None
        
        return translations

    def detect_missing_keys(self) -> Optional[Dict[str, List[Dict[str, Any]]]]:
        """检测缺失的键，返回详细信息包括行号"""
        print("🔍 Detecting missing keys...")
        
        translations = self.load_translation_files()
        if not translations:
            return None
        
        # 获取所有键
        all_keys = {}
        for lang, data in translations.items():
            all_keys[lang] = self.get_all_keys(data)
        
        # 以中文为基准检查其他语言
        base_lang = 'zh-CN'
        base_keys = all_keys[base_lang]
        base_file = self.messages_dir / f"{base_lang}.json"
        
        missing_info = {}
        has_missing = False
        
        for lang in all_keys:
            if lang == base_lang:
                continue
            
            current_keys = all_keys[lang]
            missing_keys = base_keys - current_keys
            extra_keys = current_keys - base_keys
            
            if missing_keys:
                has_missing = True
                missing_info[lang] = []
                
                print(f"\n❌ {lang} missing {len(missing_keys)} keys:")
                
                for key in sorted(missing_keys):
                    # 获取行号
                    line_num = self.find_key_line_number(base_file, key)
                    
                    print(f"    📍 {key} (line ~{line_num if line_num else 'unknown'})")
            
            if extra_keys:
                has_missing = True
                print(f"\n❌ {lang} has {len(extra_keys)} extra keys:")
                for key in sorted(extra_keys):
                    print(f"    ➕ {key}")
            
            if not missing_keys and not extra_keys:
                print(f"✅ {lang} has consistent keys")
        
        return missing_info if has_missing else None

    def validate_consistency(self, silent: bool = False) -> bool:
        """验证翻译文件一致性"""
        if not silent:
            print("🔍 Validating translation file consistency...")
        
        translations = self.load_translation_files()
        if not translations:
            return False
        
        # 验证行数一致性
        line_counts = {}
        for lang in self.languages:
            file_path = self.messages_dir / f"{lang}.json"
            with open(file_path, 'r', encoding='utf-8') as f:
                line_counts[lang] = len(f.readlines())
        
        if not silent:
            print("📊 File line counts:")
            for lang, count in line_counts.items():
                print(f"  {lang}: {count} lines")
        
        unique_counts = set(line_counts.values())
        if len(unique_counts) != 1:
            print("❌ File line counts are inconsistent")
            return False
        
        # 验证结构一致性
        all_keys = {}
        for lang, data in translations.items():
            all_keys[lang] = self.get_all_keys(data)
        
        if not silent:
            print("🔧 Structure key counts:")
            for lang, keys in all_keys.items():
                print(f"  {lang}: {len(keys)} keys")
        
        # 以中文为基准检查其他语言
        base_lang = 'zh-CN'
        base_keys = all_keys[base_lang]
        
        inconsistent = False
        for lang in all_keys:
            if lang == base_lang:
                continue
            
            current_keys = all_keys[lang]
            missing_keys = base_keys - current_keys
            extra_keys = current_keys - base_keys
            
            if missing_keys or extra_keys:
                if not silent:
                    print(f"❌ {lang} structure is inconsistent:")
                    if missing_keys:
                        print(f"    Missing {len(missing_keys)} keys")
                    if extra_keys:
                        print(f"    Extra {len(extra_keys)} keys")
                inconsistent = True
            elif not silent:
                print(f"✅ {lang} structure is consistent")
        
        return not inconsistent

    def quick_check(self) -> bool:
        """快速检查（静默模式）"""
        return self.validate_consistency(silent=True)

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("Usage: python3 i18n-refactor-helper.py <command>")
        print("Commands:")
        print("  detect-missing    - detect missing keys")
        print("  validate          - validate consistency")
        print("  quick-check       - quick check")
        return 1
    
    command = sys.argv[1]
    checker = I18nConsistencyChecker()
    
    try:
        if command == "detect-missing":
            missing = checker.detect_missing_keys()
            return 1 if missing else 0
        
        elif command == "validate":
            success = checker.validate_consistency()
            return 0 if success else 1
        
        elif command == "quick-check":
            success = checker.quick_check()
            if success:
                print("✅ Quick check passed")
            else:
                print("❌ Quick check failed")
            return 0 if success else 1
        
        else:
            print(f"❌ Unknown command: {command}")
            return 1
    
    except KeyboardInterrupt:
        print("\n⚠️  Operation cancelled by user")
        return 1
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 