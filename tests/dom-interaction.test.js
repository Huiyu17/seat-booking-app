const { SeatBookingApp, Service, Sector } = require('../script/seat-booking-app');

beforeEach(() => {
  document.body.innerHTML = `
    <div id="seat-booking-app">
      <div id="settings" class="settings">
        <div class="services-list">
          <select name="services-list" id="services-list"></select>
          <input type="text" name="service-name" id="service-name">
          <input type="number" name="service-price" id="service-price" min="0" max="100" step="0.01">
        </div>
        <div class="sectors">
          <ul id="sectors-list" class="sectors__list"></ul>
          <button id="sectors-save-btn" class="btn">Save</button>
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
});

describe('Sector Price Editing', () => {
  test('Sector list renders with price inputs', () => {
    const app = new SeatBookingApp('testRoom');
    const sector = new Sector('A1', 1.0, 3);
    
    app.addSector(sector);
    app.setPriceMultipliersArray();
    app.renderSectorsList();
    
    const listContainer = document.querySelector('#sectors-list');
    const inputs = listContainer.querySelectorAll('input');
    const labels = listContainer.querySelectorAll('label');
    
    expect(inputs.length).toBe(1);
    expect(labels.length).toBe(1);
    expect(inputs[0].id).toBe('price-s-A1');
    expect(inputs[0].value).toBe('1');
    expect(labels[0].getAttribute('for')).toBe('price-s-A1');
    expect(labels[0].textContent).toBe('s-A1');
  });

  test('Sector list renders multiple sectors', () => {
    const app = new SeatBookingApp('testRoom');
    const sector1 = new Sector('A1', 1.0, 3);
    const sector2 = new Sector('B1', 1.5, 3);
    const sector3 = new Sector('C1', 2.0, 3);
    
    app.addSector(sector1);
    app.addSector(sector2);
    app.addSector(sector3);
    app.setPriceMultipliersArray();
    app.renderSectorsList();
    
    const inputs = document.querySelectorAll('#sectors-list input');
    
    expect(inputs.length).toBe(3);
    expect(inputs[0].id).toBe('price-s-A1');
    expect(inputs[1].id).toBe('price-s-B1');
    expect(inputs[2].id).toBe('price-s-C1');
    expect(inputs[0].value).toBe('1');
    expect(inputs[1].value).toBe('1.5');
    expect(inputs[2].value).toBe('2');
  });

  test('Sector price multiplier update works correctly', () => {
    const app = new SeatBookingApp('testRoom');
    const sector = new Sector('A1', 1.0, 3);
    
    app.addSector(sector);
    app.setPriceMultipliersArray();
    app.renderSectorsList();
    
    const input = document.querySelector('#price-s-A1');
    input.value = '2.5';
    
    const sectors = app.getSectorsArray();
    const foundSector = sectors.find(s => s.getId() === 's-A1');
    
    expect(foundSector.getPriceMultiplier()).toBe(1.0);
    
    foundSector.setPriceMultiplier(2.5);
    app.setPriceMultipliersArray();
    
    const multipliers = app.getPriceMultipliersArray();
    expect(multipliers[0].priceMultiplier).toBe(2.5);
  });
});

describe('Service List Rendering', () => {
  test('Services list renders options correctly', () => {
    const app = new SeatBookingApp('testRoom');
    const service1 = new Service('Movie 1', 10);
    const service2 = new Service('Movie 2', 15);
    
    app.addService(service1);
    app.addService(service2);
    app.renderServicesList();
    
    const select = document.querySelector('#services-list');
    const options = select.querySelectorAll('option');
    
    expect(options.length).toBe(2);
    expect(options[0].value).toBe(service1.getId());
    expect(options[1].value).toBe(service2.getId());
    expect(options[0].textContent).toBe('Movie 1');
    expect(options[1].textContent).toBe('Movie 2');
  });

  test('Services list updates when service name changes', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Old Name', 10);
    
    app.addService(service);
    app.renderServicesList();
    
    let options = document.querySelectorAll('#services-list option');
    expect(options[0].textContent).toBe('Old Name');
    
    service.setName('New Name');
    app.renderServicesList();
    
    options = document.querySelectorAll('#services-list option');
    expect(options[0].textContent).toBe('New Name');
  });
});

describe('Service Form Data', () => {
  test('Current service data renders to form', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Test Movie', 12.99);
    
    app.addService(service);
    app.setCurrentServiceId(service.getId());
    app.renderCurrentServiceData();
    
    const nameInput = document.querySelector('#service-name');
    const priceInput = document.querySelector('#service-price');
    
    expect(nameInput.value).toBe('Test Movie');
    expect(priceInput.value).toBe('12.99');
  });

  test('Form updates with different service selection', () => {
    const app = new SeatBookingApp('testRoom');
    const service1 = new Service('Movie 1', 10);
    const service2 = new Service('Movie 2', 15);
    
    app.addService(service1);
    app.addService(service2);
    app.setCurrentServiceId(service1.getId());
    app.renderCurrentServiceData();
    
    expect(document.querySelector('#service-name').value).toBe('Movie 1');
    expect(document.querySelector('#service-price').value).toBe('10');
    
    app.setCurrentServiceId(service2.getId());
    app.renderCurrentServiceData();
    
    expect(document.querySelector('#service-name').value).toBe('Movie 2');
    expect(document.querySelector('#service-price').value).toBe('15');
  });
});

describe('Order Details', () => {
  test('Order details updates with reserved seats', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Test', 10);
    const sector = new Sector('A1', 1.0, 3);
    
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
    
    const orderDetails = document.querySelector('#order-details');
    const totalPrice = document.querySelector('#order-total-price');
    
    expect(orderDetails.children.length).toBe(1);
    expect(totalPrice.textContent).toContain('Total price: $10');
  });

  test('Order details clears when no seats reserved', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Test', 10);
    const sector = new Sector('A1', 1.0, 3);
    
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
    
    service.clearReservedSeats();
    app.updateOrderDetails();
    
    expect(document.querySelector('#order-details').children.length).toBe(0);
    expect(document.querySelector('#order-total-price').textContent).toBe('');
  });
});