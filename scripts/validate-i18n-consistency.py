#!/usr/bin/env python3
"""
i18n翻译文件一致性验证脚本
用于确保所有语言的翻译文件具有相同的结构和键
"""

import json
import os
import sys
import re
from typing import Dict, Set, List, Any
from pathlib import Path

def load_languages_from_ts(verbose: bool = True) -> List[str]:
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
         
def get_all_keys(obj: Any, prefix: str = "") -> Set[str]:
    """递归获取JSON对象中的所有键路径"""
    keys = set()
    
    if isinstance(obj, dict):
        for key, value in obj.items():
            current_path = f"{prefix}.{key}" if prefix else key
            keys.add(current_path)
            keys.update(get_all_keys(value, current_path))
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            keys.update(get_all_keys(item, f"{prefix}[{i}]"))
    
    return keys

def load_translation_files() -> Dict[str, Dict]:
    """加载所有翻译文件"""
    languages = load_languages_from_ts()
    translations = {}
    
    for lang in languages:
        file_path = f"messages/{lang}.json"
        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            sys.exit(1)
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                translations[lang] = json.load(f)
            print(f"✅ Successfully loaded: {file_path}")
        except json.JSONDecodeError as e:
            print(f"❌ JSON format error in {file_path}: {e}")
            sys.exit(1)
        except Exception as e:
            print(f"❌ Failed to load {file_path}: {e}")
            sys.exit(1)
    
    return translations

def validate_structure_consistency(translations: Dict[str, Dict]) -> bool:
    """验证所有翻译文件的结构一致性"""
    print("\n🔍 Validating structure consistency...")
    
    # 获取所有语言的键集合
    all_keys = {}
    for lang, data in translations.items():
        all_keys[lang] = get_all_keys(data)
        print(f"  {lang}: {len(all_keys[lang])} keys")
    
    # 以中文为基准检查其他语言
    base_lang = 'zh-CN'
    base_keys = all_keys[base_lang]
    
    inconsistent = False
    
    for lang in all_keys:
        if lang == base_lang:
            continue
        
        current_keys = all_keys[lang]
        
        # 检查缺失的键
        missing_keys = base_keys - current_keys
        if missing_keys:
            print(f"❌ {lang} missing keys ({len(missing_keys)} keys):")
            for key in sorted(missing_keys):
                print(f"    - {key}")
            inconsistent = True
        
        # 检查多余的键
        extra_keys = current_keys - base_keys
        if extra_keys:
            print(f"❌ {lang} extra keys ({len(extra_keys)} keys):")
            for key in sorted(extra_keys):
                print(f"    + {key}")
            inconsistent = True
        
        if not missing_keys and not extra_keys:
            print(f"✅ {lang} structure is consistent")
    
    return not inconsistent

def validate_file_consistency() -> bool:
    """验证文件行数一致性"""
    print("\n📊 Validating file line consistency...")
    
    languages = load_languages_from_ts()
    line_counts = {}
    
    for lang in languages:
        file_path = f"messages/{lang}.json"
        with open(file_path, 'r', encoding='utf-8') as f:
            line_counts[lang] = len(f.readlines())
        print(f"  {lang}: {line_counts[lang]} lines")
    
    # 检查是否所有文件行数相同
    unique_counts = set(line_counts.values())
    if len(unique_counts) == 1:
        print("✅ All files have consistent line counts")
        return True
    else:
        print("❌ File line counts are inconsistent")
        return False

def validate_json_format(translations: Dict[str, Dict]) -> bool:
    """验证JSON格式正确性"""
    print("\n🔧 Validating JSON format...")
    
    for lang, data in translations.items():
        try:
            # 尝试重新序列化以验证格式
            json.dumps(data, ensure_ascii=False, indent=2)
            print(f"✅ {lang} JSON format is valid")
        except Exception as e:
            print(f"❌ {lang} JSON format error: {e}")
            return False
    
    return True

def main():
    """主函数"""
    print("🚀 Starting i18n translation file consistency validation...")
    
    # 检查是否在正确的目录
    if not os.path.exists("messages"):
        print("❌ Messages directory not found, please run this script from project root")
        sys.exit(1)
    
    # 加载翻译文件
    translations = load_translation_files()
    
    # 执行所有验证
    validations = [
        validate_file_consistency(),
        validate_json_format(translations),
        validate_structure_consistency(translations)
    ]
    
    # 输出结果
    print("\n" + "="*50)
    if all(validations):
        print("🎉 All validations passed! Translation file structures are fully consistent")
        return 0
    else:
        print("❌ Validation failed! Please fix the issues above")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 