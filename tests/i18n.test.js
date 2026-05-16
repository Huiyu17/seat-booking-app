describe('i18n language toggle', () => {
    beforeEach(() => {
        jest.resetModules();
        localStorage.clear();

        document.body.innerHTML = `
            <div class="app-top-bar" role="toolbar" aria-label="App toolbar" data-i18n-aria-label="toolbar.label">
                <button type="button" id="theme-toggle-btn">Dark</button>
                <button type="button" id="lang-toggle-btn" title="Switch language" aria-label="Switch language">中/En</button>
            </div>

            <div id="cookie-banner" role="dialog" aria-label="Cookie consent" data-i18n-aria-label="cookie.label">
                <p>
                    <span data-i18n="cookie.message">This site uses local storage to save your bookings and preferences.</span>
                    <a href="privacy.html" data-i18n="cookie.privacy">Privacy Policy</a>
                </p>
                <button id="cookie-accept-btn" data-i18n="cookie.accept">Accept All</button>
                <button id="cookie-reject-btn" data-i18n="cookie.necessary">Necessary Only</button>
            </div>

            <label data-i18n="settings.movieTitle">Movie title:</label>
            <button id="service-add-btn" data-i18n="actions.addNew">Add new</button>
            <button id="book-seats-btn" data-i18n="actions.buy">Buy</button>

            <h1 data-i18n="privacy.title">Privacy Policy</h1>
            <a href="index.html" data-i18n="privacy.back">← Back to App</a>
        `;
    });

    afterEach(() => {
        delete window.t;
        delete window.getCurrentLanguage;
        delete window.saveCurrentLanguagePreference;
        localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
    });

    test('applies English by default', () => {
        require('../script/i18n');

        expect(document.documentElement.lang).toBe('en');
        expect(document.querySelector('[data-i18n="settings.movieTitle"]').textContent).toBe('Movie title:');
        expect(document.querySelector('#service-add-btn').textContent).toBe('Add new');
        expect(document.querySelector('#book-seats-btn').textContent).toBe('Buy');
        expect(document.querySelector('#lang-toggle-btn').textContent).toBe('中/En');
        expect(document.querySelector('#lang-toggle-btn').getAttribute('aria-pressed')).toBe('false');
    });

    test('switches page text to Chinese when language button is clicked', () => {
        require('../script/i18n');

        document.querySelector('#lang-toggle-btn').click();

        expect(document.documentElement.lang).toBe('zh-Hans');
        expect(document.querySelector('[data-i18n="settings.movieTitle"]').textContent).toBe('电影名称：');
        expect(document.querySelector('#service-add-btn').textContent).toBe('添加新电影');
        expect(document.querySelector('#book-seats-btn').textContent).toBe('购买');
        expect(document.querySelector('[data-i18n="cookie.message"]').textContent).toBe('本网站使用本地存储来保存你的订票信息和偏好设置。');
        expect(document.querySelector('[data-i18n="privacy.title"]').textContent).toBe('隐私政策');
        expect(document.querySelector('#lang-toggle-btn').getAttribute('aria-pressed')).toBe('true');
    });

    test('switches back to English when language button is clicked twice', () => {
        require('../script/i18n');

        const langBtn = document.querySelector('#lang-toggle-btn');

        langBtn.click();
        langBtn.click();

        expect(document.documentElement.lang).toBe('en');
        expect(document.querySelector('[data-i18n="settings.movieTitle"]').textContent).toBe('Movie title:');
        expect(document.querySelector('#service-add-btn').textContent).toBe('Add new');
        expect(document.querySelector('[data-i18n="cookie.privacy"]').textContent).toBe('Privacy Policy');
        expect(langBtn.getAttribute('aria-pressed')).toBe('false');
    });

    test('saves language preference only when cookie consent is accepted', () => {
        localStorage.setItem('sba-cookie-consent', 'accepted');

        require('../script/i18n');

        document.querySelector('#lang-toggle-btn').click();

        expect(localStorage.getItem('sba-language')).toBe('zh');
    });

    test('does not save language preference without accepted cookie consent', () => {
        require('../script/i18n');

        document.querySelector('#lang-toggle-btn').click();

        expect(localStorage.getItem('sba-language')).toBeNull();
        expect(document.documentElement.lang).toBe('zh-Hans');
    });

    test('uses stored language preference when cookie consent is accepted', () => {
        localStorage.setItem('sba-cookie-consent', 'accepted');
        localStorage.setItem('sba-language', 'zh');

        require('../script/i18n');

        expect(document.documentElement.lang).toBe('zh-Hans');
        expect(document.querySelector('#service-add-btn').textContent).toBe('添加新电影');
        expect(document.querySelector('[data-i18n="cookie.accept"]').textContent).toBe('接受全部');
    });

    test('provides translated messages through window.t', () => {
        require('../script/i18n');

        document.querySelector('#lang-toggle-btn').click();

        expect(window.t('toast.added', { name: 'Test Movie' })).toBe('“Test Movie” 添加成功！');
        expect(window.t('alert.selectSeat')).toBe('请至少选择一个座位后再购买。');
    });

    test('updates theme button text when language changes', () => {
        require('../script/i18n');
        require('../script/theme-controls');

        const themeBtn = document.querySelector('#theme-toggle-btn');
        const langBtn = document.querySelector('#lang-toggle-btn');

        expect(themeBtn.textContent).toBe(window.t('theme.dark'));
        expect(themeBtn.title).toBe(window.t('theme.toDark'));

        langBtn.click();

        expect(document.documentElement.lang).toBe('zh-Hans');
        expect(themeBtn.textContent).toBe(window.t('theme.dark'));
        expect(themeBtn.title).toBe(window.t('theme.toDark'));

        themeBtn.click();

        expect(document.documentElement.dataset.theme).toBe('dark');
        expect(themeBtn.textContent).toBe(window.t('theme.light'));
        expect(themeBtn.title).toBe(window.t('theme.toLight'));
    });
});