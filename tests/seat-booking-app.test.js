const {
    SeatBookingApp,
    Service,
    Sector,
    validateServiceForm,
    validateSectorPriceMultipliers,
    enableSectorPriceEditing,
    saveSectorPriceMultipliers,
    addServiceFromForm,
    updateServiceFromForm,
    deleteCurrentService,
    bookCurrentSeats,
    renderBookedSeats,
    attachSeatEvents,
    sanitizeText,
    scaleScreeningRoomContent,
    setupScreeningRoomAutoScale,
    setupSeatBookingApp
} = require('../script/seat-booking-app');

beforeEach(() => {
    document.body.innerHTML = `
        <div id="toast-region" role="status" aria-live="polite" aria-atomic="true"></div>

        <div id="seat-booking-app">
            <select id="services-list"></select>

            <input type="text" id="service-name">
            <input type="number" id="service-price">

            <button id="service-add-btn">Add Service</button>
            <button id="service-update-btn">Update Service</button>
            <button id="service-delete-btn">Delete Service</button>
            <button id="book-seats-btn">Book Seats</button>

            <ul id="sectors-list">
                <li>
                    <label for="price-s-A1">s-A1</label>
                    <input id="price-s-A1" value="1.5" disabled style="border: none;">
                </li>
                <li>
                    <label for="price-s-B1">s-B1</label>
                    <input id="price-s-B1" value="2.0" disabled style="border: none;">
                </li>
            </ul>

            <button id="sectors-price-btn">Edit Sectors</button>
            <button id="sectors-save-btn" style="display: none;">Save Sectors</button>

            <ul id="order-details"></ul>
            <span id="order-total-price"></span>

            <div id="seats">
                <div id="s-A1">
                    <div id="s-A1-1">
                        <div class="seat" id="s-A1-1-1"></div>
                        <div class="seat" id="s-A1-1-2"></div>
                    </div>
                </div>
                <div id="s-B1">
                    <div id="s-B1-1">
                        <div class="seat" id="s-B1-1-1"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    localStorage.clear();

    global.alert = jest.fn();
    global.confirm = jest.fn(() => true);

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('validateServiceForm', () => {
    test('returns false when Movie title is empty', () => {
        document.querySelector('#service-name').value = '';
        document.querySelector('#service-price').value = '10';

        const result = validateServiceForm();

        expect(result).toBe(false);
        expect(global.alert).toHaveBeenCalledWith('Please enter a Movie title.');
    });

    test('returns false when Movie title only contains spaces', () => {
        document.querySelector('#service-name').value = '   ';
        document.querySelector('#service-price').value = '10';

        const result = validateServiceForm();

        expect(result).toBe(false);
        expect(global.alert).toHaveBeenCalledWith('Please enter a Movie title.');
    });

    test('returns false when Price base is empty', () => {
        document.querySelector('#service-name').value = 'Avatar';
        document.querySelector('#service-price').value = '';

        const result = validateServiceForm();

        expect(result).toBe(false);
        expect(global.alert).toHaveBeenCalledWith(
            'Please enter a valid Price base (must be a positive number).'
        );
    });

    test('returns false when Price base is not a number', () => {
        document.querySelector('#service-name').value = 'Avatar';
        document.querySelector('#service-price').value = 'abc';

        const result = validateServiceForm();

        expect(result).toBe(false);
        expect(global.alert).toHaveBeenCalledWith(
            'Please enter a valid Price base (must be a positive number).'
        );
    });

    test('returns false when Price base is zero', () => {
        document.querySelector('#service-name').value = 'Avatar';
        document.querySelector('#service-price').value = '0';

        const result = validateServiceForm();

        expect(result).toBe(false);
        expect(global.alert).toHaveBeenCalledWith(
            'Please enter a valid Price base (must be a positive number).'
        );
    });

    test('returns false when Price base is negative', () => {
        document.querySelector('#service-name').value = 'Avatar';
        document.querySelector('#service-price').value = '-5';

        const result = validateServiceForm();

        expect(result).toBe(false);
        expect(global.alert).toHaveBeenCalledWith(
            'Please enter a valid Price base (must be a positive number).'
        );
    });

    test('returns name and price when inputs are valid', () => {
        document.querySelector('#service-name').value = '  Avatar  ';
        document.querySelector('#service-price').value = '12.5';

        const result = validateServiceForm();

        expect(result).toEqual({
            name: 'Avatar',
            price: 12.5
        });
        expect(global.alert).not.toHaveBeenCalled();
    });

    test('returns false when form elements do not exist', () => {
        document.body.innerHTML = '';

        const result = validateServiceForm();

        expect(result).toBe(false);
        expect(global.alert).toHaveBeenCalledWith('Service form elements not found.');
    });
});

describe('validateSectorPriceMultipliers', () => {
    test('returns false when one multiplier is empty', () => {
        document.querySelector('#price-s-A1').value = '';
        document.querySelector('#price-s-B1').value = '2';

        const result = validateSectorPriceMultipliers();

        expect(result).toBe(false);
        expect(global.alert).toHaveBeenCalledWith('Please fill in all Price multipliers.');
    });

    test('returns false when one multiplier is not a number', () => {
        document.querySelector('#price-s-A1').value = 'abc';
        document.querySelector('#price-s-B1').value = '2';

        const result = validateSectorPriceMultipliers();

        expect(result).toBe(false);
        expect(global.alert).toHaveBeenCalledWith('Please enter valid Price multipliers.');
    });

    test('returns false when one multiplier is negative', () => {
        document.querySelector('#price-s-A1').value = '-1';
        document.querySelector('#price-s-B1').value = '2';

        const result = validateSectorPriceMultipliers();

        expect(result).toBe(false);
        expect(global.alert).toHaveBeenCalledWith('Please enter valid Price multipliers.');
    });

    test('returns true when all multipliers are valid', () => {
        document.querySelector('#price-s-A1').value = '1.5';
        document.querySelector('#price-s-B1').value = '2.5';

        const result = validateSectorPriceMultipliers();

        expect(result).toBe(true);
        expect(global.alert).not.toHaveBeenCalled();
    });
});

describe('enableSectorPriceEditing', () => {
    test('enables disabled inputs and shows save button', () => {
        const inputA1 = document.querySelector('#price-s-A1');
        const inputB1 = document.querySelector('#price-s-B1');
        const saveBtn = document.querySelector('#sectors-save-btn');

        expect(inputA1.disabled).toBe(true);
        expect(inputB1.disabled).toBe(true);
        expect(saveBtn.style.display).toBe('none');

        enableSectorPriceEditing();

        expect(inputA1.disabled).toBe(false);
        expect(inputB1.disabled).toBe(false);
        expect(inputA1.style.borderStyle).toBe('solid');
        expect(inputB1.style.borderStyle).toBe('solid');
        expect(saveBtn.style.display).toBe('inline-block');
    });

    test('toggles enabled inputs back to disabled', () => {
        const inputA1 = document.querySelector('#price-s-A1');

        inputA1.disabled = false;

        enableSectorPriceEditing();

        expect(inputA1.disabled).toBe(true);
        expect(inputA1.style.border).toBe('');
    });
});

describe('saveSectorPriceMultipliers', () => {
    test('does not save if validation fails', () => {
        const app = new SeatBookingApp('testRoom');
        const sectorA = new Sector('A1', 1.0, 5);
        const sectorB = new Sector('B1', 1.0, 5);

        app.addSector(sectorA);
        app.addSector(sectorB);
        app.updateOrderDetails = jest.fn();

        document.querySelector('#price-s-A1').value = '';
        document.querySelector('#price-s-B1').value = '2';

        const result = saveSectorPriceMultipliers(app);

        expect(result).toBe(false);
        expect(global.alert).toHaveBeenCalledWith('Please fill in all Price multipliers.');
        expect(sectorA.getPriceMultiplier()).toBe(1.0);
        expect(sectorB.getPriceMultiplier()).toBe(1.0);
        expect(app.updateOrderDetails).not.toHaveBeenCalled();
    });

    test('updates sector price multipliers when valid', () => {
        const app = new SeatBookingApp('testRoom');
        const sectorA = new Sector('A1', 1.0, 5);
        const sectorB = new Sector('B1', 1.0, 5);

        app.addSector(sectorA);
        app.addSector(sectorB);
        app.updateOrderDetails = jest.fn();

        document.querySelector('#price-s-A1').value = '1.8';
        document.querySelector('#price-s-B1').value = '2.2';

        const result = saveSectorPriceMultipliers(app);

        expect(result).toBe(true);

        expect(sectorA.getPriceMultiplier()).toBe(1.8);
        expect(sectorB.getPriceMultiplier()).toBe(2.2);

        expect(app.getPriceMultipliersArray()).toEqual([
            {
                sector: 's-A1',
                priceMultiplier: 1.8
            },
            {
                sector: 's-B1',
                priceMultiplier: 2.2
            }
        ]);

        expect(app.updateOrderDetails).toHaveBeenCalled();

        expect(document.querySelector('#price-s-A1').disabled).toBe(true);
        expect(document.querySelector('#price-s-B1').disabled).toBe(true);
        expect(document.querySelector('#sectors-save-btn').style.display).toBe('none');

        const toast = document.querySelector('.toast');

        expect(toast).not.toBeNull();
        expect(toast.textContent).toBe('Sector prices updated successfully!');
        expect(toast.classList.contains('toast--success')).toBe(true);

        expect(global.alert).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith('Sector prices have been updated');
    });
});

describe('addServiceFromForm', () => {
    test('does not add service when Movie title is empty', () => {
        const app = new SeatBookingApp('testRoom');

        document.querySelector('#service-name').value = '';
        document.querySelector('#service-price').value = '10';

        const result = addServiceFromForm(app);

        expect(result).toBe(false);
        expect(app.getServicesArray()).toHaveLength(0);
        expect(global.alert).toHaveBeenCalledWith('Please enter a Movie title.');
    });

    test('does not add service when Price base is invalid', () => {
        const app = new SeatBookingApp('testRoom');

        document.querySelector('#service-name').value = 'Avatar';
        document.querySelector('#service-price').value = 'abc';

        const result = addServiceFromForm(app);

        expect(result).toBe(false);
        expect(app.getServicesArray()).toHaveLength(0);
        expect(global.alert).toHaveBeenCalledWith(
            'Please enter a valid Price base (must be a positive number).'
        );
    });

    test('adds service when inputs are valid', () => {
        const app = new SeatBookingApp('testRoom');

        document.querySelector('#service-name').value = 'Avatar';
        document.querySelector('#service-price').value = '15.5';

        const result = addServiceFromForm(app);

        expect(result).toBe(true);
        expect(app.getServicesArray()).toHaveLength(1);

        const service = app.getServicesArray()[0];

        expect(service.getName()).toBe('Avatar');
        expect(service.getPrice()).toBe(15.5);

        expect(document.querySelector('#services-list').children).toHaveLength(1);
        expect(console.log).toHaveBeenCalledWith('"Avatar" has been successfully added');
    });
});

describe('updateServiceFromForm', () => {
    test('does not update when validation fails', () => {
        const app = new SeatBookingApp('testRoom');
        const service = new Service('Original', 10);

        app.addService(service);
        app.setCurrentServiceId(service.getId());

        document.querySelector('#service-name').value = '';
        document.querySelector('#service-price').value = '20';

        const result = updateServiceFromForm(app);

        expect(result).toBe(false);
        expect(service.getName()).toBe('Original');
        expect(service.getPrice()).toBe(10);
        expect(global.alert).toHaveBeenCalledWith('Please enter a Movie title.');
    });

    test('does not update when no current service is selected', () => {
        const app = new SeatBookingApp('testRoom');

        document.querySelector('#service-name').value = 'Avatar';
        document.querySelector('#service-price').value = '20';

        const result = updateServiceFromForm(app);

        expect(result).toBe(false);
        expect(global.alert).toHaveBeenCalledWith('Please select a service first.');
    });

    test('updates current service when inputs are valid', () => {
        const app = new SeatBookingApp('testRoom');
        const service = new Service('Original', 10);

        app.addService(service);
        app.setCurrentServiceId(service.getId());

        app.updateOrderDetails = jest.fn();

        document.querySelector('#service-name').value = 'Updated Movie';
        document.querySelector('#service-price').value = '25.5';

        const result = updateServiceFromForm(app);

        expect(result).toBe(true);
        expect(service.getName()).toBe('Updated Movie');
        expect(service.getPrice()).toBe(25.5);
        expect(app.updateOrderDetails).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith('"Updated Movie" has been successfully updated');
    });
});

describe('deleteCurrentService', () => {
    test('deletes current service', () => {
        const app = new SeatBookingApp('testRoom');
        const service = new Service('Movie To Delete', 10);

        app.addService(service);
        app.setCurrentServiceId(service.getId());

        document.querySelector('#service-name').value = 'Movie To Delete';

        const result = deleteCurrentService(app);

        expect(result).toBe(true);
        expect(app.getServicesArray()).toHaveLength(0);
        expect(console.log).toHaveBeenCalledWith('"Movie To Delete" has been successfully removed');
    });

    test('shows alert when no service is selected', () => {
        const app = new SeatBookingApp('testRoom');

        const result = deleteCurrentService(app);

        expect(result).toBe(false);
        expect(global.alert).toHaveBeenCalledWith('Please select a service first.');
    });
});

describe('bookCurrentSeats', () => {
    test('shows alert when no current service exists', () => {
        const app = new SeatBookingApp('testRoom');

        const result = bookCurrentSeats(app);

        expect(result).toBe(false);
        expect(global.alert).toHaveBeenCalledWith('Please select a service first.');
    });

    test('shows alert when no seats are reserved', () => {
        const app = new SeatBookingApp('testRoom');
        const service = new Service('Avatar', 10);

        app.addService(service);
        app.setCurrentServiceId(service.getId());

        const result = bookCurrentSeats(app);

        expect(result).toBe(false);
        expect(global.alert).toHaveBeenCalledWith('Please select at least one seat before booking.');
    });

    test('books reserved seats when user confirms', () => {
        const app = new SeatBookingApp('testRoom');
        const service = new Service('Avatar', 10);
        const sector = new Sector('A1', 1.5, 2);

        app.addService(service);
        app.addSector(sector);
        app.setCurrentServiceId(service.getId());
        app.setPriceMultipliersArray();

        app.updateOrderDetails = jest.fn();

        const seat1 = document.querySelector('#s-A1-1-1');
        const seat2 = document.querySelector('#s-A1-1-2');

        service.addReservedSeat(seat1);
        service.addReservedSeat(seat2);

        const result = bookCurrentSeats(app);

        expect(result).toBe(true);
        expect(global.confirm).toHaveBeenCalled();

        expect(service.getBookedSeats()).toEqual(['s-A1-1-1', 's-A1-1-2']);
        expect(service.getReservedSeats()).toHaveLength(0);

        expect(app.updateOrderDetails).toHaveBeenCalled();

        const toast = document.querySelector('.toast');

        expect(toast).not.toBeNull();
        expect(toast.textContent).toBe('Booking successful! You have booked 2 seat(s) for $30.');
        expect(toast.classList.contains('toast--success')).toBe(true);

        expect(global.alert).not.toHaveBeenCalled();
        
    });

    test('does not book seats when user cancels', () => {
        global.confirm = jest.fn(() => false);

        const app = new SeatBookingApp('testRoom');
        const service = new Service('Avatar', 10);
        const sector = new Sector('A1', 1.5, 2);

        app.addService(service);
        app.addSector(sector);
        app.setCurrentServiceId(service.getId());
        app.setPriceMultipliersArray();

        const seat1 = document.querySelector('#s-A1-1-1');
        service.addReservedSeat(seat1);

        const result = bookCurrentSeats(app);

        expect(result).toBe(false);
        expect(service.getBookedSeats()).toEqual([]);
        expect(service.getReservedSeats()).toHaveLength(1);
        expect(console.log).toHaveBeenCalledWith('Booking cancelled by user.');
    });
});

describe('SeatBookingApp basic methods', () => {
    test('setPriceMultipliersArray creates multiplier array from sectors', () => {
        const app = new SeatBookingApp('testRoom');
        const sectorA = new Sector('A1', 1.2, 2);
        const sectorB = new Sector('B1', 1.8, 2);

        app.addSector(sectorA);
        app.addSector(sectorB);

        app.setPriceMultipliersArray();

        expect(app.getPriceMultipliersArray()).toEqual([
            {
                sector: 's-A1',
                priceMultiplier: 1.2
            },
            {
                sector: 's-B1',
                priceMultiplier: 1.8
            }
        ]);
    });

    test('renderSectorsList renders sector multiplier inputs', () => {
        const app = new SeatBookingApp('testRoom');
        const sectorA = new Sector('A1', 1.2, 2);

        app.addSector(sectorA);
        app.setPriceMultipliersArray();

        document.querySelector('#sectors-list').innerHTML = '';

        app.renderSectorsList();

        const input = document.querySelector('#price-s-A1');

        expect(input).not.toBeNull();
        expect(input.value).toBe('1.2');
        expect(input.disabled).toBe(true);
    });

    test('renderServicesList renders options', () => {
        const app = new SeatBookingApp('testRoom');
        const service = new Service('Avatar', 10);

        app.addService(service);
        app.renderServicesList();

        const option = document.querySelector('#services-list option');

        expect(option).not.toBeNull();
        expect(option.textContent).toBe('Avatar');
        expect(option.value).toBe(service.getId());
    });

    test('renderCurrentServiceData fills service form', () => {
        const app = new SeatBookingApp('testRoom');
        const service = new Service('Avatar', 10);

        app.addService(service);
        app.setCurrentServiceId(service.getId());

        app.renderCurrentServiceData();

        expect(document.querySelector('#service-name').value).toBe('Avatar');
        expect(document.querySelector('#service-price').value).toBe('10');
    });

    test('updateOrderDetails renders selected seats and total price', () => {
        const app = new SeatBookingApp('testRoom');
        const service = new Service('Avatar', 10);
        const sector = new Sector('A1', 1.5, 2);

        app.addService(service);
        app.addSector(sector);
        app.setCurrentServiceId(service.getId());
        app.setPriceMultipliersArray();

        const seat = document.querySelector('#s-A1-1-1');
        service.addReservedSeat(seat);

        app.updateOrderDetails();

        expect(document.querySelector('#order-details').textContent).toContain('s-A1-1-1');
        expect(document.querySelector('#order-details').textContent).toContain('$15');
        expect(document.querySelector('#order-total-price').textContent).toBe('Total price: $15');
    });
});

describe('Service methods', () => {
    test('addReservedSeat adds seat only once', () => {
        const service = new Service('Avatar', 10);
        const seat = { id: 's-A1-1-1' };

        service.addReservedSeat(seat);
        service.addReservedSeat(seat);

        expect(service.getReservedSeats()).toHaveLength(1);
    });

    test('removeReservedSeat removes seat by id', () => {
        const service = new Service('Avatar', 10);
        const seat1 = { id: 's-A1-1-1' };
        const seat2 = { id: 's-A1-1-2' };

        service.addReservedSeat(seat1);
        service.addReservedSeat(seat2);

        service.removeReservedSeat('s-A1-1-1');

        expect(service.getReservedSeats()).toHaveLength(1);
        expect(service.getReservedSeats()[0].id).toBe('s-A1-1-2');
    });

    test('removeReservedSeat does nothing if seat does not exist', () => {
        const service = new Service('Avatar', 10);
        const seat = { id: 's-A1-1-1' };

        service.addReservedSeat(seat);
        service.removeReservedSeat('missing-seat');

        expect(service.getReservedSeats()).toHaveLength(1);
    });

    test('clearReservedSeats clears reserved seats', () => {
        const service = new Service('Avatar', 10);

        service.addReservedSeat({ id: 's-A1-1-1' });
        service.addReservedSeat({ id: 's-A1-1-2' });

        service.clearReservedSeats();

        expect(service.getReservedSeats()).toHaveLength(0);
    });

    test('bookSeats moves reserved seats to booked seats', () => {
        const service = new Service('Avatar', 10);

        const seat1 = document.querySelector('#s-A1-1-1');
        const seat2 = document.querySelector('#s-A1-1-2');

        service.addReservedSeat(seat1);
        service.addReservedSeat(seat2);

        service.bookSeats();

        expect(service.getBookedSeats()).toEqual(['s-A1-1-1', 's-A1-1-2']);
        expect(service.getReservedSeats()).toHaveLength(0);
        expect(seat1.classList.contains('seat--booked')).toBe(true);
        expect(seat2.classList.contains('seat--booked')).toBe(true);
    });

    test('setBookedSeatsArray uses empty array if input is invalid', () => {
        const service = new Service('Avatar', 10);

        service.setBookedSeatsArray(null);

        expect(service.getBookedSeats()).toEqual([]);
    });
});

describe('Sector.renderSector', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="seat-booking-app">
                <div id="seats"></div>
            </div>
        `;
    });

    test('renders sector container', () => {
        const sector = new Sector('TEST', 1.0, 2, 3);

        sector.renderSector();

        const sectorElement = document.querySelector('#s-TEST');

        expect(sectorElement).not.toBeNull();
        expect(sectorElement.classList.contains('sector')).toBe(true);
        expect(sectorElement.style.gridArea).toBe('TEST');
    });

    test('renders correct number of rows', () => {
        const sector = new Sector('ROWS', 1.0, 2, 3, 1);

        sector.renderSector();

        expect(document.querySelectorAll('#s-ROWS .row')).toHaveLength(3);
    });

    test('renders correct number of seats', () => {
        const sector = new Sector('SEATS', 1.0, 2, 3);

        sector.renderSector();

        expect(document.querySelectorAll('#s-SEATS .seat')).toHaveLength(5);
    });

    test('renders sector label', () => {
        const sector = new Sector('LABEL', 1.0, 2);

        sector.renderSector();

        const label = document.querySelector('#s-LABEL .sector__label');

        expect(label).not.toBeNull();
        expect(label.textContent).toBe('s-LABEL');
    });

    test('throws error when app container does not exist', () => {
        document.body.innerHTML = `<div id="seats"></div>`;

        const sector = new Sector('ERROR', 1.0, 2);

        expect(() => sector.renderSector()).toThrow('App container not found');
    });

    test('throws error when seats container does not exist', () => {
        document.body.innerHTML = `<div id="seat-booking-app"></div>`;

        const sector = new Sector('ERROR', 1.0, 2);

        expect(() => sector.renderSector()).toThrow('Seats container not found');
    });
});

describe('fetchServices and cacheServices', () => {
    test('fetchServices logs message when no cached data exists', () => {
        const app = new SeatBookingApp('emptyRoom');

        app.fetchServices();

        expect(console.log).toHaveBeenCalledWith(
            "Let's add some services. Use the form on the left."
        );
        expect(app.getServicesArray()).toHaveLength(0);
    });

    test('cacheServices and fetchServices restore services', () => {
        const app = new SeatBookingApp('testRoom');
        const service = new Service('Avatar', 12.5);

        service.setBookedSeatsArray(['s-A1-1-1']);
        app.addService(service);
        app.cacheServices();

        const newApp = new SeatBookingApp('testRoom');
        newApp.fetchServices();

        expect(newApp.getServicesArray()).toHaveLength(1);

        const restored = newApp.getServicesArray()[0];

        expect(restored.getName()).toBe('Avatar');
        expect(restored.getPrice()).toBe(12.5);
        expect(restored.getBookedSeats()).toEqual(['s-A1-1-1']);
    });

    test('fetchServices skips invalid service data', () => {
        const app = new SeatBookingApp('testRoom');

        localStorage.setItem(
            'sba-services-testRoom',
            JSON.stringify([
                {
                    _name: 123,
                    _price: 10,
                    _seatsBooked: []
                }
            ])
        );

        app.fetchServices();

        expect(console.warn).toHaveBeenCalledWith('Invalid service data, skipping');
        expect(app.getServicesArray()).toHaveLength(0);
    });

    test('fetchServices skips invalid JSON', () => {
        const app = new SeatBookingApp('testRoom');

        localStorage.setItem('sba-services-testRoom', '{invalid-json');

        app.fetchServices();

        expect(console.warn).toHaveBeenCalledWith('Invalid localStorage service data, skipping');
        expect(app.getServicesArray()).toHaveLength(0);
    });

    test('fetchServices sanitizes service name', () => {
        const app = new SeatBookingApp('testRoom');

        localStorage.setItem(
            'sba-services-testRoom',
            JSON.stringify([
                {
                    _name: '<script>alert("x")</script>',
                    _price: 10,
                    _seatsBooked: []
                }
            ])
        );

        app.fetchServices();

        expect(app.getServicesArray()).toHaveLength(1);
        expect(app.getServicesArray()[0].getName()).toContain('&lt;script&gt;');
    });
});

describe('renderBookedSeats', () => {
    test('marks booked seats in DOM', () => {
        const app = new SeatBookingApp('testRoom');
        const service = new Service('Avatar', 10);

        service.setBookedSeatsArray(['s-A1-1-1']);

        app.addService(service);
        app.setCurrentServiceId(service.getId());

        renderBookedSeats(app);

        expect(document.querySelector('#s-A1-1-1').classList.contains('seat--booked')).toBe(true);
        expect(document.querySelector('#s-A1-1-2').classList.contains('seat--booked')).toBe(false);
    });
});

describe('attachSeatEvents', () => {
    test('clicking available seat reserves it', () => {
        const app = new SeatBookingApp('testRoom');
        const service = new Service('Avatar', 10);
        const sector = new Sector('A1', 1.5, 2);

        app.addService(service);
        app.addSector(sector);
        app.setCurrentServiceId(service.getId());
        app.setPriceMultipliersArray();

        app.updateOrderDetails = jest.fn();

        attachSeatEvents(app);

        const seat = document.querySelector('#s-A1-1-1');

        seat.click();

        expect(seat.classList.contains('seat--reserved')).toBe(true);
        expect(service.getReservedSeats()).toHaveLength(1);
        expect(app.updateOrderDetails).toHaveBeenCalled();
    });

    test('clicking reserved seat removes reservation', () => {
        const app = new SeatBookingApp('testRoom');
        const service = new Service('Avatar', 10);
        const sector = new Sector('A1', 1.5, 2);

        app.addService(service);
        app.addSector(sector);
        app.setCurrentServiceId(service.getId());
        app.setPriceMultipliersArray();

        app.updateOrderDetails = jest.fn();

        attachSeatEvents(app);

        const seat = document.querySelector('#s-A1-1-1');

        seat.click();
        seat.click();

        expect(seat.classList.contains('seat--reserved')).toBe(false);
        expect(service.getReservedSeats()).toHaveLength(0);
    });

    test('clicking booked seat does nothing', () => {
        const app = new SeatBookingApp('testRoom');
        const service = new Service('Avatar', 10);

        app.addService(service);
        app.setCurrentServiceId(service.getId());

        attachSeatEvents(app);

        const seat = document.querySelector('#s-A1-1-1');

        seat.classList.add('seat--booked');
        seat.click();

        expect(service.getReservedSeats()).toHaveLength(0);
    });

    test('mouseover shows seat info and mouseleave removes it', () => {
        const app = new SeatBookingApp('testRoom');

        attachSeatEvents(app);

        const seat = document.querySelector('#s-A1-1-1');

        seat.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

        expect(document.querySelector('.seat__info')).not.toBeNull();
        expect(document.querySelector('.seat__info').textContent).toBe('s-A1-1-1');

        seat.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

        expect(document.querySelector('.seat__info')).toBeNull();
    });
});

describe('screening room auto scale', () => {
    test('scaleScreeningRoomContent scales and centers seats content', () => {
        document.body.innerHTML = `
            <div id="screening-room-1" style="padding-left: 10px; padding-right: 10px;">
                <div id="seats"></div>
            </div>
        `;

        const screeningRoom = document.querySelector('#screening-room-1');
        const seats = document.querySelector('#seats');

        Object.defineProperty(screeningRoom, 'clientWidth', {
            configurable: true,
            value: 300
        });
        Object.defineProperty(seats, 'scrollWidth', {
            configurable: true,
            value: 500
        });

        scaleScreeningRoomContent();

        expect(seats.style.transform).toBe('translateX(20px) scale(0.48)');
    });

    test('scaleScreeningRoomContent exits safely when dimensions are invalid', () => {
        document.body.innerHTML = `
            <div id="screening-room-1">
                <div id="seats"></div>
            </div>
        `;

        const screeningRoom = document.querySelector('#screening-room-1');
        const seats = document.querySelector('#seats');

        Object.defineProperty(screeningRoom, 'clientWidth', {
            configurable: true,
            value: 0
        });
        Object.defineProperty(seats, 'scrollWidth', {
            configurable: true,
            value: 0
        });

        scaleScreeningRoomContent();

        expect(seats.style.transform).toBe('translateX(0px) scale(1)');
    });

    test('setupScreeningRoomAutoScale wires listeners and resize observer callback', () => {
        document.body.innerHTML = `
            <div id="screening-room-1" style="padding-left: 10px; padding-right: 10px;">
                <div id="seats"></div>
            </div>
        `;

        const screeningRoom = document.querySelector('#screening-room-1');
        const seats = document.querySelector('#seats');

        Object.defineProperty(screeningRoom, 'clientWidth', {
            configurable: true,
            value: 300
        });
        Object.defineProperty(seats, 'scrollWidth', {
            configurable: true,
            value: 500
        });

        const resizeCallbacks = [];
        const observe = jest.fn();
        const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
        const rafSpy = jest
            .spyOn(window, 'requestAnimationFrame')
            .mockImplementation((cb) => cb());

        global.ResizeObserver = class {
            constructor(callback) {
                resizeCallbacks.push(callback);
            }
            observe(target) {
                observe(target);
            }
        };

        setupScreeningRoomAutoScale();

        expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
        expect(addEventListenerSpy).toHaveBeenCalledWith('load', expect.any(Function));
        expect(observe).toHaveBeenCalledWith(screeningRoom);
        expect(observe).toHaveBeenCalledWith(seats);
        expect(seats.style.transform).toBe('translateX(20px) scale(0.48)');

        resizeCallbacks[0]();

        expect(rafSpy).toHaveBeenCalled();
    });

    test('setupSeatBookingApp triggers auto scale setup path', () => {
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

        const screeningRoom = document.querySelector('#screening-room-1');
        const seats = document.querySelector('#seats');

        Object.defineProperty(screeningRoom, 'clientWidth', {
            configurable: true,
            value: 300
        });
        Object.defineProperty(seats, 'scrollWidth', {
            configurable: true,
            value: 500
        });

        global.ResizeObserver = class {
            constructor() {}
            observe() {}
        };
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => cb());

        const app = setupSeatBookingApp();

        expect(app).not.toBeNull();
        expect(window.showingRoom1).toBe(app);
    });
});

describe('sanitizeText', () => {
    test('escapes unsafe characters', () => {
        const result = sanitizeText('<img src=x onerror=alert(1)>');

        expect(result).toContain('&lt;img');
        expect(result).toContain('&gt;');
    });
});