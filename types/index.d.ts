type CSSProperties = {
  margin?: string;
  'margin-left'?: string;
  'margin-right'?: string;
  'margin-top'?: string;
  'margin-bottom'?: string;
  padding?: string;
  'padding-left'?: string;
  'padding-right'?: string;
  'padding-top'?: string;
  'padding-bottom'?: string;
  width?: string;
  height?: string;
  'min-width'?: string;
  'min-height'?: string;
  'max-width'?: string;
  'max-height'?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  'z-index'?: string;
  'font-size'?: string;
  'line-height'?: string;
  'letter-spacing'?: string;
  'font-weight'?: string;
  'background-color'?: string;
  color?: string;
  'border-color'?: string;
  'border-width'?: string;
  'border-radius'?: string;
  display?: string;
  'justify-content'?: string;
  'align-items'?: string;
  gap?: string;
  'flex-direction'?: string;
  position?: string;
  'box-shadow'?: string;
  opacity?: string;
  overflow?: string;
  cursor?: string;
  transition?: string;
};

type UtilityClasses = {
  // Margin
  'm'?: string;
  'mx'?: string;
  'my'?: string;
  'mt'?: string;
  'mr'?: string;
  'mb'?: string;
  'ml'?: string;
  
  // Padding
  'p'?: string;
  'px'?: string;
  'py'?: string;
  'pt'?: string;
  'pr'?: string;
  'pb'?: string;
  'pl'?: string;
  
  // Dimensions
  'w'?: string;
  'h'?: string;
  'min-w'?: string;
  'min-h'?: string;
  'max-w'?: string;
  'max-h'?: string;
  
  // Position
  'top'?: string;
  'right'?: string;
  'bottom'?: string;
  'left'?: string;
  'z'?: string;
  
  // Typography
  'fs'?: string;
  'leading'?: string;
  'tracking'?: string;
  'font'?: string;
  
  // Colors
  'bg'?: string;
  'text'?: string;
  'border'?: string;
  
  // Border
  'border-t'?: string;
  'border-r'?: string;
  'border-b'?: string;
  'border-l'?: string;
  'rounded'?: string;
  'rounded-t'?: string;
  'rounded-r'?: string;
  'rounded-b'?: string;
  'rounded-l'?: string;
  
  // Layout
  'd'?: 'flex' | 'block' | 'inline' | 'inline-block' | 'none';
  'justify'?: 'start' | 'end' | 'center' | 'between' | 'around';
  'items'?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  'gap'?: string;
  'gap-x'?: string;
  'gap-y'?: string;
  'flex-col'?: boolean;
  'flex-row'?: boolean;
  'absolute'?: boolean;
  'relative'?: boolean;
  
  // Effects
  'shadow'?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  'opacity'?: '50' | '75';
  'overflow'?: 'hidden' | 'auto' | 'scroll' | 'visible';
  'cursor'?: 'pointer' | 'default' | 'not-allowed';
  'transition'?: boolean;
};

declare module 'watch-class-compiler' {
  export interface WatchClassConfig {
    unit?: string;
    watchDirs?: string[];
    outputDir?: string;
    outputFileName?: string;
    batchBaseDelay?: number;
    batchDelayPerFile?: number;
    maxBatchDelay?: number;
    maxRetries?: number;
    retryDelay?: number;
    minify?: boolean;
    rules?: Record<string, any>;
    valueMap?: Record<string, string>;
  }


  export interface RuleDefinition {
    /** CSS 属性名，可以是单个属性或属性数组 */
    property: string | string[];
    /** 是否为颜色值 */
    isColor?: boolean;
    /** 默认值 */
    value?: string;
    /** 自定义单位，设置为空字符串表示不使用单位 */
    unit?: string;
    /** 值映射对象 */
    valueMap?: Record<string, string>;
  }
  
  export interface WatchClassConfig {
    /** 默认单位，用于数值类属性，如：px、rem */
    unit?: string;
    /** 需要监听的文件路径模式 */
    watchDirs?: string[];
    /** 生成的 CSS 文件输出目录 */
    outputDir?: string;
    /** 生成的 CSS 文件名 */
    outputFileName?: string;
    /** 批处理基础延迟时间（毫秒） */
    batchBaseDelay?: number;
    /** 每个文件增加的延迟时间（毫秒） */
    batchDelayPerFile?: number;
    /** 最大批处理延迟时间（毫秒） */
    maxBatchDelay?: number;
    /** 失败重试最大次数 */
    maxRetries?: number;
    /** 重试间隔时间（毫秒） */
    retryDelay?: number;
    /** 是否压缩 CSS 文件 */
    minify?: boolean;
    /** CSS 规则定义 */
    rules?: Record<string, RuleDefinition>;
    /** 全局值映射 */
    valueMap?: Record<string, string>;
    /** 已存在的 CSS 文件路径数组 */
    existingCssFiles?: string[];
    /** 是否忽略已存在的类名 */
    ignoreExistingClasses?: boolean;
  }
}


export { CSSProperties, UtilityClasses };