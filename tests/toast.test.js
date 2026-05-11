const { showToast } = require('../script/seat-booking-app');

describe('showToast', () => {
    beforeEach(() => {
        jest.useFakeTimers();

        document.body.innerHTML = `
            <div id="toast-region" role="status" aria-live="polite" aria-atomic="true"></div>
        `;
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    test('renders a success toast message in the status region', () => {
        showToast('"Test" added successfully!', 'success');

        const region = document.getElementById('toast-region');
        const toast = document.querySelector('.toast');

        expect(region).not.toBeNull();
        expect(region.getAttribute('role')).toBe('status');
        expect(region.getAttribute('aria-live')).toBe('polite');
        expect(toast).not.toBeNull();
        expect(toast.textContent).toBe('"Test" added successfully!');
        expect(toast.classList.contains('toast--success')).toBe(true);
    });

    test('replaces an existing toast with the latest message', () => {
        showToast('First message', 'info');
        showToast('Second message', 'success');

        const toasts = document.querySelectorAll('.toast');

        expect(toasts.length).toBe(1);
        expect(toasts[0].textContent).toBe('Second message');
        expect(toasts[0].classList.contains('toast--success')).toBe(true);
    });

    test('clears the toast after five seconds', () => {
        showToast('"Test" deleted.', 'info');

        expect(document.querySelector('.toast')).not.toBeNull();

        jest.advanceTimersByTime(5000);

        expect(document.querySelector('.toast')).toBeNull();
    });

    test('does not throw if the toast region is missing', () => {
        document.body.innerHTML = '';

        expect(() => {
            showToast('Message without region', 'info');
        }).not.toThrow();
    });
});