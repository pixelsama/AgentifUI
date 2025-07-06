# 字体配置指南

AgentifUI 采用现代化的中英文字体组合，提供优雅的阅读体验。

## 字体组合

| 用途     | 字体                            | Tailwind 类    | 说明                     |
| -------- | ------------------------------- | -------------- | ------------------------ |
| 界面文字 | Inter + Noto Sans SC            | `font-sans`    | 现代简洁，适用于界面元素 |
| 阅读内容 | Crimson Pro + Noto Serif SC     | `font-serif`   | 优雅易读，适用于长文本   |
| 装饰标题 | Playfair Display + Noto Sans SC | `font-display` | 装饰性强，适用于重要标题 |

## 使用方法

### 基础用法

```tsx
// 默认界面字体
<div className="font-sans">Interface Text 界面文字</div>

// 阅读字体
<div className="font-serif">Reading content 阅读内容</div>

// 装饰标题字体
<h1 className="font-display">Display Title 装饰标题</h1>
```

### 响应式字体大小

```tsx
// 响应式标题
<h1 className="font-display text-2xl md:text-3xl lg:text-4xl">
  响应式标题
</h1>

// 响应式正文
<p className="font-serif text-base md:text-lg">
  响应式正文内容
</p>
```

## 字重变化

支持的字重：`font-light`、`font-normal`、`font-medium`、`font-semibold`、`font-bold`

```tsx
<p className="font-sans font-medium">中等字重文字</p>
<p className="font-serif font-bold">粗体衬线字体</p>
```

## 字体特点

- **Inter + Noto Sans SC**: 现代无衬线字体，清晰易读
- **Crimson Pro + Noto Serif SC**: 优雅衬线字体，舒适阅读体验
- **Playfair Display**: 装饰性衬线字体，适合标题

所有字体均通过 Google Fonts 加载，支持中英文混排显示。
