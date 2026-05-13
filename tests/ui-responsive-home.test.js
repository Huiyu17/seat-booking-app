const fs = require('fs');
const path = require('path');

const styleCssPath = path.join(__dirname, '../style/style.css');
const indexHtmlPath = path.join(__dirname, '../index.html');

const JSDOM_DEFAULT_BODY = `
  <div id="seat-booking-app">
    <div id="settings">
      <select id="services-list"></select>
      <input id="service-name" type="text">
      <input id="service-price" type="number">
      <ul id="sectors-list"></ul>
      <ul id="order-details"></ul>
      <span id="order-total-price"></span>
      <button id="service-add-btn"></button>
      <button id="service-update-btn"></button>
      <button id="service-delete-btn"></button>
      <button id="book-seats-btn"></button>
      <button id="sectors-price-btn"></button>
      <button id="sectors-save-btn"></button>
    </div>
    <div id="screening-room-1">
      <div id="screen">Screen</div>
      <div id="seats"></div>
    </div>
  </div>
`;

describe('ui-responsive-home', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
    document.body.innerHTML = JSDOM_DEFAULT_BODY;
  });

  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
    localStorage.setItem('sba-cookie-consent', 'accepted');
    jest.resetModules();
    document.body.innerHTML = `
    <button type="button" id="theme-toggle-btn" class="app-top-bar__btn" aria-pressed="false"></button>
    <button type="button" id="lang-toggle-btn" class="app-top-bar__btn">CN/EN</button>
  `;
    require('../script/theme-controls.js');
  });

  test('compiled stylesheet includes responsive layout rules', () => {
    const css = fs.readFileSync(styleCssPath, 'utf8');

    expect(css).toMatch(/@media[^\{]*max-width:\s*960px/);
    expect(css).toMatch(/@media[^\{]*max-width:\s*600px/);
    expect(css).toContain('#seat-booking-app');
    expect(css).toContain('flex-direction: column');
    expect(css).toContain('container-type: inline-size');
    expect(css).toMatch(/#seat-booking-app #screening-room-1 #seats[\s\S]*?overflow-x:\s*hidden/);
    expect(css).toMatch(/#seat-booking-app #screening-room-1 #seats[\s\S]*?transform-origin:\s*top left/);
    expect(css).toContain('.app-top-bar__btn');
    expect(css).toMatch(/html\[data-theme=["']?dark["']?\]/);
  });

  test('index.html has viewport, stylesheet, toolbar, and theme bootstrap', () => {
    const html = fs.readFileSync(indexHtmlPath, 'utf8');

    expect(html).toMatch(/name=["']viewport["']/i);
    expect(html).toContain('style/style.css');
    expect(html).toContain('app-top-bar');
    expect(html).toContain('sba-theme');
    expect(html).toContain('lang-toggle-btn');
  });

  test('defaults to light theme and theme button shows Dark', () => {
    const btn = document.getElementById('theme-toggle-btn');

    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(btn.textContent).toBe('Dark');
  });

  test('theme button click enables dark mode and persists', () => {
    const btn = document.getElementById('theme-toggle-btn');

    btn.click();

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('sba-theme')).toBe('dark');
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.textContent).toBe('Light');
  });

  test('second click returns to light and clears storage', () => {
    const btn = document.getElementById('theme-toggle-btn');

    btn.click();
    btn.click();

    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(localStorage.getItem('sba-theme')).toBeNull();
    expect(btn.textContent).toBe('Dark');
  });

  test('initializes dark when localStorage already has dark', () => {
    localStorage.setItem('sba-cookie-consent', 'accepted');
    localStorage.setItem('sba-theme', 'dark');
    jest.resetModules();
    document.body.innerHTML = `
    <button type="button" id="theme-toggle-btn" class="app-top-bar__btn"></button>
    <button type="button" id="lang-toggle-btn" class="app-top-bar__btn">CN/EN</button>
  `;
    require('../script/theme-controls.js');

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.getElementById('theme-toggle-btn').textContent).toBe('Light');
  });

  test('lang toggle button is present in DOM', () => {
    const lang = document.getElementById('lang-toggle-btn');

    expect(lang).not.toBeNull();
    expect(lang.textContent).toContain('CN');
  });
});
