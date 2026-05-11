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
