const { SeatBookingApp, Service, Sector } = require('../script/seat-booking-app');

beforeEach(() => {
  document.querySelector('#seats').innerHTML = '';
  document.querySelector('#services-list').innerHTML = '';
  document.querySelector('#order-details').innerHTML = '';
  document.querySelector('#order-total-price').innerHTML = '';
  localStorage.clear();
});

test('Service stores name and price', () => {
  const service = new Service('Inception', 12.5);

  expect(service.getName()).toBe('Inception');
  expect(service.getPrice()).toBe(12.5);
});

test('SeatBookingApp can add and retrieve a service', () => {
  const app = new SeatBookingApp('room1');
  const service = new Service('Interstellar', 10);

  app.addService(service);

  expect(app.getServicesArray()).toHaveLength(1);
  expect(app.getServicesArray()[0].getName()).toBe('Interstellar');
});

test('SeatBookingApp can select the current service', () => {
  const app = new SeatBookingApp('room1');
  const service = new Service('Dune', 15);

  app.addService(service);
  app.setCurrentServiceId(service.getId());

  expect(app.getCurrentService()).toBe(service);
});

test('Service can reserve and clear seats', () => {
  const service = new Service('Tenet', 9);
  const seat = { id: 's-A1-1-1' };

  service.addReservedSeat(seat);

  expect(service.getReservedSeats()).toEqual([seat]);

  service.clearReservedSeats();

  expect(service.getReservedSeats()).toHaveLength(0);
});

test('Sector renders seats into the DOM', () => {
  const sector = new Sector('T1', 1.2, 3);

  sector.renderSector();

  expect(document.querySelector('#s-T1')).not.toBeNull();
  expect(document.querySelectorAll('#s-T1 .seat')).toHaveLength(3);
});

test('SeatBookingApp caches services in localStorage', () => {
  const app = new SeatBookingApp('testRoom');

  app.addService(new Service('Cached Movie', 8));
  app.cacheServices();

  const stored = JSON.parse(localStorage.getItem('sba-services-testRoom'));

  expect(stored).toHaveLength(1);
  expect(stored[0]._name).toBe('Cached Movie');
});

test('SeatBookingApp can update service', () => {
  const app = new SeatBookingApp('room1');
  const service = new Service('Old Name', 10);

  app.addService(service);
  app.setCurrentServiceId(service.getId());

  service.setName('New Name');
  service.setPrice(15);

  expect(service.getName()).toBe('New Name');
  expect(service.getPrice()).toBe(15);
});

test('SeatBookingApp setPriceMultipliersArray clears old data', () => {
  const app = new SeatBookingApp('room1');
  const sector = { getId: () => 's-A1', getPriceMultiplier: () => 1.5 };

  app.addSector(sector);
  app.setPriceMultipliersArray();

  expect(app.getPriceMultipliersArray()).toHaveLength(1);
  expect(app.getPriceMultipliersArray()[0].priceMultiplier).toBe(1.5);

  sector.getPriceMultiplier = () => 2.0;
  app.setPriceMultipliersArray();

  expect(app.getPriceMultipliersArray()).toHaveLength(1);
  expect(app.getPriceMultipliersArray()[0].priceMultiplier).toBe(2.0);
});

test('Service has unique ID', () => {
  const service1 = new Service('Movie 1', 10);
  const service2 = new Service('Movie 2', 15);

  expect(service1.getId()).not.toBe(service2.getId());
  expect(typeof service1.getId()).toBe('string');
});

test('Service can set and get name', () => {
  const service = new Service('Original', 10);

  service.setName('Updated');
  expect(service.getName()).toBe('Updated');
});

test('Service can set and get price', () => {
  const service = new Service('Movie', 10);

  service.setPrice(20);
  expect(service.getPrice()).toBe(20);
});

test('Service can remove reserved seat', () => {
  const service = new Service('Movie', 10);
  const seat1 = { id: 's-A1-1-1' };
  const seat2 = { id: 's-A1-1-2' };

  service.addReservedSeat(seat1);
  service.addReservedSeat(seat2);
  service.removeReservedSeat('s-A1-1-1');

  expect(service.getReservedSeats()).toHaveLength(1);
  expect(service.getReservedSeats()[0].id).toBe('s-A1-1-2');
});

test('Service can book seats and clear reserved', () => {
  const service = new Service('Movie', 10);
  const seat = { id: 's-A1-1-1' };

  service.addReservedSeat(seat);
  service.bookSeats();

  expect(service.getBookedSeats()).toContain('s-A1-1-1');
  expect(service.getReservedSeats()).toHaveLength(0);
});

test('Service can set booked seats array', () => {
  const service = new Service('Movie', 10);
  const bookedSeats = ['s-A1-1-1', 's-A1-1-2'];

  service.setBookedSeatsArray(bookedSeats);

  expect(service.getBookedSeats()).toEqual(bookedSeats);
});

test('Sector can set and get price multiplier', () => {
  const sector = new Sector('A1', 1.0, 10);

  expect(sector.getPriceMultiplier()).toBe(1.0);

  sector.setPriceMultiplier(1.5);
  expect(sector.getPriceMultiplier()).toBe(1.5);
});

test('Sector generates correct ID', () => {
  const sector = new Sector('B2', 1.2, 5);

  expect(sector.getId()).toBe('s-B2');
});

test('Sector creates seats with correct structure', () => {
  const sector = new Sector('C1', 1.5, 3, 4);

  expect(sector.getId()).toBe('s-C1');
  expect(sector.getPriceMultiplier()).toBe(1.5);
  expect(sector._rows).toBe(2);
});

test('SeatBookingApp can get name', () => {
  const app = new SeatBookingApp('MyRoom');

  expect(app.getName()).toBe('MyRoom');
});

test('SeatBookingApp can add sectors', () => {
  const app = new SeatBookingApp('room1');
  const sector = new Sector('A1', 1.2, 10);

  app.addSector(sector);

  expect(app.getSectorsArray()).toHaveLength(1);
  expect(app.getSectorsArray()[0].getId()).toBe('s-A1');
});

test('SeatBookingApp getCurrentService returns undefined for empty services', () => {
  const app = new SeatBookingApp('room1');

  expect(app.getCurrentService()).toBeUndefined();
});

test('SeatBookingApp getCurrentServiceId returns empty string initially', () => {
  const app = new SeatBookingApp('room1');

  expect(app.getCurrentServiceId()).toBe('');
});

test('SeatBookingApp setCurrentServiceId updates current service ID', () => {
  const app = new SeatBookingApp('room1');
  const service = new Service('Movie', 10);

  app.addService(service);
  app.setCurrentServiceId(service.getId());

  expect(app.getCurrentServiceId()).toBe(service.getId());
});

test('SeatBookingApp getPriceMultipliersArray returns empty initially', () => {
  const app = new SeatBookingApp('room1');

  expect(app.getPriceMultipliersArray()).toEqual([]);
});

test('Service removeReservedSeat handles non-existent seat', () => {
  const service = new Service('Movie', 10);

  service.removeReservedSeat('non-existent');

  expect(service.getReservedSeats()).toHaveLength(0);
});

test('Sector with no rows creates empty seats array', () => {
  const sector = new Sector('Empty', 1.0);

  expect(sector._seats).toEqual([]);
});

test('Sector constructor handles single row', () => {
  const sector = new Sector('S1', 1.2, 5);

  expect(sector._rows).toBe(1);
});

test('SeatBookingApp can get services array', () => {
  const app = new SeatBookingApp('room1');
  const service1 = new Service('Movie 1', 10);
  const service2 = new Service('Movie 2', 15);

  app.addService(service1);
  app.addService(service2);

  const services = app.getServicesArray();
  expect(services).toHaveLength(2);
  expect(services[0].getName()).toBe('Movie 1');
  expect(services[1].getName()).toBe('Movie 2');
});

test('Service bookSeats transfers seat IDs to booked array', () => {
  const service = new Service('Movie', 10);
  const seat1 = { id: 's-A1-1-1' };
  const seat2 = { id: 's-A1-1-2' };

  service.addReservedSeat(seat1);
  service.addReservedSeat(seat2);
  service.bookSeats();

  expect(service.getBookedSeats()).toContain('s-A1-1-1');
  expect(service.getBookedSeats()).toContain('s-A1-1-2');
  expect(service.getBookedSeats()).toHaveLength(2);
});

test('Service markBookedSeats updates DOM classes', () => {
  const service = new Service('Movie', 10);
  service.setBookedSeatsArray(['seat-1', 'seat-2']);

  const seat1 = document.createElement('div');
  seat1.id = 'seat-1';
  seat1.classList.add('seat', 'seat--reserved');
  document.querySelector('#seats').appendChild(seat1);

  const seat2 = document.createElement('div');
  seat2.id = 'seat-2';
  seat2.classList.add('seat', 'seat--reserved');
  document.querySelector('#seats').appendChild(seat2);

  const unbookedSeat = document.createElement('div');
  unbookedSeat.id = 'seat-3';
  unbookedSeat.classList.add('seat', 'seat--reserved');
  document.querySelector('#seats').appendChild(unbookedSeat);

  service.markBookedSeats();

  expect(seat1.classList.contains('seat--booked')).toBe(true);
  expect(seat1.classList.contains('seat--reserved')).toBe(false);
  expect(seat2.classList.contains('seat--booked')).toBe(true);
  expect(seat2.classList.contains('seat--reserved')).toBe(false);
  expect(unbookedSeat.classList.contains('seat--reserved')).toBe(true);
});

test('Sector renders correct number of rows', () => {
  const sector = new Sector('R1', 1.0, 3, 4, 5);

  sector.renderSector();

  expect(document.querySelectorAll('#s-R1 .row')).toHaveLength(3);
});

test('Sector creates correct seat IDs', () => {
  const sector = new Sector('S2', 1.2, 2);

  sector.renderSector();

  const seats = document.querySelectorAll('#s-S2 .seat');
  expect(seats).toHaveLength(2);
  expect(seats[0].id).toBe('s-S2-1-1');
  expect(seats[1].id).toBe('s-S2-1-2');
});

test('Sector has sector label', () => {
  const sector = new Sector('L1', 1.5, 5);

  sector.renderSector();

  const label = document.querySelector('#s-L1 .sector__label');
  expect(label).not.toBeNull();
  expect(label.textContent).toBe('s-L1');
});

test('SeatBookingApp setPriceMultipliersArray works with multiple sectors', () => {
  const app = new SeatBookingApp('room1');
  app.addSector({ getId: () => 's-A1', getPriceMultiplier: () => 1.0 });
  app.addSector({ getId: () => 's-A2', getPriceMultiplier: () => 1.5 });
  app.addSector({ getId: () => 's-B1', getPriceMultiplier: () => 2.0 });

  app.setPriceMultipliersArray();

  const multipliers = app.getPriceMultipliersArray();
  expect(multipliers).toHaveLength(3);
  expect(multipliers[0].sector).toBe('s-A1');
  expect(multipliers[0].priceMultiplier).toBe(1.0);
  expect(multipliers[1].sector).toBe('s-A2');
  expect(multipliers[1].priceMultiplier).toBe(1.5);
  expect(multipliers[2].sector).toBe('s-B1');
  expect(multipliers[2].priceMultiplier).toBe(2.0);
});

test('SeatBookingApp can remove service from array', () => {
  const app = new SeatBookingApp('room1');
  const service1 = new Service('Movie 1', 10);
  const service2 = new Service('Movie 2', 15);

  app.addService(service1);
  app.addService(service2);
  app.setCurrentServiceId(service1.getId());

  const services = app.getServicesArray();
  const indexToDelete = services.findIndex(s => s.getId() === service1.getId());
  services.splice(indexToDelete, 1);

  expect(app.getServicesArray()).toHaveLength(1);
  expect(app.getServicesArray()[0].getName()).toBe('Movie 2');
});

test('Sector renders with correct grid area style', () => {
  const sector = new Sector('G1', 1.2, 10);

  sector.renderSector();

  const sectorEl = document.querySelector('#s-G1');
  expect(sectorEl.style.gridArea).toBe('G1');
});

test('Sector with default price multiplier', () => {
  const sector = new Sector('D1', undefined, 5);

  expect(sector.getPriceMultiplier()).toBe(1);
});

test('Service constructor handles price as string', () => {
  const service = new Service('Movie', '15.50');

  expect(service.getPrice()).toBe('15.50');
});
