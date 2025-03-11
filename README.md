# watch-class-compiler

一个强大的文件监听和 CSS 类编译工具。基于自定义规则，支持实时文件监控、批量处理、缓存机制、错误重试以及灵活的配置选项。

这个描述简洁地概括了工具的主要功能和特点：

1. 核心功能：文件监听和 CSS 类编译
2. 主要特性：自定义规则
3. 技术优势：实时监控、批量处理、缓存机制
4. 可靠性：错误重试
5. 扩展性：灵活配置

## Installation

Install the package via npm:

```bash
npm install watch-class-compiler
```

For TypeScript configuration support, ensure you have `ts-node` installed:

```bash
npm install --save-dev ts-node typescript
```

## Usage

Run the compiler directly in your project using the provided CLI command:

```bash
npx watch-class
```

Or add it to your `package.json` scripts for convenience:

```json
{
  "scripts": {
    "watch": "watch-class"
  }
}
```

Then execute:

```bash
npm run watch
```

The tool will watch files specified in the configuration, compile classes, and output the generated CSS to the designated directory.

## Configuration

Create a `watchClass.config.js` or `watchClass.config.ts` file in your project root to customize the behavior. The configuration will override the default settings.

### Example `watchClass.config.js`

```javascript
module.exports = {
  // 默认单位
  unit: 'px',
  // 监听的文件目录和类型
  watchDirs: ['./src/**/*.{wxml,js,vue,jsx,tsx,html}'],
  // 输出目录
  outputDir: './dist/css',
  // 输出文件名
  outputFileName: 'generated.css',
  // 批处理基础延迟时间(毫秒)
  batchBaseDelay: 500,
  // 每个文件的批处理延迟增量(毫秒)
  batchDelayPerFile: 50,
  // 最大批处理延迟时间(毫秒)
  maxBatchDelay: 2000,
  // 最大重试次数
  maxRetries: 3,
  // 重试延迟时间(毫秒)
  retryDelay: 1000,
  minify: true,// 是否压缩 CSS 文件
  // CSS 规则配置
  rules: {
    // 外边距相关
    'm': { property: 'margin' },
    'mx': { property: ['margin-left', 'margin-right'] },
    'my': { property: ['margin-top', 'margin-bottom'] },
    'mt': { property: 'margin-top' },
    'mr': { property: 'margin-right' },
    'mb': { property: 'margin-bottom' },
    'ml': { property: 'margin-left' },
    
    // 内边距相关
    'p': { property: 'padding' },
    'px': { property: ['padding-left', 'padding-right'] },
    'py': { property: ['padding-top', 'padding-bottom'] },
    'pt': { property: 'padding-top' },
    'pr': { property: 'padding-right' },
    'pb': { property: 'padding-bottom' },
    'pl': { property: 'padding-left' },
    
    // 尺寸相关
    'w': { property: 'width' },
    'h': { property: 'height' },
    'min-w': { property: 'min-width' },
    'min-h': { property: 'min-height' },
    'max-w': { property: 'max-width' },
    'max-h': { property: 'max-height' },
    
    // 定位相关
    'top': { property: 'top' },
    'right': { property: 'right' },
    'bottom': { property: 'bottom' },
    'left': { property: 'left' },
    'z': { property: 'z-index', unit: '' },
    
    // 字体相关
    'fs': { property: 'font-size' },
    'leading': { property: 'line-height' },
    'tracking': { property: 'letter-spacing' },
    'font': { property: 'font-weight', unit: '' },
    
    // 颜色相关
    'bg': { property: 'background-color', isColor: true },
    'text': { property: 'color', isColor: true },
    'border': { property: 'border-color', isColor: true },
    
    // 边框相关
    'border': { property: 'border-width' },
    'border-t': { property: 'border-top-width' },
    'border-r': { property: 'border-right-width' },
    'border-b': { property: 'border-bottom-width' },
    'border-l': { property: 'border-left-width' },
    
    // 圆角相关
    'rounded': { property: 'border-radius' },
    'rounded-t': { property: ['border-top-left-radius', 'border-top-right-radius'] },
    'rounded-r': { property: ['border-top-right-radius', 'border-bottom-right-radius'] },
    'rounded-b': { property: ['border-bottom-left-radius', 'border-bottom-right-radius'] },
    'rounded-l': { property: ['border-top-left-radius', 'border-bottom-left-radius'] },
    
    // 布局相关
    'd': { property: 'display' },
    'justify': { property: 'justify-content' },
    'items': { property: 'align-items' },
    'gap': { property: 'gap' },
    'gap-x': { property: ['column-gap', 'gap'] },
    'gap-y': { property: ['row-gap', 'gap'] },
    'flex-col': { property: 'flex-direction', value: 'column' },
    'flex-row': { property: 'flex-direction', value: 'row' },
    'absolute': { property: 'position', value: 'absolute' },
    'relative': { property: 'position', value: 'relative' },
    
    // 阴影效果
    'shadow': { 
      property: 'box-shadow',
      valueMap: {
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'md': '0 4px 6px rgba(0,0,0,0.1)',
        'lg': '0 10px 15px rgba(0,0,0,0.1)',
        'xl': '0 20px 25px rgba(0,0,0,0.15)',
        'none': 'none'
      }
    },
    
    // 其他样式
    'opacity': { property: 'opacity', unit: '', valueMap: { '50': '0.5', '75': '0.75' } },
    'overflow': { property: 'overflow' },
    'cursor': { property: 'cursor' },
    'transition': { property: 'transition', value: 'all 0.3s ease' }
  },
  
  // 通用值映射
  valueMap: {
    'auto': 'auto',
    'full': '100%',
    '0': '0',
    'transparent': 'transparent'
  },
  // 已存在的 CSS 文件路径数组
  existingCssFiles: [],
  // 是否忽略已存在的类名
  ignoreExistingClasses: true, 
};
```

### Example `watchClass.config.ts` (TypeScript)

```typescript
export default {
  watchDirs: ['./src/**/*.{vue,js,jsx,tsx}'],
  outputDir: './assets/css',
  unit: 'rem',
  rules: {
    'text-size': { property: 'font-size' }, // For font-size
    'text': { property: 'color', isColor: true }, // For color
    'custom-gap': { property: 'gap' }
  },
  valueMap: {
    'primary': '#007bff',
    'large': '2rem'
  }
};
```

### Default Configuration

```javascript
{
  unit: 'px', // Default unit for numeric values
  watchDirs: ['./src/**/*.{wxml,js,vue,jsx,tsx,html}'], // Files to watch
  outputDir: './dist/css', // Output directory for generated CSS
  outputFileName: 'generated.css', // Output CSS file name
  batchBaseDelay: 500, // Base delay for batch processing (ms)
  batchDelayPerFile: 50, // Additional delay per file (ms)
  maxBatchDelay: 2000, // Maximum batch delay (ms)
  maxRetries: 3, // Max retries for failed batch processing
  retryDelay: 1000, // Delay between retries (ms)
  rules: {
    'm': { property: 'margin' },
    'mx': { property: ['margin-left', 'margin-right'] },
    'my': { property: ['margin-top', 'margin-bottom'] },
    'mt': { property: 'margin-top' },
    'mr': { property: 'margin-right' },
    'mb': { property: 'margin-bottom' },
    'ml': { property: 'margin-left' },
    'p': { property: 'padding' },
    'px': { property: ['padding-left', 'padding-right'] },
    'py': { property: ['padding-top', 'padding-bottom'] },
    'pt': { property: 'padding-top' },
    'pr': { property: 'padding-right' },
    'pb': { property: 'padding-bottom' },
    'pl': { property: 'padding-left' },
    'w': { property: 'width' },
    'h': { property: 'height' },
    'min-w': { property: 'min-width' },
    'min-h': { property: 'min-height' },
    'max-w': { property: 'max-width' },
    'max-h': { property: 'max-height' },
    'top': { property: 'top' },
    'right': { property: 'right' },
    'bottom': { property: 'bottom' },
    'left': { property: 'left' },
    'z': { property: 'z-index', unit: '' },
    'text-size': { property: 'font-size' }, // For font-size (e.g., text-size-16)
    'leading': { property: 'line-height' },
    'tracking': { property: 'letter-spacing' },
    'font': { property: 'font-weight', unit: '' },
    'text': { property: 'color', isColor: true }, // For color (e.g., text-red)
    'bg': { property: 'background-color', isColor: true },
    'border': { property: 'border-color', isColor: true },
    'border': { property: 'border-width' },
    'border-t': { property: 'border-top-width' },
    'border-r': { property: 'border-right-width' },
    'border-b': { property: 'border-bottom-width' },
    'border-l': { property: 'border-left-width' },
    'rounded': { property: 'border-radius' },
    'rounded-t': { property: ['border-top-left-radius', 'border-top-right-radius'] },
    'rounded-r': { property: ['border-top-right-radius', 'border-bottom-right-radius'] },
    'rounded-b': { property: ['border-bottom-left-radius', 'border-bottom-right-radius'] },
    'rounded-l': { property: ['border-top-left-radius', 'border-bottom-left-radius'] },
    'flex': { property: 'display', value: 'flex' },
    'justify': { property: 'justify-content' },
    'items': { property: 'align-items' },
    'gap': { property: 'gap' },
    'shadow': { 
      property: 'box-shadow',
      valueMap: {
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'md': '0 4px 6px rgba(0,0,0,0.1)',
        'lg': '0 10px 15px rgba(0,0,0,0.1)',
        'xl': '0 20px 25px rgba(0,0,0,0.15)',
        'none': 'none'
      }
    },
    'opacity': { property: 'opacity', unit: '', valueMap: { '50': '0.5', '75': '0.75' } },
    'overflow': { property: 'overflow' },
    'cursor': { property: 'cursor' },
    'transition': { property: 'transition', value: 'all 0.3s ease' }
  },
  valueMap: {
    'auto': 'auto',
    'full': '100%',
    '0': '0',
    '50': '50%',
    'red': 'red',
    'blue': '#0000ff',
    'gray-500': '#6b7280',
    'transparent': 'transparent'
  }
}
```

## Example

### Source File (`src/index.vue`)

```vue
<template>
  <div class="ml-10 text-size-16 text-red bg-primary rounded-4">
    Hello World
  </div>
</template>
```

### Generated CSS (`assets/css/generated.css`)

```css
.ml-10 {
  margin-left: 10rem;
}

.text-size-16 {
  font-size: 16rem;
}

.text-red {
  color: red;
}

.bg-primary {
  background-color: #007bff;
}

.rounded-4 {
  border-radius: 4rem;
}
```

## Features

- **Real-time File Watching**: Monitors files and compiles classes on save.
- **Custom Rules**: Define your own class prefixes and properties.
- **Batch Processing**: Optimizes performance for multiple file changes.
- **Caching**: Reuses compiled CSS rules to reduce overhead.
- **Error Retries**: Automatically retries failed operations up to a configurable limit.
- **Dynamic Delay**: Adjusts batch processing delay based on file count.
- **Logging**: Outputs detailed logs to both console and a `compiler.log` file in the output directory.
- **TypeScript Support**: Use `.ts` config files with `ts-node`.

## Notes

- **Font Size vs. Color**: Use `text-size` for `font-size` (e.g., `text-size-16`) and `text` for `color` (e.g., `text-red`) to avoid conflicts.
- **Paths**: All paths in the config (e.g., `watchDirs`, `outputDir`) are relative to the project root.
- **Dependencies**: Requires `chokidar` for file watching and optionally `ts-node` for TypeScript configs.

## Contributing

Feel free to submit issues or pull requests on the [GitHub repository](https://github.com/your-repo/watch-class-compiler).

## License

MIT
```

---

### 说明
- **安装**：提供了安装命令和 TypeScript 支持的说明。
- **使用方法**：展示了如何通过 `npx` 或 `npm scripts` 运行。
- **配置**：包含 JS 和 TS 配置示例，详细列出默认配置。
- **示例**：展示了一个简单的输入和输出案例。
- **功能**：列出了主要特点，突出工具的优势。
- **注意事项**：特别说明了 `text-size` 和 `text` 的用法，避免用户混淆。
