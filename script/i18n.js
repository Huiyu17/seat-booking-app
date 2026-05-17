const LANGUAGE_KEY = 'sba-language';
const CONSENT_KEY = 'sba-cookie-consent';

let currentLanguage = 'en';

const translations = {
    en: {
        'page.title': 'Project',

        'toolbar.label': 'App toolbar',
        'theme.dark': 'Dark',
        'theme.light': 'Light',
        'theme.toDark': 'Switch to dark mode',
        'theme.toLight': 'Switch to light mode',
        'language.title': 'Switch language',

        'cookie.label': 'Cookie consent',
        'cookie.message': 'This site uses local storage to save your bookings and preferences.',
        'cookie.privacy': 'Privacy Policy',
        'cookie.accept': 'Accept All',
        'cookie.necessary': 'Necessary Only',

        'settings.selectService': 'Select service:',
        'settings.movieTitle': 'Movie title:',
        'settings.priceBase': 'Price base:',
        'actions.addNew': 'Add new',
        'actions.saveChanges': 'Save changes',
        'actions.delete': 'Delete',
        'sectors.editPrices': 'Edit sectors’ prices',
        'sectors.priceMultipliers': 'Price multipliers for each sector:',
        'actions.save': 'Save',
        'order.tickets': 'Tickets:',
        'actions.buy': 'Buy',
        'order.totalPrice': 'Total price: ${totalPrice}',
        'screen': 'Screen',

        'toast.noShowings': 'No showings found. Use the form to add one.',
        'toast.added': '"{name}" added successfully!',
        'toast.updated': '"{name}" updated successfully!',
        'toast.deleted': '"{name}" deleted.',
        'toast.sectorPricesUpdated': 'Sector prices updated successfully!',
        'toast.bookingSuccessful': 'Booking successful! You have booked {count} seat(s) for ${totalPrice}.',

        'alert.storageUnavailable': 'Access to localStorage in this browser is not available. Data cannot be saved.',
        'alert.serviceFormMissing': 'Service form elements not found.',
        'alert.movieTitleRequired': 'Please enter a Movie title.',
        'alert.priceInvalid': 'Please enter a valid Price base (must be a positive number).',
        'alert.sectorMultiplierEmpty': 'Please fill in all Price multipliers.',
        'alert.sectorMultiplierInvalid': 'Please enter valid Price multipliers.',
        'alert.selectService': 'Please select a service first.',
        'alert.selectSeat': 'Please select at least one seat before booking.',
        'alert.addOrSelectService': 'Please add or select a service first.',
        'confirm.booking':
            'Confirm booking for "{serviceName}"?\n\n' +
            'Selected seats:{seatDetails}\n\n' +
            'Total price: ${totalPrice}\n\n' +
            'Click OK to confirm booking.',

        'privacy.title': 'Privacy Policy',
        'privacy.updated': 'Last updated: May 2026',
        'privacy.collectTitle': '1. What We Collect',
        'privacy.collectText': 'This app stores seat booking data, language preference, and theme preference locally on your device using localStorage. No personal data is transmitted to any server.',
        'privacy.whyTitle': '2. Why We Collect It',
        'privacy.whyText': 'To remember your bookings and display preferences between sessions.',
        'privacy.useTitle': '3. How It Is Used',
        'privacy.useText': 'Data is used solely to provide app functionality. It is never shared with third parties.',
        'privacy.choiceTitle': '4. Cookie & Storage Choices',
        'privacy.choiceText': 'You may clear stored data at any time via your browser settings or developer tools (Application → Local Storage).',
        'privacy.contactTitle': '5. Contact',
        'privacy.contactText': 'For questions, contact the project team.',
        'privacy.back': '← Back to App'
    },

    zh: {
        'page.title': '项目',

        'toolbar.label': '应用工具栏',
        'theme.dark': '深色',
        'theme.light': '浅色',
        'theme.toDark': '切换到深色模式',
        'theme.toLight': '切换到浅色模式',
        'language.title': '切换语言',

        'cookie.label': 'Cookie 同意设置',
        'cookie.message': '本网站使用本地存储来保存你的订票信息和偏好设置。',
        'cookie.privacy': '隐私政策',
        'cookie.accept': '接受全部',
        'cookie.necessary': '仅必要项',

        'settings.selectService': '选择场次：',
        'settings.movieTitle': '电影名称：',
        'settings.priceBase': '基础价格：',
        'actions.addNew': '添加新电影',
        'actions.saveChanges': '保存修改',
        'actions.delete': '删除',
        'sectors.editPrices': '编辑分区价格',
        'sectors.priceMultipliers': '各分区价格倍率：',
        'actions.save': '保存',
        'order.tickets': '票务：',
        'actions.buy': '购买',
        'order.totalPrice': '总价：${totalPrice}',
        'screen': '屏幕',

        'toast.noShowings': '未找到场次。请使用表单添加一个场次。',
        'toast.added': '“{name}” 添加成功！',
        'toast.updated': '“{name}” 更新成功！',
        'toast.deleted': '“{name}” 已删除。',
        'toast.sectorPricesUpdated': '分区价格更新成功！',
        'toast.bookingSuccessful': '购买成功！你已购买 {count} 个座位，总价为 ${totalPrice}。',

        'alert.storageUnavailable': '当前浏览器无法访问 localStorage，数据无法保存。',
        'alert.serviceFormMissing': '未找到电影表单元素。',
        'alert.movieTitleRequired': '请输入电影名称。',
        'alert.priceInvalid': '请输入有效的基础价格，价格必须为正数。',
        'alert.sectorMultiplierEmpty': '请填写所有分区价格倍率。',
        'alert.sectorMultiplierInvalid': '请输入有效的分区价格倍率。',
        'alert.selectService': '请先选择一个场次。',
        'alert.selectSeat': '请至少选择一个座位后再购买。',
        'alert.addOrSelectService': '请先添加或选择一个场次。',
        'confirm.booking':
            '确认购买“{serviceName}”吗？\n\n' +
            '已选座位：{seatDetails}\n\n' +
            '总价：${totalPrice}\n\n' +
            '点击 OK 确认购买。',

        'privacy.title': '隐私政策',
        'privacy.updated': '最后更新：2026 年 5 月',
        'privacy.collectTitle': '1. 我们收集什么',
        'privacy.collectText': '本应用使用 localStorage 在你的设备本地保存订票数据、语言偏好和主题偏好。不会向任何服务器传输个人数据。',
        'privacy.whyTitle': '2. 为什么收集',
        'privacy.whyText': '用于在不同访问之间记住你的订票信息和显示偏好。',
        'privacy.useTitle': '3. 如何使用',
        'privacy.useText': '数据只用于提供应用功能，不会与第三方共享。',
        'privacy.choiceTitle': '4. Cookie 与存储选择',
        'privacy.choiceText': '你可以随时通过浏览器设置或开发者工具中的 Application → Local Storage 清除已保存的数据。',
        'privacy.contactTitle': '5. 联系方式',
        'privacy.contactText': '如有问题，请联系项目团队。',
        'privacy.back': '← 返回应用'
    }
};

function isPreferenceStorageAllowed() {
    try {
        return localStorage.getItem(CONSENT_KEY) === 'accepted';
    } catch {
        return false;
    }
}

function formatMessage(message, values = {}) {
    return String(message).replace(/\{(\w+)\}/g, (match, key) => {
        return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match;
    });
}

function t(key, values = {}) {
    const dictionary = translations[currentLanguage] || translations.en;
    const fallback = translations.en[key] || key;
    const message = dictionary[key] || fallback;

    return formatMessage(message, values);
}

function getInitialLanguage() {
    try {
        if (isPreferenceStorageAllowed()) {
            const storedLanguage = localStorage.getItem(LANGUAGE_KEY);

            if (storedLanguage === 'zh' || storedLanguage === 'en') {
                return storedLanguage;
            }
        }
    } catch {
    }

    return 'en';
}

function updateLanguageButton() {
    const langBtn = document.getElementById('lang-toggle-btn');

    if (!langBtn) return;

    langBtn.textContent = '中/En';
    langBtn.title = t('language.title');
    langBtn.setAttribute('aria-label', t('language.title'));
    langBtn.setAttribute('aria-pressed', currentLanguage === 'zh' ? 'true' : 'false');
}

function applyLanguage(language) {
    currentLanguage = language === 'zh' ? 'zh' : 'en';

    document.documentElement.lang = currentLanguage === 'zh' ? 'zh-Hans' : 'en';

    document.querySelectorAll('[data-i18n]').forEach((element) => {
        element.textContent = t(element.dataset.i18n);
    });

    document.querySelectorAll('[data-i18n-title]').forEach((element) => {
        element.title = t(element.dataset.i18nTitle);
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
        element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
    });

    updateLanguageButton();

    document.dispatchEvent(new CustomEvent('languagechange', {
        detail: {
            language: currentLanguage
        }
    }));
}

function saveCurrentLanguagePreference() {
    if (!isPreferenceStorageAllowed()) return;

    try {
        localStorage.setItem(LANGUAGE_KEY, currentLanguage);
    } catch {
    }
}

function setLanguage(language) {
    applyLanguage(language);

    if (isPreferenceStorageAllowed()) {
        saveCurrentLanguagePreference();
    }
}

function initI18n() {
    applyLanguage(getInitialLanguage());

    const langBtn = document.getElementById('lang-toggle-btn');

    if (!langBtn || langBtn.dataset.i18nBound === '1') {
        return;
    }

    langBtn.dataset.i18nBound = '1';

    langBtn.addEventListener('click', () => {
        const nextLanguage = currentLanguage === 'en' ? 'zh' : 'en';
        setLanguage(nextLanguage);
    });
}

window.t = t;
window.getCurrentLanguage = () => currentLanguage;
window.saveCurrentLanguagePreference = saveCurrentLanguagePreference;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
} else {
    initI18n();
}