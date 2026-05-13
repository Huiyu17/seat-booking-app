const {
    SeatBookingApp,
    Service,
    Sector,
    renderBookedSeats,
    attachSeatEvents
} = require('../script/seat-booking-app');

beforeEach(() => {
    document.body.innerHTML = `
        <div id="toast-region" role="status" aria-live="polite" aria-atomic="true"></div>
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

    localStorage.clear();
    global.alert = jest.fn();
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('Keyboard accessibility (seats)', () => {
    test('Sector.renderSector renders seats as <button> with ARIA attributes', () => {
        const sector = new Sector('A1', 1.0, 2);
        sector.renderSector();

        const seat = document.getElementById('s-A1-1-1');
        expect(seat).not.toBeNull();
        expect(seat.tagName).toBe('BUTTON');
        expect(seat.getAttribute('type')).toBe('button');
        expect(seat.getAttribute('aria-label')).toBe('Seat s-A1-1-1');
        expect(seat.getAttribute('aria-pressed')).toBe('false');
        expect(seat.getAttribute('aria-disabled')).toBe('false');
    });

    test('Click toggles aria-pressed for reserving/unreserving seats', () => {
        const app = new SeatBookingApp('testRoom');
        const service = new Service('Avatar', 10);
        const sector = new Sector('A1', 1.0, 2);

        app.addService(service);
        app.setCurrentServiceId(service.getId());
        app.addSector(sector);
        sector.renderSector();

        attachSeatEvents(app);

        const seat = document.getElementById('s-A1-1-1');
        seat.click();
        expect(seat.classList.contains('seat--reserved')).toBe(true);
        expect(seat.getAttribute('aria-pressed')).toBe('true');
        expect(seat.getAttribute('aria-disabled')).toBe('false');

        seat.click();
        expect(seat.classList.contains('seat--reserved')).toBe(false);
        expect(seat.getAttribute('aria-pressed')).toBe('false');
        expect(seat.getAttribute('aria-disabled')).toBe('false');
    });

    test('Booked seats are disabled and marked aria-disabled=true', () => {
        const app = new SeatBookingApp('testRoom');
        const service = new Service('Avatar', 10);
        const sector = new Sector('A1', 1.0, 2);

        app.addService(service);
        app.setCurrentServiceId(service.getId());
        app.addSector(sector);
        sector.renderSector();

        service.setBookedSeatsArray(['s-A1-1-1']);
        renderBookedSeats(app);

        const seat = document.getElementById('s-A1-1-1');
        expect(seat.classList.contains('seat--booked')).toBe(true);
        expect(seat.disabled).toBe(true);
        expect(seat.getAttribute('aria-disabled')).toBe('true');
        expect(seat.getAttribute('aria-pressed')).toBe('false');
    });

    test('Focus shows seat info and blur hides it (keyboard users)', () => {
        const app = new SeatBookingApp('testRoom');
        const service = new Service('Avatar', 10);
        const sector = new Sector('A1', 1.0, 2);

        app.addService(service);
        app.setCurrentServiceId(service.getId());
        app.addSector(sector);
        sector.renderSector();

        attachSeatEvents(app);

        const seat = document.getElementById('s-A1-1-1');
        seat.dispatchEvent(new FocusEvent('focus'));

        const info = document.querySelector('.seat__info');
        expect(info).not.toBeNull();
        expect(info.textContent).toBe('s-A1-1-1');

        seat.dispatchEvent(new FocusEvent('blur'));
        expect(document.querySelector('.seat__info')).toBeNull();
    });

    test('ArrowRight skips booked seats and moves focus to the next available seat', () => {
        const app = new SeatBookingApp('testRoom');
        const service = new Service('Avatar', 10);
        const sector = new Sector('A1', 1.0, 3);

        app.addService(service);
        app.setCurrentServiceId(service.getId());
        app.addSector(sector);
        sector.renderSector();

        service.setBookedSeatsArray(['s-A1-1-2']);
        renderBookedSeats(app);
        attachSeatEvents(app);

        const seat1 = document.getElementById('s-A1-1-1');
        const seat3 = document.getElementById('s-A1-1-3');

        seat1.focus();
        seat1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

        expect(document.activeElement).toBe(seat3);
    });
});

