const {
    SeatBookingApp,
    Service,
    Sector
} = require('../script/seat-booking-app');

beforeEach(() => {
  document.body.innerHTML = `
    <div id="seat-booking-app">
      <input type="text" id="service-name">
      <input type="number" id="service-price">
      <ul id="sectors-list"></ul>
      <ul id="order-details"></ul>
      <span id="order-total-price"></span>
    </div>
  `;
  localStorage.clear();
});

describe('Branch Coverage Tests', () => {
  test('Service price validation - invalid string price', () => {
    const priceInput = 'not-a-number';
    const price = parseFloat(priceInput);

    expect(isNaN(price)).toBe(true);
  });

  test('Service price validation - zero price', () => {
    const service = new Service('Free', 0);

    expect(service.getPrice()).toBe(0);
    expect(service.getPrice() <= 0).toBe(true);
  });

  test('Service price validation - negative price', () => {
    const service = new Service('Negative', -5);

    expect(service.getPrice()).toBe(-5);
    expect(service.getPrice() < 0).toBe(true);
  });

  test('Service price validation - valid positive price', () => {
    const service = new Service('Valid', 10.99);

    expect(service.getPrice()).toBe(10.99);
    expect(service.getPrice() > 0).toBe(true);
  });

  test('Empty service name handling', () => {
    const service = new Service('', 10);

    expect(service.getName()).toBe('');
    expect(service.getName()).toBeFalsy();
  });

  test('Service name with special characters', () => {
    const service = new Service('Movie <>&"', 10);

    expect(service.getName()).toBe('Movie <>&"');
  });

  test('Sector with zero price multiplier', () => {
    const sector = new Sector('A1', 0, 3);

    expect(sector.getPriceMultiplier()).toBe(0);
    expect(sector.getPriceMultiplier() >= 0).toBe(true);
  });

  test('Sector with negative price multiplier', () => {
    const sector = new Sector('A1', -1.5, 3);

    expect(sector.getPriceMultiplier()).toBe(-1.5);
    expect(sector.getPriceMultiplier() < 0).toBe(true);
  });

  test('Sector with normal price multiplier', () => {
    const sector = new Sector('A1', 1.5, 3);

    expect(sector.getPriceMultiplier()).toBe(1.5);
    expect(sector.getPriceMultiplier() > 0).toBe(true);
  });

  test('Fetch services from empty localStorage', () => {
    const app = new SeatBookingApp('emptyRoom');

    app.fetchServices();

    expect(app.getServicesArray()).toHaveLength(0);
  });

  test('Fetch services with valid data', () => {
    const storedData = [
      { _id: 'test-id', _name: 'Test Movie', _price: 10, _seatsBooked: [] }
    ];
    localStorage.setItem('sba-services-testRoom', JSON.stringify(storedData));

    const app = new SeatBookingApp('testRoom');
    app.fetchServices();

    expect(app.getServicesArray()).toHaveLength(1);
    expect(app.getServicesArray()[0].getName()).toBe('Test Movie');
  });

  test('Fetch services with invalid name type', () => {
    const storedData = [
      { _id: 'test-id', _name: 12345, _price: 10, _seatsBooked: [] }
    ];
    localStorage.setItem('sba-services-testRoom', JSON.stringify(storedData));

    const app = new SeatBookingApp('testRoom');
    app.fetchServices();

    expect(app.getServicesArray()).toHaveLength(0);
  });

  test('Fetch services with invalid price type', () => {
    const storedData = [
      { _id: 'test-id', _name: 'Test', _price: 'invalid', _seatsBooked: [] }
    ];
    localStorage.setItem('sba-services-testRoom', JSON.stringify(storedData));

    const app = new SeatBookingApp('testRoom');
    app.fetchServices();

    expect(app.getServicesArray()).toHaveLength(0);
  });

  test('Fetch services with empty name', () => {
    const storedData = [
      { _id: 'test-id', _name: '', _price: 10, _seatsBooked: [] }
    ];
    localStorage.setItem('sba-services-testRoom', JSON.stringify(storedData));

    const app = new SeatBookingApp('testRoom');
    app.fetchServices();

    expect(app.getServicesArray()).toHaveLength(0);
  });

  test('Service without booked seats', () => {
    const service = new Service('Test', 10);

    expect(service.getBookedSeats()).toHaveLength(0);
    expect(service.getBookedSeats()).toEqual([]);
  });

  test('Service with booked seats', () => {
    const service = new Service('Test', 10);
    service.setBookedSeatsArray(['seat1', 'seat2']);

    expect(service.getBookedSeats()).toEqual(['seat1', 'seat2']);
    expect(service.getBookedSeats()).toHaveLength(2);
  });

  test('Service with reserved seats', () => {
    const service = new Service('Test', 10);
    const seat = { id: 'seat1' };

    service.addReservedSeat(seat);

    expect(service.getReservedSeats()).toEqual([seat]);
    expect(service.getReservedSeats()).toHaveLength(1);
  });

  test('Remove reserved seat that exists', () => {
    const service = new Service('Test', 10);
    const seat = { id: 'seat1' };

    service.addReservedSeat(seat);
    service.removeReservedSeat('seat1');

    expect(service.getReservedSeats()).toHaveLength(0);
  });

  test('Remove reserved seat that does not exist', () => {
    const service = new Service('Test', 10);

    service.removeReservedSeat('non-existent');

    expect(service.getReservedSeats()).toHaveLength(0);
  });

  test('App without current service', () => {
    const app = new SeatBookingApp('room1');
    
    expect(app.getCurrentService()).toBeNull();
  });

  test('App with current service', () => {
    const app = new SeatBookingApp('room1');
    const service = new Service('Test', 10);

    app.addService(service);
    app.setCurrentServiceId(service.getId());

    expect(app.getCurrentService()).toBe(service);
  });

  test('Clear reserved seats when none exist', () => {
    const service = new Service('Test', 10);

    service.clearReservedSeats();

    expect(service.getReservedSeats()).toHaveLength(0);
  });

  test('Clear reserved seats when some exist', () => {
    const service = new Service('Test', 10);

    service.addReservedSeat({ id: 'seat1' });
    service.addReservedSeat({ id: 'seat2' });
    service.clearReservedSeats();

    expect(service.getReservedSeats()).toHaveLength(0);
  });

  test('Book seats when none reserved', () => {
    const service = new Service('Test', 10);

    service.bookSeats();

    expect(service.getBookedSeats()).toHaveLength(0);
    expect(service.getReservedSeats()).toHaveLength(0);
  });

  test('Book seats when some reserved', () => {
    const service = new Service('Test', 10);

    service.addReservedSeat({ id: 'seat1' });
    service.addReservedSeat({ id: 'seat2' });
    service.bookSeats();

    expect(service.getBookedSeats()).toEqual(['seat1', 'seat2']);
    expect(service.getReservedSeats()).toHaveLength(0);
  });
});
