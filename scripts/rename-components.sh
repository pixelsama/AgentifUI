#!/bin/bash

# 脚本用于将React组件文件从PascalCase重命名为kebab-case

# 函数：将PascalCase转换为kebab-case
pascal_to_kebab() {
  echo "$1" | sed -E 's/([a-z0-9])([A-Z])/\1-\2/g' | tr '[:upper:]' '[:lower:]'
}

# 查找所有的.tsx文件
find components -type f -name "*.tsx" | while read -r file; do
  dir=$(dirname "$file")
  filename=$(basename "$file")
  filename_no_ext="${filename%.tsx}"
  
  # 转换文件名
  kebab_filename=$(pascal_to_kebab "$filename_no_ext").tsx
  
  # 如果文件名不同，则执行重命名
  if [ "$filename" != "$kebab_filename" ]; then
    echo "重命名: $file -> $dir/$kebab_filename"
    git mv "$file" "$dir/$kebab_filename"
  fi
done

echo "组件文件重命名完成。请检查文件内引用并更新代码。" 