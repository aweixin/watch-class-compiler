#!/usr/bin/env node

const chokidar = require('chokidar');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const defaultConfig = require('./config/default');
// 打印欢迎信息
console.log(chalk.bold(chalk.blue('WatchClass Compiler')));

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
    this.existingClasses = new Set(); // 存储已存在的类名
  }

  // 添加解析现有 CSS 文件的方法
  async parseExistingCssFiles() {
    if (!this.config.ignoreExistingClasses || !this.config.existingCssFiles.length) {
      return;
    }

    for (const cssFile of this.config.existingCssFiles) {
      try {
        const content = await fs.readFile(cssFile, 'utf-8');
        const classRegex = /\.([a-zA-Z0-9_-]+)\s*{/g;
        let match;
        while ((match = classRegex.exec(content)) !== null) {
          this.existingClasses.add(match[1]);
        }
      } catch (err) {
        console.warn(`Failed to parse existing CSS file ${cssFile}: ${err.message}`);
      }
    }
  }

  // 修改 updateCssFile 方法
  async updateCssFile(logger) {
    const outputFile = path.join(this.config.outputDir, this.config.outputFileName);
    await fs.mkdir(this.config.outputDir, { recursive: true });

    const allClasses = new Set();
    for (const classSet of this.classUsageMap.values()) {
      classSet.forEach(cls => allClasses.add(cls));
    }

    // 修改 compileClass 方法的返回格式
    const compileClassMinified = (className) => {
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
        cssValue = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value) ? value : this.config.valueMap[value];
        if (!cssValue) return null;
      } else {
        cssValue = rule.value || this.config.valueMap[value] || value;
        if (!rule.value) {
          const unit = rule.unit !== undefined ? rule.unit : this.config.unit;
          cssValue = this.config.valueMap[value] || (isNaN(value) ? value : `${value}${unit}`);
        }
      }
    
      const properties = Array.isArray(rule.property) ? rule.property : [rule.property];
      const cssRules = properties.map(prop => 
        `${prop}:${isNegative ? `-${cssValue}` : cssValue}`
      );
    
      // 压缩格式的 CSS 规则
      const cssRule = `.${className}{${cssRules.join(';')}}`;
      this.cssCache.set(className, cssRule);
      return cssRule;
    };
    
    const cssRules = Array.from(allClasses)
      .filter(className => !this.existingClasses.has(className)) // 过滤掉已存在的类名
      .map(className => compileClassMinified(className))
      .filter(Boolean);
    
    // 所有规则用换行连接，以保持基本的可读
    const newContent = cssRules.join(this.config.minify ? '' : '\n');
  
    let existingContent = '';
    try {
      existingContent = await fs.readFile(outputFile, 'utf-8');
    } catch {
      // 文件不存在则忽略
    }
  
    if (existingContent !== newContent) {
      await fs.writeFile(outputFile, newContent, 'utf-8');
      await logger.info(`Updated CSS file: ${outputFile}, ${cssRules.length} rules written (minified)`);
    } else {
      await logger.info(`No changes detected in CSS file: ${outputFile}`);
    }
  }

  // 修改 start 方法
  async start(logger) {
    await this.parseExistingCssFiles(); // 在开始监听前解析现有 CSS 文件
    
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