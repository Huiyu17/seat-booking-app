'use strict';

const fs = require('fs');
const path = require('path');
const { setupSeatBookingApp } = require('../script/seat-booking-app');

describe('Responsive layout: seats-scroll-wrap (DOM parity with index.html)', () => {
    test('index.html nests #seats inside .seats-scroll-wrap within #screening-room-1', () => {
        const htmlPath = path.join(__dirname, '..', 'index.html');
        const html = fs.readFileSync(htmlPath, 'utf8');

        expect(html).toContain('class="seats-scroll-wrap"');
        expect(html).toContain('id="seats"');

        const screeningIdx = html.indexOf('id="screening-room-1"');
        const wrapIdx = html.indexOf('seats-scroll-wrap');
        const seatsIdx = html.indexOf('id="seats"');

        expect(screeningIdx).toBeGreaterThan(-1);
        expect(wrapIdx).toBeGreaterThan(screeningIdx);
        expect(seatsIdx).toBeGreaterThan(wrapIdx);
    });

    test('jsdom fixture mirrors layout: .seats-scroll-wrap wraps #seats', () => {
        const room = document.querySelector('#screening-room-1');
        const wrap = document.querySelector('.seats-scroll-wrap');
        const seats = document.querySelector('#seats');

        expect(room).not.toBeNull();
        expect(wrap).not.toBeNull();
        expect(seats).not.toBeNull();
        expect(wrap.contains(seats)).toBe(true);
        expect(room.contains(wrap)).toBe(true);
    });
});

describe('Responsive layout: seat map behaviour with scroll wrapper', () => {
    beforeEach(() => {
        const seats = document.querySelector('#seats');
        if (seats) {
            seats.innerHTML = '';
        }
        localStorage.clear();
    });

    test('setupSeatBookingApp succeeds; seat sector ancestry unchanged (row → sector)', () => {
        const app = setupSeatBookingApp();
        expect(app).not.toBeNull();

        const firstSeat = document.querySelector('.seat');
        expect(firstSeat).not.toBeNull();
        expect(firstSeat.closest('#seats')).toBe(document.querySelector('#seats'));

        const row = firstSeat.parentElement;
        const sector = row && row.parentElement;
        expect(row.classList.contains('row')).toBe(true);
        expect(sector.classList.contains('sector')).toBe(true);
        expect(sector.id.length).toBeGreaterThan(0);
    });

    test('mouseover moving between seats removes previous seat__info (single tooltip)', () => {
        setupSeatBookingApp();

        const seats = document.querySelectorAll('.seat');
        expect(seats.length).toBeGreaterThan(1);

        seats[0].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        expect(document.querySelectorAll('.seat__info').length).toBe(1);

        seats[1].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        expect(document.querySelectorAll('.seat__info').length).toBe(1);
        expect(document.querySelector('.seat__info').textContent).toBe(seats[1].id);
    });

    test('mouseleave removes seat__info', () => {
        setupSeatBookingApp();

        const seat = document.querySelector('.seat');
        seat.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        expect(document.querySelector('.seat__info')).not.toBeNull();

        seat.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        expect(document.querySelector('.seat__info')).toBeNull();
    });
});
