const defaultConfig = {
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

module.exports = defaultConfig;