# watch-class-compiler

A powerful tool to watch files and dynamically compile CSS classes based on custom rules. It supports real-time file monitoring, batch processing, caching, error retries, and flexible configuration.

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
  watchDirs: ['./src/**/*.{vue,js,jsx,tsx}'],
  outputDir: './assets/css',
  unit: 'rem',
  rules: {
    'text-size': { property: 'font-size' }, // For font-size (e.g., text-size-16)
    'text': { property: 'color', isColor: true }, // For color (e.g., text-primary)
    'custom-gap': { property: 'gap' }
  },
  valueMap: {
    'primary': '#007bff',
    'large': '2rem'
  }
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
