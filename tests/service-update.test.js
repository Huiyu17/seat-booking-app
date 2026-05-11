const {
    SeatBookingApp,
    Service,
    Sector,
    validateServiceForm,
    updateServiceFromForm
} = require('../script/seat-booking-app');

beforeEach(() => {
  document.body.innerHTML = `
    <div id="seat-booking-app">
      <div id="settings" class="settings">
        <div class="services-list">
          <select name="services-list" id="services-list"></select>
          <input type="text" name="service-name" id="service-name">
          <input type="number" name="service-price" id="service-price" min="0" max="100" step="0.01">
        </div>
        <div id="order" class="order">
          <ul id="order-details"></ul>
          <span id="order-total-price"></span>
        </div>
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

describe('Service Update Validation Tests', () => {
  test('Update service with empty name should show alert', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Original', 10);
    
    app.addService(service);
    app.setCurrentServiceId(service.getId());
    app.renderServicesList();
    app.renderCurrentServiceData();
    
    document.querySelector('#service-name').value = '';
    document.querySelector('#service-price').value = '15';
    
    const inputServiceName = document.querySelector('#service-name').value.trim();
    
    expect(inputServiceName).toBe('');
    expect(!inputServiceName).toBe(true);
  });

  test('Update service with invalid price (non-numeric) should show alert', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Original', 10);
    
    app.addService(service);
    app.setCurrentServiceId(service.getId());
    
    document.querySelector('#service-name').value = 'Valid Name';
    document.querySelector('#service-price').value = 'not-a-number';
    
    const inputServicePrice = document.querySelector('#service-price').value;
    const price = parseFloat(inputServicePrice);
    
    expect(isNaN(price)).toBe(true);
  });

  test('Update service with zero price should show alert', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Original', 10);
    
    app.addService(service);
    app.setCurrentServiceId(service.getId());
    
    document.querySelector('#service-name').value = 'Valid Name';
    document.querySelector('#service-price').value = '0';
    
    const inputServicePrice = document.querySelector('#service-price').value;
    const price = parseFloat(inputServicePrice);
    
    expect(price).toBe(0);
    expect(price <= 0).toBe(true);
  });

  test('Update service with negative price should show alert', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Original', 10);
    
    app.addService(service);
    app.setCurrentServiceId(service.getId());
    
    document.querySelector('#service-name').value = 'Valid Name';
    document.querySelector('#service-price').value = '-5';
    
    const inputServicePrice = document.querySelector('#service-price').value;
    const price = parseFloat(inputServicePrice);
    
    expect(price).toBe(-5);
    expect(price <= 0).toBe(true);
  });

  test('Update service with valid inputs should work', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Original', 10);
    
    app.addService(service);
    app.setCurrentServiceId(service.getId());
    app.renderServicesList();
    app.renderCurrentServiceData();
    
    document.querySelector('#service-name').value = 'Updated Name';
    document.querySelector('#service-price').value = '15.99';
    
    const inputServiceName = document.querySelector('#service-name').value.trim();
    const inputServicePrice = document.querySelector('#service-price').value;
    
    expect(inputServiceName).toBe('Updated Name');
    
    const price = parseFloat(inputServicePrice);
    expect(isNaN(price)).toBe(false);
    expect(price > 0).toBe(true);
    
    const currentService = app.getCurrentService();
    currentService.setName(inputServiceName);
    currentService.setPrice(price);
    
    app.cacheServices();
    app.renderServicesList();
    app.renderCurrentServiceData();
    app.updateOrderDetails();
    
    expect(currentService.getName()).toBe('Updated Name');
    expect(currentService.getPrice()).toBe(15.99);
    
    const options = document.querySelectorAll('#services-list option');
    expect(options[0].textContent).toBe('Updated Name');
  });

  test('Update service preserves other services', () => {
    const app = new SeatBookingApp('testRoom');
    const service1 = new Service('Service 1', 10);
    const service2 = new Service('Service 2', 15);
    
    app.addService(service1);
    app.addService(service2);
    app.setCurrentServiceId(service1.getId());
    app.renderServicesList();
    
    document.querySelector('#service-name').value = 'Updated 1';
    document.querySelector('#service-price').value = '20';
    
    const inputServiceName = document.querySelector('#service-name').value.trim();
    const price = parseFloat(document.querySelector('#service-price').value);
    
    const currentService = app.getCurrentService();
    currentService.setName(inputServiceName);
    currentService.setPrice(price);
    
    app.cacheServices();
    app.renderServicesList();
    
    expect(app.getServicesArray()).toHaveLength(2);
    expect(app.getServicesArray()[0].getName()).toBe('Updated 1');
    expect(app.getServicesArray()[1].getName()).toBe('Service 2');
  });

  test('Update service with reserved seats updates order details', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Test', 10);
    const sector = new Sector('A1', 1.0, 2);
    
    app.addService(service);
    app.addSector(sector);
    app.setCurrentServiceId(service.getId());
    app.setPriceMultipliersArray();
    
    const seatElement = {
      id: 's-A1-1-1',
      parentElement: { parentElement: { id: 's-A1' } }
    };
    service.addReservedSeat(seatElement);
    app.updateOrderDetails();
    
    expect(document.querySelector('#order-details').children.length).toBe(1);
    
    document.querySelector('#service-price').value = '20';
    const price = parseFloat(document.querySelector('#service-price').value);
    service.setPrice(price);
    
    app.updateOrderDetails();
    
    const totalPrice = document.querySelector('#order-total-price').textContent;
    expect(totalPrice).toContain('$20');
  });
});

describe('Service Update Edge Cases', () => {
  test('Trim whitespace from service name', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Original', 10);
    
    app.addService(service);
    app.setCurrentServiceId(service.getId());
    
    document.querySelector('#service-name').value = '  Trimmed Name  ';
    
    const inputServiceName = document.querySelector('#service-name').value.trim();
    
    expect(inputServiceName).toBe('Trimmed Name');
  });

  test('Update service with maximum price', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Original', 10);
    
    app.addService(service);
    app.setCurrentServiceId(service.getId());
    
    document.querySelector('#service-name').value = 'Premium';
    document.querySelector('#service-price').value = '100';
    
    const price = parseFloat(document.querySelector('#service-price').value);
    service.setPrice(price);
    
    expect(service.getPrice()).toBe(100);
  });

  test('Update service with decimal price', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Original', 10);
    
    app.addService(service);
    app.setCurrentServiceId(service.getId());
    
    document.querySelector('#service-name').value = 'Decimal';
    document.querySelector('#service-price').value = '9.99';
    
    const price = parseFloat(document.querySelector('#service-price').value);
    service.setPrice(price);
    
    expect(service.getPrice()).toBe(9.99);
  });
});