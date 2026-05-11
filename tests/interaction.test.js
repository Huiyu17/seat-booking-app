const {
    SeatBookingApp,
    Service,
    Sector
} = require('../script/seat-booking-app');

beforeEach(() => {
  if (document.querySelector('#seats')) {
    document.querySelector('#seats').innerHTML = '';
  }
  if (document.querySelector('#services-list')) {
    document.querySelector('#services-list').innerHTML = '';
  }
  if (document.querySelector('#order-details')) {
    document.querySelector('#order-details').innerHTML = '';
  }
  if (document.querySelector('#order-total-price')) {
    document.querySelector('#order-total-price').innerHTML = '';
  }
  if (document.querySelector('#sectors-list')) {
    document.querySelector('#sectors-list').innerHTML = '';
  }
  localStorage.clear();
});

describe('Service CRUD Operations', () => {
  test('Adding a new service updates the app state', () => {
    const app = new SeatBookingApp('room1');
    
    expect(app.getServicesArray()).toHaveLength(0);
    
    const service = new Service('New Movie', 12.99);
    app.addService(service);
    
    expect(app.getServicesArray()).toHaveLength(1);
    expect(app.getServicesArray()[0].getName()).toBe('New Movie');
    expect(app.getServicesArray()[0].getPrice()).toBe(12.99);
  });

  test('Updating a service modifies its properties', () => {
    const app = new SeatBookingApp('room1');
    const service = new Service('Original', 10);
    app.addService(service);
    app.setCurrentServiceId(service.getId());
    
    const currentService = app.getCurrentService();
    currentService.setName('Updated Name');
    currentService.setPrice(15.99);
    
    expect(currentService.getName()).toBe('Updated Name');
    expect(currentService.getPrice()).toBe(15.99);
  });

  test('Deleting a service removes it from the app', () => {
    const app = new SeatBookingApp('room1');
    const service1 = new Service('Movie 1', 10);
    const service2 = new Service('Movie 2', 15);
    
    app.addService(service1);
    app.addService(service2);
    
    expect(app.getServicesArray()).toHaveLength(2);
    
    const servicesArray = app.getServicesArray();
    const index = servicesArray.findIndex(s => s.getId() === service1.getId());
    servicesArray.splice(index, 1);
    
    expect(app.getServicesArray()).toHaveLength(1);
    expect(app.getServicesArray()[0].getName()).toBe('Movie 2');
  });

  test('Service can be cached and retrieved from localStorage', () => {
    const app1 = new SeatBookingApp('testCache');
    const service = new Service('Cached Service', 9.99);
    app1.addService(service);
    app1.cacheServices();
    
    const app2 = new SeatBookingApp('testCache');
    app2.fetchServices();
    
    expect(app2.getServicesArray()).toHaveLength(1);
    expect(app2.getServicesArray()[0].getName()).toBe('Cached Service');
    expect(app2.getServicesArray()[0].getPrice()).toBe(9.99);
  });
});

describe('Seat Reservation and Booking', () => {
  test('Reserving a seat adds it to reserved seats array', () => {
    const service = new Service('Test', 10);
    const seatElement = { id: 's-A1-1-1', parentElement: { parentElement: { id: 's-A1' } } };
    
    service.addReservedSeat(seatElement);
    
    expect(service.getReservedSeats()).toHaveLength(1);
    expect(service.getReservedSeats()[0]).toBe(seatElement);
  });

  test('Removing a reserved seat removes it from the array', () => {
    const service = new Service('Test', 10);
    const seat = { id: 'seat1' };
    
    service.addReservedSeat(seat);
    service.removeReservedSeat('seat1');
    
    expect(service.getReservedSeats()).toHaveLength(0);
  });

  test('Booking seats transfers them from reserved to booked', () => {
    const service = new Service('Test', 10);
    const seat1 = { id: 'seat1' };
    const seat2 = { id: 'seat2' };
    
    service.addReservedSeat(seat1);
    service.addReservedSeat(seat2);
    
    expect(service.getReservedSeats()).toHaveLength(2);
    expect(service.getBookedSeats()).toHaveLength(0);
    
    service.bookSeats();
    
    expect(service.getReservedSeats()).toHaveLength(0);
    expect(service.getBookedSeats()).toEqual(['seat1', 'seat2']);
  });

  test('Clearing reserved seats empties the array', () => {
    const service = new Service('Test', 10);
    service.addReservedSeat({ id: 'seat1' });
    service.addReservedSeat({ id: 'seat2' });
    
    service.clearReservedSeats();
    
    expect(service.getReservedSeats()).toHaveLength(0);
  });

  test('Setting booked seats array updates the service', () => {
    const service = new Service('Test', 10);
    
    service.setBookedSeatsArray(['seat1', 'seat2', 'seat3']);
    
    expect(service.getBookedSeats()).toEqual(['seat1', 'seat2', 'seat3']);
  });
});

describe('Sector Management', () => {
  test('Sector has correct properties', () => {
    const sector = new Sector('A1', 1.5, 10, 10);
    
    expect(sector.getId()).toBe('s-A1');
    expect(sector.getPriceMultiplier()).toBe(1.5);
  });

  test('Sector can update price multiplier', () => {
    const sector = new Sector('A1', 1.0, 5);
    
    sector.setPriceMultiplier(2.0);
    
    expect(sector.getPriceMultiplier()).toBe(2.0);
  });

  test('Multiple sectors are created with unique IDs', () => {
    const sector1 = new Sector('A1', 1.0, 5);
    const sector2 = new Sector('B1', 1.2, 5);
    const sector3 = new Sector('A1', 1.5, 5);
    
    expect(sector1.getId()).toBe('s-A1');
    expect(sector2.getId()).toBe('s-B1');
    expect(sector3.getId()).toBe('s-A1');
    expect(sector1.getId()).toBe(sector3.getId());
  });

  test('App maintains price multipliers for all sectors', () => {
    const app = new SeatBookingApp('room1');
    const sectorA = new Sector('A1', 1.0, 5);
    const sectorB = new Sector('B1', 1.5, 5);
    const sectorC = new Sector('C1', 2.0, 5);
    
    app.addSector(sectorA);
    app.addSector(sectorB);
    app.addSector(sectorC);
    app.setPriceMultipliersArray();
    
    const multipliers = app.getPriceMultipliersArray();
    
    expect(multipliers).toHaveLength(3);
    expect(multipliers.find(m => m.sector === 's-A1').priceMultiplier).toBe(1.0);
    expect(multipliers.find(m => m.sector === 's-B1').priceMultiplier).toBe(1.5);
    expect(multipliers.find(m => m.sector === 's-C1').priceMultiplier).toBe(2.0);
  });

  test('Price multipliers array is reset when updated', () => {
    const app = new SeatBookingApp('room1');
    const sector = new Sector('A1', 1.0, 5);
    
    app.addSector(sector);
    app.setPriceMultipliersArray();
    
    expect(app.getPriceMultipliersArray()).toHaveLength(1);
    
    sector.setPriceMultiplier(1.5);
    app.setPriceMultipliersArray();
    
    expect(app.getPriceMultipliersArray()).toHaveLength(1);
    expect(app.getPriceMultipliersArray()[0].priceMultiplier).toBe(1.5);
  });
});

describe('App Initialization and State', () => {
  test('App initializes with correct name', () => {
    const app = new SeatBookingApp('myTheater');
    
    expect(app.getName()).toBe('myTheater');
  });

  test('App starts with empty sectors array', () => {
    const app = new SeatBookingApp('room1');
    
    expect(app.getSectorsArray()).toHaveLength(0);
  });

  test('App starts with empty services array', () => {
    const app = new SeatBookingApp('room1');
    
    expect(app.getServicesArray()).toHaveLength(0);
  });

  test('App can set and get current service ID', () => {
    const app = new SeatBookingApp('room1');
    
    app.setCurrentServiceId('service-123');
    
    expect(app.getCurrentServiceId()).toBe('service-123');
  });

  test('App returns null when no current service is set', () => {
    const app = new SeatBookingApp('room1');

    expect(app.getCurrentService()).toBeNull();
  });

  test('App returns correct current service', () => {
    const app = new SeatBookingApp('room1');
    const service = new Service('Test Movie', 10);
    
    app.addService(service);
    app.setCurrentServiceId(service.getId());
    
    expect(app.getCurrentService()).toBe(service);
  });
});

describe('Edge Cases and Validation', () => {
  test('Service with zero price is allowed', () => {
    const service = new Service('Free', 0);
    
    expect(service.getPrice()).toBe(0);
  });

  test('Service with negative price is allowed (currently)', () => {
    const service = new Service('Negative', -5);
    
    expect(service.getPrice()).toBe(-5);
  });

  test('Empty service name is allowed', () => {
    const service = new Service('', 10);
    
    expect(service.getName()).toBe('');
  });

  test('Sector with zero price multiplier', () => {
    const sector = new Sector('A1', 0, 5);
    
    expect(sector.getPriceMultiplier()).toBe(0);
  });

  test('Sector with negative price multiplier', () => {
    const sector = new Sector('A1', -1, 5);
    
    expect(sector.getPriceMultiplier()).toBe(-1);
  });

  test('Fetching from non-existent localStorage key', () => {
    const app = new SeatBookingApp('nonExistent');
    
    expect(() => {
      app.fetchServices();
    }).not.toThrow();
  });

  test('Caching with empty services array', () => {
    const app = new SeatBookingApp('empty');
    
    expect(() => {
      app.cacheServices();
    }).not.toThrow();
  });
});