const STORAGE_KEY = 'sba-theme';

function applyStoredTheme() {
    try {
        if (localStorage.getItem(STORAGE_KEY) === 'dark') {
            document.documentElement.dataset.theme = 'dark';
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    } catch {
        document.documentElement.removeAttribute('data-theme');
    }
}

function updateThemeButton(btn) {
    const dark = document.documentElement.dataset.theme === 'dark';
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    btn.textContent = dark ? 'Light' : 'Dark';
    btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
}

function initThemeControls() {
    applyStoredTheme();
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (!themeBtn || themeBtn.dataset.themeBound === '1') {
        return;
    }
    themeBtn.dataset.themeBound = '1';
    updateThemeButton(themeBtn);
    themeBtn.addEventListener('click', () => {
        const isDark = document.documentElement.dataset.theme === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch {
            }
        } else {
            document.documentElement.dataset.theme = 'dark';
            try {
                localStorage.setItem(STORAGE_KEY, 'dark');
            } catch {
            }
        }
        updateThemeButton(themeBtn);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeControls);
} else {
    initThemeControls();
}
