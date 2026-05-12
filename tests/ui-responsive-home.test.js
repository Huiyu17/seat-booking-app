/**
 * 仅覆盖「主页窄屏 UI 自适应」相关改动的回归检查。
 * 其他功能测试见同目录其余文件；请勿在本文件添加与他人模块相关的用例。
 */
const fs = require('fs');
const path = require('path');

const styleCssPath = path.join(__dirname, '../style/style.css');
const indexHtmlPath = path.join(__dirname, '../index.html');

test('编译后的样式表包含主页响应式标记与关键断点', () => {
  const css = fs.readFileSync(styleCssPath, 'utf8');

  expect(css).toContain('cpt304-ui-responsive-home');
  expect(css).toMatch(/@media[^\{]*max-width:\s*960px/);
  expect(css).toMatch(/@media[^\{]*max-width:\s*600px/);
  expect(css).toContain('#seat-booking-app');
  expect(css).toContain('flex-direction: column');
});

test('index.html 保留移动端 viewport，便于窄屏比例与布局生效', () => {
  const html = fs.readFileSync(indexHtmlPath, 'utf8');

  expect(html).toMatch(/name=["']viewport["']/i);
  expect(html).toContain('style/style.css');
});
