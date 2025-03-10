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
    this.existingClassesCache = null; // 添加缓存属性
    this.formatters = {
      css: (rules) => rules.join(this.config.minify ? '' : '\n'),
      less: (rules) => `@import "variables";\n${rules.join('\n')}`,
      scss: (rules) => `@import "variables";\n${rules.join('\n')}`
    };
  }

  // 添加获取现有类名的方法，带缓存机制
  async getExistingClasses() {
    if (this.existingClassesCache) {
      return this.existingClassesCache;
    }

    const existingClasses = new Set();
    
    if (this.config.ignoreExistingClasses && this.config.existingCssFiles.length) {
      for (const cssFile of this.config.existingCssFiles) {
        try {
          const content = await fs.readFile(cssFile, 'utf-8');
          const classRegex = /\.([a-zA-Z0-9_-]+)\s*{/g;
          let match;
          while ((match = classRegex.exec(content)) !== null) {
            existingClasses.add(match[1]);
          }
        } catch (err) {
          console.warn(`Failed to parse existing CSS file ${cssFile}: ${err.message}`);
        }
      }
    }

    this.existingClassesCache = existingClasses;
    return existingClasses;
  }

  // 修改 compileClass 方法
  compileClassMinified(className) {
    if (this.cssCache.has(className)) {
      return this.cssCache.get(className);
    }
  
    // 解析伪类
    const [baseClassName, ...modifiers] = className.split(':');
    const pseudoSelectors = modifiers
      .map(m => this.config.pseudoClasses[m])
      .filter(Boolean);
  
    // 处理命名空间
    const { prefix: namespacePrefix, scopes } = this.config.namespace;
    const scope = Object.entries(scopes)
      .find(([key]) => baseClassName.startsWith(`${key}-`));
    
    const actualPrefix = scope ? scopes[scope[0]] : namespacePrefix;
    const processedClassName = actualPrefix + (scope ? baseClassName.slice(scope[0].length + 1) : baseClassName);
  
    // 原有的类名处理逻辑
    const isNegative = processedClassName.startsWith('-');
    const baseClass = isNegative ? processedClassName.slice(1) : processedClassName;
    const parts = baseClass.split('-');
    if (parts.length < 2) return null;
  
    const rulePrefix = parts[0];
    const value = parts.slice(1).join('-');
    const rule = this.config.rules[rulePrefix];
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

  // 修改 updateCssFile 方法
  async updateCssFile(logger) {
    const { format, sourceMap, prettier, banner, footer, separate } = this.config.output;
    
    // 按作用域分组规则
    const scopedRules = new Map();
    const defaultRules = [];

    const cssRules = Array.from(allClasses)
      .filter(className => !existingClasses.has(className))
      .map(className => this.compileClassMinified(className))
      .filter(Boolean);

    if (separate) {
      cssRules.forEach(rule => {
        const scope = Object.keys(this.config.namespace.scopes)
          .find(key => rule.includes(`${this.config.namespace.scopes[key]}`));
        
        if (scope) {
          if (!scopedRules.has(scope)) {
            scopedRules.set(scope, []);
          }
          scopedRules.get(scope).push(rule);
        } else {
          defaultRules.push(rule);
        }
      });

      // 分别写入不同文件
      for (const [scope, rules] of scopedRules) {
        const content = this.formatOutput(rules, format, banner, footer);
        const scopedFile = path.join(
          this.config.outputDir,
          `${scope}-${this.config.outputFileName}`
        );
        await this.writeOutputFile(scopedFile, content, logger);
      }

      // 写入默认文件
      if (defaultRules.length > 0) {
        const content = this.formatOutput(defaultRules, format, banner, footer);
        const defaultFile = path.join(this.config.outputDir, this.config.outputFileName);
        await this.writeOutputFile(defaultFile, content, logger);
      }
    } else {
      // 单文件输出
      const content = this.formatOutput(cssRules, format, banner, footer);
      const outputFile = path.join(this.config.outputDir, this.config.outputFileName);
      await this.writeOutputFile(outputFile, content, logger);
    }
  }

  // 格式化输出内容
  formatOutput(rules, format, banner, footer) {
    const formatter = this.formatters[format] || this.formatters.css;
    const content = formatter(rules);
    return [banner, content, footer].filter(Boolean).join('\n');
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