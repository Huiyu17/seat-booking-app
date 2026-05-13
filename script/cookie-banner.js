(() => {
    const CONSENT_KEY = 'sba-cookie-consent';
    const THEME_KEY = 'sba-theme';

    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept-btn');
    const rejectBtn = document.getElementById('cookie-reject-btn');

    if (!banner || !acceptBtn || !rejectBtn) return;

    const hide = () => {
        banner.hidden = true;
    };

    const show = () => {
        banner.hidden = false;
        acceptBtn.focus();
    };

    const setConsent = (value) => {
        try {
            localStorage.setItem(CONSENT_KEY, value);
        } catch {
        }
    };

    const getConsent = () => {
        try {
            return localStorage.getItem(CONSENT_KEY);
        } catch {
            return null;
        }
    };

    const consent = getConsent();
    if (consent) {
        hide();
    } else {
        show();
    }

    acceptBtn.addEventListener('click', () => {
        setConsent('accepted');
        hide();
    });

    rejectBtn.addEventListener('click', () => {
        setConsent('necessary');
        try {
            localStorage.removeItem(THEME_KEY);
        } catch {
        }
        document.documentElement.removeAttribute('data-theme');
        hide();
    });
})();

