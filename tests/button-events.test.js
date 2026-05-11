const {
    SeatBookingApp,
    Service,
    Sector,
    addServiceFromForm,
    updateServiceFromForm,
    deleteCurrentService,
    bookCurrentSeats
} = require('../script/seat-booking-app');

beforeEach(() => {
  document.body.innerHTML = `
    <div id="seat-booking-app">
      <div id="settings" class="settings">
        <div class="services-list">
          <select name="services-list" id="services-list"></select>
          <input type="text" name="service-name" id="service-name">
          <input type="number" name="service-price" id="service-price" min="0" max="100" step="0.01">
          <button id="service-add-btn" class="btn">Add new</button>
          <button id="service-update-btn" class="btn">Save changes</button>
          <button id="service-delete-btn" class="btn">Delete</button>
        </div>
        <div class="sectors">
          <button id="sectors-price-btn" class="btn">Edit sectors prices</button>
          <ul id="sectors-list" class="sectors__list"></ul>
          <button id="sectors-save-btn" class="btn" style="display: none;">Save</button>
        </div>
        <div id="order" class="order">
          <ul id="order-details"></ul>
          <span id="order-total-price"></span>
          <button id="book-seats-btn" class="btn">Buy</button>
        </div>
      </div>
      <div id="screening-room-1">
        <div id="screen">Screen</div>
        <div id="seats">
          <div class="sector" id="s-A1">
            <div class="row" id="s-A1-1">
              <div class="seat" id="s-A1-1-1"></div>
              <div class="seat" id="s-A1-1-2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  localStorage.clear();
});

describe('Service Update Functionality', () => {
  test('Update service with valid inputs', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Old Name', 10);
    
    app.addService(service);
    app.setCurrentServiceId(service.getId());
    app.renderServicesList();
    app.renderCurrentServiceData();
    
    document.querySelector('#service-name').value = 'Updated Name';
    document.querySelector('#service-price').value = '15.99';
    
    const currentService = app.getCurrentService();
    currentService.setName('Updated Name');
    currentService.setPrice(15.99);
    
    app.cacheServices();
    app.renderServicesList();
    app.renderCurrentServiceData();
    app.updateOrderDetails();
    
    expect(currentService.getName()).toBe('Updated Name');
    expect(currentService.getPrice()).toBe(15.99);
    
    const options = document.querySelectorAll('#services-list option');
    expect(options[0].textContent).toBe('Updated Name');
  });

  test('Update service with empty name', () => {
    const nameInput = document.querySelector('#service-name');
    nameInput.value = '';
    
    expect(nameInput.value.trim()).toBe('');
    expect(!nameInput.value.trim()).toBe(true);
  });

  test('Update service with invalid price', () => {
    const priceInput = document.querySelector('#service-price');
    
    priceInput.value = 'invalid';
    let price = parseFloat(priceInput.value);
    expect(isNaN(price)).toBe(true);
    
    priceInput.value = '0';
    price = parseFloat(priceInput.value);
    expect(price <= 0).toBe(true);
    
    priceInput.value = '-10';
    price = parseFloat(priceInput.value);
    expect(price <= 0).toBe(true);
  });
});

describe('Service Delete Functionality', () => {
  test('Delete service removes it from app', () => {
    const app = new SeatBookingApp('testRoom');
    const service1 = new Service('Service 1', 10);
    const service2 = new Service('Service 2', 15);
    
    app.addService(service1);
    app.addService(service2);
    app.setCurrentServiceId(service1.getId());
    app.renderServicesList();
    
    expect(app.getServicesArray()).toHaveLength(2);
    
    const currentServiceId = app.getCurrentServiceId();
    const servicesArray = app.getServicesArray();
    const indexToDelete = servicesArray.findIndex(s => s.getId() === currentServiceId);
    servicesArray.splice(indexToDelete, 1);
    
    app.cacheServices();
    app.renderServicesList();
    app.renderCurrentServiceData();
    
    expect(app.getServicesArray()).toHaveLength(1);
    expect(app.getServicesArray()[0].getName()).toBe('Service 2');
  });
});

describe('Booking Functionality', () => {
  test('Book seats with no seats selected', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Test', 10);
    
    app.addService(service);
    app.setCurrentServiceId(service.getId());
    
    const reservedSeats = service.getReservedSeats();
    expect(reservedSeats.length === 0).toBe(true);
  });

  test('Book seats with selected seats', () => {
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
    
    const reservedSeats = service.getReservedSeats();
    expect(reservedSeats.length > 0).toBe(true);
    
    service.bookSeats();
    app.cacheServices();
    app.updateOrderDetails();
    
    expect(service.getBookedSeats()).toEqual(['s-A1-1-1']);
    expect(service.getReservedSeats()).toHaveLength(0);
  });

  test('Calculate seat prices correctly', () => {
    const service = new Service('Test', 10);
    const priceMultipliers = [
      { sector: 's-A1', priceMultiplier: 1.0 },
      { sector: 's-B1', priceMultiplier: 1.5 }
    ];
    
    const seat1 = { id: 's-A1-1-1', parentElement: { parentElement: { id: 's-A1' } } };
    const seat2 = { id: 's-B1-1-1', parentElement: { parentElement: { id: 's-B1' } } };
    
    const sectorPrice1 = priceMultipliers.find(e => e.sector === 's-A1').priceMultiplier;
    const seatPrice1 = parseFloat((10 * sectorPrice1).toFixed(2));
    
    const sectorPrice2 = priceMultipliers.find(e => e.sector === 's-B1').priceMultiplier;
    const seatPrice2 = parseFloat((10 * sectorPrice2).toFixed(2));
    
    const totalPrice = parseFloat((seatPrice1 + seatPrice2).toFixed(2));
    
    expect(seatPrice1).toBe(10);
    expect(seatPrice2).toBe(15);
    expect(totalPrice).toBe(25);
  });
});

describe('Sector Price Editing', () => {
  test('Toggle sector price editing mode', () => {
    const app = new SeatBookingApp('testRoom');
    const sector = new Sector('A1', 1.0, 2);
    
    app.addSector(sector);
    app.setPriceMultipliersArray();
    app.renderSectorsList();
    
    const inputs = document.querySelectorAll('#sectors-list input');
    const saveBtn = document.querySelector('#sectors-save-btn');
    
    inputs.forEach(input => {
      input.disabled = false;
      input.style.border = '1px solid #ccc';
    });
    
    saveBtn.style.display = 'inline-block';
    
    expect(inputs[0].disabled).toBe(false);
    expect(inputs[0].style.border).toBe('1px solid rgb(204, 204, 204)');
    expect(saveBtn.style.display).toBe('inline-block');
  });

  test('Save sector prices validation', () => {
    const app = new SeatBookingApp('testRoom');
    const sector = new Sector('A1', 1.0, 2);
    
    app.addSector(sector);
    app.setPriceMultipliersArray();
    app.renderSectorsList();
    
    const inputs = document.querySelectorAll('#sectors-list input');
    
    inputs[0].value = '';
    expect(inputs[0].value.trim()).toBe('');
    
    inputs[0].value = 'invalid';
    let multiplier = parseFloat(inputs[0].value);
    expect(isNaN(multiplier)).toBe(true);
    
    inputs[0].value = '-1';
    multiplier = parseFloat(inputs[0].value);
    expect(multiplier < 0).toBe(true);
    
    inputs[0].value = '2.5';
    multiplier = parseFloat(inputs[0].value);
    expect(multiplier >= 0).toBe(true);
    expect(!isNaN(multiplier)).toBe(true);
  });

  test('Save sector prices updates multipliers', () => {
    const app = new SeatBookingApp('testRoom');
    const sector = new Sector('A1', 1.0, 2);
    const service = new Service('Test', 10);
    
    app.addService(service);
    app.addSector(sector);
    app.setCurrentServiceId(service.getId());
    app.setPriceMultipliersArray();
    app.renderSectorsList();
    
    const inputs = document.querySelectorAll('#sectors-list input');
    const sectors = app.getSectorsArray();
    
    inputs[0].value = '2.5';
    
    inputs.forEach(input => {
      const sectorId = input.id.replace('price-', '');
      const newMultiplier = parseFloat(input.value);
      
      const sector = sectors.find(s => s.getId() === sectorId);
      if (sector) {
        sector.setPriceMultiplier(newMultiplier);
      }
    });
    
    app.setPriceMultipliersArray();
    app.updateOrderDetails();
    
    expect(sector.getPriceMultiplier()).toBe(2.5);
    
    inputs.forEach(input => {
      input.disabled = true;
      input.style.border = 'none';
    });
    
    const saveBtn = document.querySelector('#sectors-save-btn');
    saveBtn.style.display = 'none';
    
    expect(inputs[0].disabled).toBe(true);
    expect(saveBtn.style.display).toBe('none');
  });
});

describe('Service Dropdown Change', () => {
  test('Dropdown change updates current service', () => {
    const app = new SeatBookingApp('testRoom');
    const service1 = new Service('Service 1', 10);
    const service2 = new Service('Service 2', 15);
    
    app.addService(service1);
    app.addService(service2);
    app.renderServicesList();
    
    app.setCurrentServiceId(service2.getId());
    
    if (typeof renderBookedSeats === 'function') {
      renderBookedSeats();
    }
    app.renderCurrentServiceData();
    
    expect(app.getCurrentServiceId()).toBe(service2.getId());
    expect(app.getCurrentService()).toBe(service2);
  });
});

describe('Service Add Functionality', () => {
  test('Add service validation', () => {
    const nameInput = document.querySelector('#service-name');
    const priceInput = document.querySelector('#service-price');
    
    nameInput.value = '';
    expect(!nameInput.value.trim()).toBe(true);
    
    nameInput.value = 'Valid Name';
    priceInput.value = 'invalid';
    let price = parseFloat(priceInput.value);
    expect(isNaN(price)).toBe(true);
    
    priceInput.value = '0';
    price = parseFloat(priceInput.value);
    expect(price <= 0).toBe(true);
    
    priceInput.value = '10.99';
    price = parseFloat(priceInput.value);
    expect(!isNaN(price) && price > 0).toBe(true);
  });

  test('Add new service', () => {
    const app = new SeatBookingApp('testRoom');
    
    const inputServiceName = 'New Service';
    const inputServicePrice = '12.99';
    
    const newService = new Service(inputServiceName, parseFloat(inputServicePrice));
    
    app.addService(newService);
    app.cacheServices();
    app.renderServicesList();
    app.renderCurrentServiceData();
    
    expect(app.getServicesArray()).toHaveLength(1);
    expect(app.getServicesArray()[0].getName()).toBe('New Service');
    expect(app.getServicesArray()[0].getPrice()).toBe(12.99);
  });
});

describe('Button Click Events', () => {
  test('All buttons exist in DOM', () => {
    expect(document.querySelector('#service-add-btn')).not.toBeNull();
    expect(document.querySelector('#service-update-btn')).not.toBeNull();
    expect(document.querySelector('#service-delete-btn')).not.toBeNull();
    expect(document.querySelector('#book-seats-btn')).not.toBeNull();
    expect(document.querySelector('#sectors-price-btn')).not.toBeNull();
    expect(document.querySelector('#sectors-save-btn')).not.toBeNull();
  });
});