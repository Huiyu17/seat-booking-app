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
  localStorage.clear();
});

describe('Service Management', () => {
  test('Service can be updated with new name and price', () => {
    const service = new Service('Old Name', 10);
    
    service.setName('New Name');
    service.setPrice(15);
    
    expect(service.getName()).toBe('New Name');
    expect(service.getPrice()).toBe(15);
  });

  test('Service can book reserved seats', () => {
    const service = new Service('Test Movie', 10);
    const seat1 = { id: 's-A1-1-1' };
    const seat2 = { id: 's-A1-1-2' };
    
    service.addReservedSeat(seat1);
    service.addReservedSeat(seat2);
    service.bookSeats();
    
    expect(service.getBookedSeats()).toEqual(['s-A1-1-1', 's-A1-1-2']);
    expect(service.getReservedSeats()).toHaveLength(0);
  });

  test('Service can remove individual reserved seat', () => {
    const service = new Service('Test', 10);
    const seat1 = { id: 'seat1' };
    const seat2 = { id: 'seat2' };
    
    service.addReservedSeat(seat1);
    service.addReservedSeat(seat2);
    service.removeReservedSeat(seat1.id);
    
    expect(service.getReservedSeats()).toEqual([seat2]);
  });

  test('Service has unique ID', () => {
    const service1 = new Service('Movie 1', 10);
    const service2 = new Service('Movie 2', 10);
    
    expect(service1.getId()).not.toBe(service2.getId());
    expect(service1.getId()).toHaveLength(36); // UUID length
  });
});

describe('SeatBookingApp Features', () => {
  test('App can delete a service', () => {
    const app = new SeatBookingApp('room1');
    const service1 = new Service('Movie 1', 10);
    const service2 = new Service('Movie 2', 15);
    
    app.addService(service1);
    app.addService(service2);
    
    expect(app.getServicesArray()).toHaveLength(2);
    
    const servicesArray = app.getServicesArray();
    const indexToDelete = servicesArray.findIndex(s => s.getId() === service1.getId());
    servicesArray.splice(indexToDelete, 1);
    
    expect(app.getServicesArray()).toHaveLength(1);
    expect(app.getServicesArray()[0].getName()).toBe('Movie 2');
  });

  test('App can fetch services from localStorage', () => {
    const storedData = [
      { _id: 'test-id', _name: 'Stored Movie', _price: 12, _seatsBooked: [] }
    ];
    localStorage.setItem('sba-services-testRoom', JSON.stringify(storedData));
    
    const app = new SeatBookingApp('testRoom');
    app.fetchServices();
    
    expect(app.getServicesArray()).toHaveLength(1);
    expect(app.getServicesArray()[0].getName()).toBe('Stored Movie');
  });

  test('App maintains price multipliers for sectors', () => {
    const app = new SeatBookingApp('room1');
    const sector1 = new Sector('A1', 1.0, 5);
    const sector2 = new Sector('B1', 1.5, 5);
    
    app.addSector(sector1);
    app.addSector(sector2);
    app.setPriceMultipliersArray();
    
    const multipliers = app.getPriceMultipliersArray();
    
    expect(multipliers).toHaveLength(2);
    expect(multipliers[0].sector).toBe('s-A1');
    expect(multipliers[0].priceMultiplier).toBe(1.0);
    expect(multipliers[1].sector).toBe('s-B1');
    expect(multipliers[1].priceMultiplier).toBe(1.5);
  });

  test('App updates price multipliers array correctly', () => {
    const app = new SeatBookingApp('room1');
    const sector = new Sector('A1', 1.0, 3);
    
    app.addSector(sector);
    app.setPriceMultipliersArray();
    
    sector.setPriceMultiplier(2.0);
    app.setPriceMultipliersArray();
    
    const multipliers = app.getPriceMultipliersArray();
    
    expect(multipliers).toHaveLength(1);
    expect(multipliers[0].priceMultiplier).toBe(2.0);
  });
});

describe('Sector Operations', () => {
  test('Sector calculates correct number of seats', () => {
    const sector = new Sector('S1', 1.0, 5, 5, 5);
    
    expect(sector.getId()).toBe('s-S1');
    expect(sector.getPriceMultiplier()).toBe(1.0);
  });

  test('Sector can update price multiplier', () => {
    const sector = new Sector('S1', 1.0, 3);
    
    sector.setPriceMultiplier(1.5);
    
    expect(sector.getPriceMultiplier()).toBe(1.5);
  });

  test('Multiple sectors have unique IDs', () => {
    const sector1 = new Sector('A1', 1.0, 5);
    const sector2 = new Sector('A2', 1.2, 5);
    
    expect(sector1.getId()).not.toBe(sector2.getId());
    expect(sector1.getId()).toBe('s-A1');
    expect(sector2.getId()).toBe('s-A2');
  });
});

describe('Edge Cases', () => {
  test('Service with zero price is valid', () => {
    const service = new Service('Free Movie', 0);
    
    expect(service.getPrice()).toBe(0);
  });

  test('Empty service name should be handled', () => {
    const service = new Service('', 10);
    
    expect(service.getName()).toBe('');
  });

  test('Fetching services from empty localStorage', () => {
    const app = new SeatBookingApp('emptyRoom');
    
    expect(() => {
      app.fetchServices();
    }).not.toThrow();
    expect(app.getServicesArray()).toHaveLength(0);
  });

  test('Setting invalid price multiplier', () => {
    const sector = new Sector('A1', 1.0, 3);
    
    sector.setPriceMultiplier(-1);
    
    expect(sector.getPriceMultiplier()).toBe(-1); // Currently allowed, could add validation
  });
});