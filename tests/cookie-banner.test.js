beforeEach(() => {
    document.body.innerHTML = `
        <div id="cookie-banner" hidden>
            <p>
                This site uses local storage.
                <a href="privacy.html">Privacy Policy</a>
            </p>
            <div>
                <button id="cookie-accept-btn" type="button">Accept All</button>
                <button id="cookie-reject-btn" type="button">Necessary Only</button>
            </div>
        </div>
    `;
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
    jest.resetModules();
});

describe('cookie-banner', () => {
    test('shows banner on first visit (no consent stored) and focuses Accept button', () => {
        expect(localStorage.getItem('sba-cookie-consent')).toBeNull();

        require('../script/cookie-banner.js');

        const banner = document.getElementById('cookie-banner');
        const acceptBtn = document.getElementById('cookie-accept-btn');

        expect(banner.hidden).toBe(false);
        expect(document.activeElement).toBe(acceptBtn);
    });

    test('hides banner when consent already exists', () => {
        localStorage.setItem('sba-cookie-consent', 'accepted');

        require('../script/cookie-banner.js');

        const banner = document.getElementById('cookie-banner');
        expect(banner.hidden).toBe(true);
    });

    test('Accept All stores consent in localStorage and hides banner', () => {
        require('../script/cookie-banner.js');

        const banner = document.getElementById('cookie-banner');
        const acceptBtn = document.getElementById('cookie-accept-btn');

        acceptBtn.click();

        expect(localStorage.getItem('sba-cookie-consent')).toBe('accepted');
        expect(banner.hidden).toBe(true);
    });

    test('Necessary Only stores consent, clears theme and language storage, removes dark theme, and hides banner', () => {
        localStorage.setItem('sba-theme', 'dark');
        localStorage.setItem('sba-language', 'zh');
        document.documentElement.dataset.theme = 'dark';

        require('../script/cookie-banner.js');

        const banner = document.getElementById('cookie-banner');
        const rejectBtn = document.getElementById('cookie-reject-btn');

        rejectBtn.click();

        expect(localStorage.getItem('sba-cookie-consent')).toBe('necessary');
        expect(localStorage.getItem('sba-theme')).toBeNull();
        expect(localStorage.getItem('sba-language')).toBeNull();
        expect(document.documentElement.dataset.theme).toBeUndefined();
        expect(banner.hidden).toBe(true);
    });
});

