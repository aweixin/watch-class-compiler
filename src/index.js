#!/usr/bin/env node

const chokidar = require('chokidar');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
// 打印欢迎信息
console.log(chalk.bold(chalk.blue('WatchClass Compiler')));

// 默认配置
const defaultConfig = {
  unit: 'px',
  watchDirs: ['./src/**/*.{wxml,js,vue,jsx,tsx,html}'],
  outputDir: './dist/css',
  outputFileName: 'generated.css',
  batchBaseDelay: 500,
  batchDelayPerFile: 50,
  maxBatchDelay: 2000,
  maxRetries: 3,
  retryDelay: 1000,
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
    'fs': { property: 'font-size' },
    'leading': { property: 'line-height' },
    'tracking': { property: 'letter-spacing' },
    'font': { property: 'font-weight', unit: '' },
    'bg': { property: 'background-color', isColor: true },
    'text': { property: 'color', isColor: true },
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
    'transparent': 'transparent'
  }
};

// 加载用户配置文件
async function loadUserConfig() {
  const jsConfigPath = path.resolve(process.cwd(), 'watchClass.config.js');
  const tsConfigPath = path.resolve(process.cwd(), 'watchClass.config.ts');
  let userConfig = {};

  try {
    if (await fs.access(jsConfigPath).then(() => true).catch(() => false)) {
      userConfig = require(jsConfigPath);
    } else if (await fs.access(tsConfigPath).then(() => true).catch(() => false)) {
      require('ts-node/register');
      userConfig = require(tsConfigPath).default || require(tsConfigPath);
    }
  } catch (err) {
    console.warn(`Failed to load config file: ${err.message}`);
  }

  return { ...defaultConfig, ...userConfig };
}

// 日志工具
async function createLogger(outputDir) {
  const logFilePath = path.join(outputDir, 'compiler.log');
  await fs.mkdir(path.dirname(logFilePath), { recursive: true });
  try {
    await fs.access(logFilePath);
  } catch {
    await fs.writeFile(logFilePath, '', 'utf-8');
  }

  return {
    info: async (msg) => {
      const timestamp = chalk.gray(new Date().toISOString());
      const level = chalk.blue.bold('[INFO]');
      const logMsg = `${level} ${timestamp} - ${msg}`;
      const plainMsg = `[INFO] ${new Date().toISOString()} - ${msg}`;
      console.log(logMsg);
      await fs.appendFile(logFilePath, plainMsg + '\n', 'utf-8');
    },
    warn: async (msg) => {
      const timestamp = chalk.gray(new Date().toISOString());
      const level = chalk.yellow.bold('[WARN]');
      const logMsg = `${level} ${timestamp} - ${chalk.yellow(msg)}`;
      const plainMsg = `[WARN] ${new Date().toISOString()} - ${msg}`;
      console.warn(logMsg);
      await fs.appendFile(logFilePath, plainMsg + '\n', 'utf-8');
    },
    error: async (msg) => {
      const timestamp = chalk.gray(new Date().toISOString());
      const level = chalk.red.bold('[ERROR]');
      const logMsg = `${level} ${timestamp} - ${chalk.red(msg)}`;
      const plainMsg = `[ERROR] ${new Date().toISOString()} - ${msg}`;
      console.error(logMsg);
      await fs.appendFile(logFilePath, plainMsg + '\n', 'utf-8');
    },
  };
}

// 主逻辑类
class WatchClassCompiler {
  constructor(config) {
    this.config = config;
    this.classUsageMap = new Map();
    this.cssCache = new Map();
    this.batchPending = false;
    this.batchFiles = new Set();
  }

  // 修复 compileClass 函数
  compileClass(className) {
    if (this.cssCache.has(className)) {
      return this.cssCache.get(className);
    }

    const isNegative = className.startsWith('-');
    const baseClass = isNegative ? className.slice(1) : className;
    const parts = baseClass.split('-');
    if (parts.length < 2) return null;

    const prefix = parts[0];
    const value = parts.slice(1).join('-');
    const rule = this.config.rules[prefix];
    if (!rule) return null;

    let cssValue;
    if (rule.isColor) {
      // 如果是颜色规则，支持 HEX 或 valueMap 中的值
      cssValue = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value) ? value : this.config.valueMap[value];
      if (!cssValue) return null; // 如果既不是 HEX 也不是 valueMap 中的值，则忽略
    } else {
      cssValue = rule.value || this.config.valueMap[value] || value;
      if (!rule.value) {
        const unit = rule.unit !== undefined ? rule.unit : this.config.unit;
        cssValue = this.config.valueMap[value] || (isNaN(value) ? value : `${value}${unit}`);
      }
    }

    const properties = Array.isArray(rule.property) ? rule.property : [rule.property];
    const cssRules = properties.map(prop => 
      `${prop}: ${isNegative ? `-${cssValue}` : cssValue};`
    );

    const cssRule = `.${className} {\n  ${cssRules.join('\n  ')}\n}`;
    this.cssCache.set(className, cssRule);
    return cssRule;
  }

  extractClassNames(content) {
    const regex = /class(?:Name)?=["']([^"']+)["']/g;
    const matches = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.push(...match[1].split(/\s+/));
    }
    return [...new Set(matches)];
  }

  calculateBatchDelay(fileCount) {
    const delay = this.config.batchBaseDelay + fileCount * this.config.batchDelayPerFile;
    return Math.min(delay, this.config.maxBatchDelay);
  }

  async processFilesBatch(logger, retryCount = 0) {
    if (this.batchPending || this.batchFiles.size === 0) return;

    this.batchPending = true;
    const filesToProcess = new Set(this.batchFiles);
    this.batchFiles.clear();
    const fileCount = filesToProcess.size;

    try {
      const processPromises = Array.from(filesToProcess).map(async filePath => {
        const content = await fs.readFile(filePath, 'utf-8');
        const classNames = this.extractClassNames(content);
        this.classUsageMap.set(filePath, new Set(classNames));
        await logger.info(`Processed file: ${filePath}, found ${classNames.length} classes`);
      });

      await Promise.all(processPromises);
      await this.updateCssFile(logger);
      await logger.info(`Batch processed ${fileCount} files with ${retryCount} retries`);
    } catch (err) {
      await logger.error(`Batch processing failed after ${retryCount} retries: ${err.message}`);
      if (retryCount < this.config.maxRetries) {
        await logger.warn(`Retrying batch processing (${retryCount + 1}/${this.config.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        await this.processFilesBatch(logger, retryCount + 1);
      } else {
        await logger.error(`Max retries (${this.config.maxRetries}) reached, giving up`);
      }
    } finally {
      this.batchPending = false;
      if (this.batchFiles.size > 0) {
        const delay = this.calculateBatchDelay(this.batchFiles.size);
        await logger.info(`Scheduling next batch with ${this.batchFiles.size} files, delay: ${delay}ms`);
        setTimeout(() => this.processFilesBatch(logger), delay);
      }
    }
  }

  async updateCssFile(logger) {
    const outputFile = path.join(this.config.outputDir, this.config.outputFileName);
    await fs.mkdir(this.config.outputDir, { recursive: true });

    const allClasses = new Set();
    for (const classSet of this.classUsageMap.values()) {
      classSet.forEach(cls => allClasses.add(cls));
    }

    const cssRules = Array.from(allClasses)
      .map(className => this.compileClass(className))
      .filter(Boolean);

    const newContent = cssRules.join('\n\n');

    let existingContent = '';
    try {
      existingContent = await fs.readFile(outputFile, 'utf-8');
    } catch {
      // 文件不存在则忽略
    }

    if (existingContent !== newContent) {
      await fs.writeFile(outputFile, newContent, 'utf-8');
      await logger.info(`Updated CSS file: ${outputFile}, ${cssRules.length} rules written`);
    } else {
      await logger.info(`No changes detected in CSS file: ${outputFile}`);
    }
  }

  async handleFileDeletion(filePath, logger) {
    if (this.classUsageMap.has(filePath)) {
      this.classUsageMap.delete(filePath);
      await logger.info(`File deleted: ${filePath}, removed its classes from tracking`);
      await this.updateCssFile(logger);
    } else {
      await logger.warn(`Deleted file ${filePath} was not tracked`);
    }
  }

  async start(logger) {
    const watcher = chokidar.watch(this.config.watchDirs, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 100
      }
    });

    watcher
      .on('add', async filePath => {
        await logger.info(`File added: ${filePath}`);
        this.batchFiles.add(filePath);
        const delay = this.calculateBatchDelay(this.batchFiles.size);
        await logger.info(`Added to batch, current size: ${this.batchFiles.size}, delay: ${delay}ms`);
        setTimeout(() => this.processFilesBatch(logger), delay);
      })
      .on('change', async filePath => {
        await logger.info(`File changed: ${filePath}`);
        this.batchFiles.add(filePath);
        const delay = this.calculateBatchDelay(this.batchFiles.size);
        await logger.info(`Added to batch, current size: ${this.batchFiles.size}, delay: ${delay}ms`);
        setTimeout(() => this.processFilesBatch(logger), delay);
      })
      .on('unlink', async filePath => {
        await logger.info(`File removed: ${filePath}`);
        await this.handleFileDeletion(filePath, logger);
      })
      .on('error', async error => await logger.error(`Watcher error: ${error.message}`));

    await logger.info(`Started watching files in: ${this.config.watchDirs.join(', ')}`);
  }
}

// 主函数
async function main() {
  const config = await loadUserConfig();
  const logger = await createLogger(config.outputDir);
  const compiler = new WatchClassCompiler(config);
  await compiler.start(logger);
}

// 运行
if (require.main === module) {
  main().catch(err => console.error(err));
}

module.exports = WatchClassCompiler; // 保留导出以支持模块化使用