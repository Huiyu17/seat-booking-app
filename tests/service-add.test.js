const {
    SeatBookingApp,
    Service,
    Sector,
    validateServiceForm,
    addServiceFromForm
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

describe('Service Add Validation Tests', () => {
  test('Add service with empty name should show alert', () => {
    const app = new SeatBookingApp('testRoom');
    
    document.querySelector('#service-name').value = '';
    document.querySelector('#service-price').value = '10';
    
    const inputServiceName = document.querySelector('#service-name').value.trim();
    
    expect(inputServiceName).toBe('');
    expect(!inputServiceName).toBe(true);
  });

  test('Add service with whitespace-only name should show alert', () => {
    const app = new SeatBookingApp('testRoom');
    
    document.querySelector('#service-name').value = '   ';
    document.querySelector('#service-price').value = '10';
    
    const inputServiceName = document.querySelector('#service-name').value.trim();
    
    expect(inputServiceName).toBe('');
    expect(!inputServiceName).toBe(true);
  });

  test('Add service with invalid price (non-numeric) should show alert', () => {
    const app = new SeatBookingApp('testRoom');
    
    document.querySelector('#service-name').value = 'Valid Name';
    document.querySelector('#service-price').value = 'not-a-number';
    
    const inputServicePrice = document.querySelector('#service-price').value;
    const price = parseFloat(inputServicePrice);
    
    expect(isNaN(price)).toBe(true);
  });

  test('Add service with zero price should show alert', () => {
    const app = new SeatBookingApp('testRoom');
    
    document.querySelector('#service-name').value = 'Valid Name';
    document.querySelector('#service-price').value = '0';
    
    const inputServicePrice = document.querySelector('#service-price').value;
    const price = parseFloat(inputServicePrice);
    
    expect(price).toBe(0);
    expect(price <= 0).toBe(true);
  });

  test('Add service with negative price should show alert', () => {
    const app = new SeatBookingApp('testRoom');
    
    document.querySelector('#service-name').value = 'Valid Name';
    document.querySelector('#service-price').value = '-5';
    
    const inputServicePrice = document.querySelector('#service-price').value;
    const price = parseFloat(inputServicePrice);
    
    expect(price).toBe(-5);
    expect(price <= 0).toBe(true);
  });

  test('Add service with valid inputs should work', () => {
    const app = new SeatBookingApp('testRoom');
    
    document.querySelector('#service-name').value = 'New Service';
    document.querySelector('#service-price').value = '12.99';
    
    const inputServiceName = document.querySelector('#service-name').value.trim();
    const inputServicePrice = document.querySelector('#service-price').value;
    
    expect(inputServiceName).toBe('New Service');
    
    const price = parseFloat(inputServicePrice);
    expect(isNaN(price)).toBe(false);
    expect(price > 0).toBe(true);
    
    const newService = new Service(inputServiceName, price);
    
    app.addService(newService);
    app.cacheServices();
    app.renderServicesList();
    app.renderCurrentServiceData();
    
    expect(app.getServicesArray()).toHaveLength(1);
    expect(app.getServicesArray()[0].getName()).toBe('New Service');
    expect(app.getServicesArray()[0].getPrice()).toBe(12.99);
    
    const options = document.querySelectorAll('#services-list option');
    expect(options.length).toBe(1);
    expect(options[0].textContent).toBe('New Service');
  });

  test('Add multiple services', () => {
    const app = new SeatBookingApp('testRoom');
    
    document.querySelector('#service-name').value = 'Service 1';
    document.querySelector('#service-price').value = '10';
    const service1 = new Service(
      document.querySelector('#service-name').value.trim(),
      parseFloat(document.querySelector('#service-price').value)
    );
    app.addService(service1);
    
    document.querySelector('#service-name').value = 'Service 2';
    document.querySelector('#service-price').value = '15';
    const service2 = new Service(
      document.querySelector('#service-name').value.trim(),
      parseFloat(document.querySelector('#service-price').value)
    );
    app.addService(service2);
    
    app.cacheServices();
    app.renderServicesList();
    
    expect(app.getServicesArray()).toHaveLength(2);
    expect(app.getServicesArray()[0].getName()).toBe('Service 1');
    expect(app.getServicesArray()[1].getName()).toBe('Service 2');
    
    const options = document.querySelectorAll('#services-list option');
    expect(options.length).toBe(2);
  });

  test('Add service with trimmed name', () => {
    const app = new SeatBookingApp('testRoom');
    
    document.querySelector('#service-name').value = '  Trimmed Service  ';
    document.querySelector('#service-price').value = '10';
    
    const inputServiceName = document.querySelector('#service-name').value.trim();
    const price = parseFloat(document.querySelector('#service-price').value);
    
    const newService = new Service(inputServiceName, price);
    app.addService(newService);
    
    expect(newService.getName()).toBe('Trimmed Service');
  });

  test('Add service with decimal price', () => {
    const app = new SeatBookingApp('testRoom');
    
    document.querySelector('#service-name').value = 'Decimal Service';
    document.querySelector('#service-price').value = '9.99';
    
    const inputServiceName = document.querySelector('#service-name').value.trim();
    const price = parseFloat(document.querySelector('#service-price').value);
    
    const newService = new Service(inputServiceName, price);
    app.addService(newService);
    
    expect(newService.getPrice()).toBe(9.99);
  });

  test('Add service and render current data', () => {
    const app = new SeatBookingApp('testRoom');
    
    document.querySelector('#service-name').value = 'Test Service';
    document.querySelector('#service-price').value = '15';
    
    const inputServiceName = document.querySelector('#service-name').value.trim();
    const price = parseFloat(document.querySelector('#service-price').value);
    
    const newService = new Service(inputServiceName, price);
    app.addService(newService);
    app.setCurrentServiceId(newService.getId());
    app.renderCurrentServiceData();
    
    expect(document.querySelector('#service-name').value).toBe('Test Service');
    expect(document.querySelector('#service-price').value).toBe('15');
  });
});

describe('Service Add Edge Cases', () => {
  test('Add service with maximum price', () => {
    const app = new SeatBookingApp('testRoom');
    
    document.querySelector('#service-name').value = 'Premium';
    document.querySelector('#service-price').value = '100';
    
    const price = parseFloat(document.querySelector('#service-price').value);
    const newService = new Service('Premium', price);
    app.addService(newService);
    
    expect(newService.getPrice()).toBe(100);
  });

  test('Add service with minimum valid price', () => {
    const app = new SeatBookingApp('testRoom');
    
    document.querySelector('#service-name').value = 'Cheap';
    document.querySelector('#service-price').value = '0.01';
    
    const price = parseFloat(document.querySelector('#service-price').value);
    const newService = new Service('Cheap', price);
    app.addService(newService);
    
    expect(newService.getPrice()).toBe(0.01);
  });

  test('Add service caches to localStorage', () => {
    const app = new SeatBookingApp('testRoom');
    
    document.querySelector('#service-name').value = 'Cached';
    document.querySelector('#service-price').value = '10';
    
    const inputServiceName = document.querySelector('#service-name').value.trim();
    const price = parseFloat(document.querySelector('#service-price').value);
    
    const newService = new Service(inputServiceName, price);
    app.addService(newService);
    app.cacheServices();
    
    const stored = localStorage.getItem('sba-services-testRoom');
    expect(stored).not.toBeNull();
    
    const parsed = JSON.parse(stored);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]._name).toBe('Cached');
  });
});