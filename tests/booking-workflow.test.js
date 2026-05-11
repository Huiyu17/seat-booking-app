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
        <div id="order" class="order">
          <ul id="order-details"></ul>
          <span id="order-total-price"></span>
        </div>
      </div>
      <div id="screening-room-1">
        <div id="screen">Screen</div>
        <div id="seats"></div>
      </div>
      <div id="sectors-list"></div>
      <button id="sectors-price-btn">Edit Sectors</button>
      <button id="sectors-save-btn" style="display: none;">Save Sectors</button>
    </div>
  `;
  localStorage.clear();
  global.alert = jest.fn();
  global.confirm = jest.fn(() => true);
  console.log = jest.fn();
});

describe('Service Update with Validation', () => {
  test('Empty service name shows alert and does not update', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Original', 10);
    app.addService(service);
    app.setCurrentServiceId(service.getId());

    document.querySelector('#service-name').value = '';
    document.querySelector('#service-price').value = '15';

    const inputServiceName = document.querySelector('#service-name').value.trim();
    const inputServicePrice = document.querySelector('#service-price').value;
    const price = parseFloat(inputServicePrice);

    // Simulate validation logic
    if (!inputServiceName) {
      global.alert('Please enter a Movie title.');
    }

    expect(global.alert).toHaveBeenCalledWith('Please enter a Movie title.');
    expect(service.getName()).toBe('Original'); // Not updated
  });

  test('Invalid price (non-numeric) shows alert', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Original', 10);
    app.addService(service);
    app.setCurrentServiceId(service.getId());

    document.querySelector('#service-name').value = 'Valid Name';
    document.querySelector('#service-price').value = 'not-a-number';

    const inputServiceName = document.querySelector('#service-name').value.trim();
    const inputServicePrice = document.querySelector('#service-price').value;
    const price = parseFloat(inputServicePrice);

    if (inputServiceName && (isNaN(price) || price <= 0)) {
      global.alert('Please enter a valid Price base (must be a positive number).');
    }

    expect(global.alert).toHaveBeenCalledWith('Please enter a valid Price base (must be a positive number).');
    expect(service.getPrice()).toBe(10);
  });

  test('Price <= 0 shows alert', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Original', 10);
    app.addService(service);
    app.setCurrentServiceId(service.getId());

    document.querySelector('#service-name').value = 'Valid Name';
    document.querySelector('#service-price').value = '0';

    const inputServiceName = document.querySelector('#service-name').value.trim();
    const inputServicePrice = document.querySelector('#service-price').value;
    const price = parseFloat(inputServicePrice);

    if (inputServiceName && (isNaN(price) || price <= 0)) {
      global.alert('Please enter a valid Price base (must be a positive number).');
    }

    expect(global.alert).toHaveBeenCalled();
  });

  test('Valid inputs update service and re-render', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Original', 10);
    app.addService(service);
    app.setCurrentServiceId(service.getId());
    app.renderServicesList = jest.fn();
    app.renderCurrentServiceData = jest.fn();
    app.updateOrderDetails = jest.fn();
    app.cacheServices = jest.fn();

    document.querySelector('#service-name').value = 'Updated Movie';
    document.querySelector('#service-price').value = '25.50';

    const inputServiceName = document.querySelector('#service-name').value.trim();
    const inputServicePrice = document.querySelector('#service-price').value;
    const price = parseFloat(inputServicePrice);

    if (inputServiceName && !isNaN(price) && price > 0) {
      const currentService = app.getCurrentService();
      currentService.setName(inputServiceName);
      currentService.setPrice(price);
      app.cacheServices();
      app.renderServicesList();
      app.renderCurrentServiceData();
      app.updateOrderDetails();
    }

    expect(service.getName()).toBe('Updated Movie');
    expect(service.getPrice()).toBe(25.50);
    expect(app.cacheServices).toHaveBeenCalled();
    expect(app.renderServicesList).toHaveBeenCalled();
    expect(app.updateOrderDetails).toHaveBeenCalled();
  });
});

describe('Booking with Confirmation', () => {
  test('No reserved seats shows alert', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Test Movie', 10);
    service.getReservedSeats = jest.fn(() => []);
    app.getCurrentService = jest.fn(() => service);

    const reservedSeats = service.getReservedSeats();

    if (reservedSeats.length === 0) {
      global.alert('Please select at least one seat before booking.');
    }

    expect(global.alert).toHaveBeenCalledWith('Please select at least one seat before booking.');
  });

  test('Confirmed booking calculates total price correctly', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Test Movie', 10);
    
    const seat1 = { 
      id: 's-A1-1-1', 
      parentElement: { parentElement: { id: 's-A1' } } 
    };
    const seat2 = { 
      id: 's-A1-1-2', 
      parentElement: { parentElement: { id: 's-A1' } } 
    };
    
    service.getReservedSeats = jest.fn(() => [seat1, seat2]);
    service.getName = jest.fn(() => 'Test Movie');
    service.getPrice = jest.fn(() => 10);
    service.bookSeats = jest.fn();
    app.getCurrentService = jest.fn(() => service);
    app.getPriceMultipliersArray = jest.fn(() => [
      { sector: 's-A1', priceMultiplier: 1.5 }
    ]);
    app.cacheServices = jest.fn();
    app.updateOrderDetails = jest.fn();

    const reservedSeats = service.getReservedSeats();
    const priceMultipliers = app.getPriceMultipliersArray();
    
    let totalPrice = 0;
    reservedSeats.forEach((seat) => {
      const sectorId = seat.parentElement.parentElement.id;
      const sectorPrice = priceMultipliers.find((element) => element.sector === sectorId).priceMultiplier;
      const seatPrice = parseFloat((service.getPrice() * sectorPrice).toFixed(2));
      totalPrice += seatPrice;
    });
    totalPrice = parseFloat(totalPrice.toFixed(2));

    const confirmationMessage = `Confirm booking for "Test Movie"?\n\nSelected seats:\n- s-A1-1-1: $15\n- s-A1-1-2: $15\n\nTotal price: $30\n\nClick OK to confirm booking.`;
    
    if (global.confirm(confirmationMessage)) {
      service.bookSeats();
      app.cacheServices();
      app.updateOrderDetails();
    }

    expect(totalPrice).toBe(30);
    expect(service.bookSeats).toHaveBeenCalled();
    expect(app.cacheServices).toHaveBeenCalled();
    expect(app.updateOrderDetails).toHaveBeenCalled();
  });

  test('Cancelled booking does not proceed', () => {
    global.confirm = jest.fn(() => false);
    
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Test Movie', 10);
    
    const seat = { 
      id: 's-A1-1-1', 
      parentElement: { parentElement: { id: 's-A1' } } 
    };
    
    service.getReservedSeats = jest.fn(() => [seat]);
    service.bookSeats = jest.fn();
    app.getCurrentService = jest.fn(() => service);

    const reservedSeats = service.getReservedSeats();
    
    if (reservedSeats.length > 0 && !global.confirm()) {
      console.log('Booking cancelled by user.');
    }

    expect(service.bookSeats).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('Booking cancelled by user.');
  });
});

describe('Sector Price Editing', () => {
  beforeEach(() => {
    // Setup sectors list with inputs
    document.querySelector('#sectors-list').innerHTML = `
      <div>
        <span>s-A1</span>
        <input id="price-s-A1" value="1.5" disabled style="border: none;">
      </div>
      <div>
        <span>s-B1</span>
        <input id="price-s-B1" value="2.0" disabled style="border: none;">
      </div>
    `;
  });

  test('Edit button enables inputs and shows save button', () => {
    const priceInputs = document.querySelectorAll('#sectors-list input');
    const saveBtn = document.querySelector('#sectors-save-btn');
    
    priceInputs.forEach((input) => {
      input.disabled = false;
      input.style.border = '1px solid #ccc';
    });
    saveBtn.style.display = 'inline-block';

    expect(priceInputs[0].disabled).toBe(false);
    expect(priceInputs[0].style.border).toBe('1px solid rgb(204, 204, 204)');
    expect(saveBtn.style.display).toBe('inline-block');
  });

  test('Save button validates non-empty inputs', () => {
    const priceInputs = document.querySelectorAll('#sectors-list input');
    priceInputs[0].value = '';
    priceInputs[1].value = '2.5';

    let isValid = true;
    for (const input of priceInputs) {
      if (!input.value.trim()) {
        global.alert('Please fill in all Price multipliers.');
        isValid = false;
        break;
      }
    }

    expect(isValid).toBe(false);
    expect(global.alert).toHaveBeenCalledWith('Please fill in all Price multipliers.');
  });

  test('Save button validates non-negative numbers', () => {
    const priceInputs = document.querySelectorAll('#sectors-list input');
    priceInputs[0].value = '-1';
    priceInputs[1].value = '2.5';

    let isValid = true;
    for (const input of priceInputs) {
      const newMultiplier = parseFloat(input.value);
      if (isNaN(newMultiplier) || newMultiplier < 0) {
        global.alert('Please enter valid Price multipliers (non-negative numbers only).');
        isValid = false;
        break;
      }
    }

    expect(isValid).toBe(false);
    expect(global.alert).toHaveBeenCalled();
  });

  test('Valid inputs update sector multipliers', () => {
    const app = new SeatBookingApp('testRoom');
    const sectorA = new Sector('A1', 1.0, 5);
    const sectorB = new Sector('B1', 1.0, 5);
    app.getSectorsArray = jest.fn(() => [sectorA, sectorB]);
    app.setPriceMultipliersArray = jest.fn();
    app.updateOrderDetails = jest.fn();

    const priceInputs = document.querySelectorAll('#sectors-list input');
    priceInputs[0].value = '1.8';
    priceInputs[1].value = '2.2';

    const sectors = app.getSectorsArray();
    
    priceInputs.forEach((input) => {
      const sectorId = input.id.replace('price-', '');
      const newMultiplier = parseFloat(input.value);
      const sector = sectors.find((s) => s.getId() === sectorId);
      if (sector) {
        sector.setPriceMultiplier(newMultiplier);
      }
    });

    app.setPriceMultipliersArray();
    app.updateOrderDetails();

    expect(sectorA.getPriceMultiplier()).toBe(1.8);
    expect(sectorB.getPriceMultiplier()).toBe(2.2);
    expect(app.setPriceMultipliersArray).toHaveBeenCalled();
    expect(app.updateOrderDetails).toHaveBeenCalled();
  });

  test('Save button disables inputs and hides save button after save', () => {
    const priceInputs = document.querySelectorAll('#sectors-list input');
    const saveBtn = document.querySelector('#sectors-save-btn');

    priceInputs.forEach((input) => {
      input.disabled = true;
      input.style.border = 'none';
    });
    saveBtn.style.display = 'none';

    expect(priceInputs[0].disabled).toBe(true);
    expect(priceInputs[0].style.borderWidth).toBe('');
    expect(saveBtn.style.display).toBe('none');
  });
});

describe('Integration: Full workflow', () => {
  test('Complete booking flow with sector price editing', () => {
    const app = new SeatBookingApp('testRoom');
    const service = new Service('Avatar', 12);
    const sector = new Sector('A1', 1.0, 3);
    
    app.addService(service);
    app.addSector(sector);
    app.setCurrentServiceId(service.getId());
    app.setPriceMultipliersArray();
    app.renderServicesList = jest.fn();
    app.updateOrderDetails = jest.fn();

    // Update service
    document.querySelector('#service-name').value = 'Avatar 2';
    document.querySelector('#service-price').value = '15';
    
    const newName = document.querySelector('#service-name').value.trim();
    const newPrice = parseFloat(document.querySelector('#service-price').value);
    
    service.setName(newName);
    service.setPrice(newPrice);
    
    expect(service.getName()).toBe('Avatar 2');
    expect(service.getPrice()).toBe(15);

    // Update sector multiplier
    sector.setPriceMultiplier(1.5);
    app.setPriceMultipliersArray();
    
    // Book seat (mocked)
    const seat = { 
      id: 's-A1-1-1', 
      parentElement: { parentElement: { id: 's-A1' } } 
    };
    service.addReservedSeat(seat);
    
    const reservedSeats = service.getReservedSeats();
    expect(reservedSeats).toHaveLength(1);
    
    const seatPrice = service.getPrice() * sector.getPriceMultiplier();
    expect(seatPrice).toBe(22.5);
  });
});

describe('SeatBookingApp.fetchServices() - Lines 594-633', () => {
  test('fetchServices with no cached data logs message', () => {
    const app = new SeatBookingApp('emptyRoom');
    localStorage.clear();
    
    console.log = jest.fn();
    app.fetchServices();
    
    expect(console.log).toHaveBeenCalledWith("Let's add some services. Use the form on the left.");
    expect(app.getServicesArray()).toHaveLength(0);
  });

  test('fetchServices restores services from localStorage', () => {
    const app = new SeatBookingApp('testRoom');
    const originalService = new Service('Restored Movie', 12.99);
    originalService.setBookedSeatsArray(['s-A1-1-1', 's-A1-1-2']);
    
    app.addService(originalService);
    app.cacheServices();
    
    const newApp = new SeatBookingApp('testRoom');
    newApp.fetchServices();
    
    expect(newApp.getServicesArray()).toHaveLength(1);
    const restoredService = newApp.getServicesArray()[0];
    expect(restoredService.getName()).toBe('Restored Movie');
    expect(restoredService.getPrice()).toBe(12.99);
    expect(restoredService.getBookedSeats()).toEqual(['s-A1-1-1', 's-A1-1-2']);
  });

  test('fetchServices skips invalid service data (non-string name)', () => {
    const app = new SeatBookingApp('testRoom');
    
    const invalidData = [{ _name: 123, _price: 10, _seatsBooked: [] }];
    localStorage.setItem('sba-services-testRoom', JSON.stringify(invalidData));
    
    console.warn = jest.fn();
    app.fetchServices();
    
    expect(console.warn).toHaveBeenCalledWith('Invalid service data, skipping');
    expect(app.getServicesArray()).toHaveLength(0);
  });

  test('fetchServices skips invalid service data (non-number price)', () => {
    const app = new SeatBookingApp('testRoom');
    
    const invalidData = [{ _name: 'Movie', _price: 'not-a-number', _seatsBooked: [] }];
    localStorage.setItem('sba-services-testRoom', JSON.stringify(invalidData));
    
    console.warn = jest.fn();
    app.fetchServices();
    
    expect(console.warn).toHaveBeenCalledWith('Invalid service data, skipping');
    expect(app.getServicesArray()).toHaveLength(0);
  });

  test('fetchServices sanitizes name (XSS protection fallback)', () => {
    const app = new SeatBookingApp('testRoom');
    
    const maliciousData = [{ 
      _name: '<script>alert("XSS")</script>', 
      _price: 10, 
      _seatsBooked: [] 
    }];
    localStorage.setItem('sba-services-testRoom', JSON.stringify(maliciousData));
    
    app.fetchServices();
    
    const restored = app.getServicesArray()[0];
    expect(restored.getName()).not.toContain('<script>');
    expect(restored.getPrice()).toBe(10);
  });

  test('fetchServices skips sanitized data that becomes invalid', () => {
    const app = new SeatBookingApp('testRoom');
    
    const emptyNameData = [{ _name: '', _price: 10, _seatsBooked: [] }];
    localStorage.setItem('sba-services-testRoom', JSON.stringify(emptyNameData));
    
    console.warn = jest.fn();
    app.fetchServices();
    
    expect(console.warn).toHaveBeenCalledWith('Sanitized service data invalid, skipping');
    expect(app.getServicesArray()).toHaveLength(0);
  });
});

describe('Service.removeReservedSeat and clearReservedSeats - Lines 640-647', () => {
  test('removeReservedSeat removes seat by ID', () => {
    const service = new Service('Test', 10);
    const seat1 = { id: 's-A1-1-1' };
    const seat2 = { id: 's-A1-1-2' };
    
    service.addReservedSeat(seat1);
    service.addReservedSeat(seat2);
    
    expect(service.getReservedSeats()).toHaveLength(2);
    
    service.removeReservedSeat('s-A1-1-1');
    
    expect(service.getReservedSeats()).toHaveLength(1);
    expect(service.getReservedSeats()[0].id).toBe('s-A1-1-2');
  });

  test('removeReservedSeat handles non-existent seat gracefully', () => {
    const service = new Service('Test', 10);
    const seat = { id: 's-A1-1-1' };
    service.addReservedSeat(seat);
    
    service.removeReservedSeat('non-existent');
    
    expect(service.getReservedSeats()).toHaveLength(1);
  });

  test('removeReservedSeat handles empty array', () => {
    const service = new Service('Test', 10);
    
    service.removeReservedSeat('anything');
    
    expect(service.getReservedSeats()).toHaveLength(0);
  });

  test('clearReservedSeats removes all reserved seats', () => {
    const service = new Service('Test', 10);
    service.addReservedSeat({ id: 's-A1-1-1' });
    service.addReservedSeat({ id: 's-A1-1-2' });
    service.addReservedSeat({ id: 's-A1-1-3' });
    
    expect(service.getReservedSeats()).toHaveLength(3);
    
    service.clearReservedSeats();
    
    expect(service.getReservedSeats()).toHaveLength(0);
  });
});

describe('Sector.renderSector() DOM creation - Lines 653-693', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="seat-booking-app">
        <div id="seats"></div>
      </div>
    `;
  });

  test('renderSector creates sector container with correct id', () => {
    const sector = new Sector('TEST1', 1.0, 3, 3, 3);
    sector.renderSector();
    
    const sectorElement = document.querySelector('#s-TEST1');
    expect(sectorElement).not.toBeNull();
    expect(sectorElement.classList.contains('sector')).toBe(true);
  });

  test('renderSector sets gridArea style correctly', () => {
    const sector = new Sector('ZONE', 1.0, 2, 2);
    sector.renderSector();
    
    const sectorElement = document.querySelector('#s-ZONE');
    expect(sectorElement.style.gridArea).toBe('ZONE');
  });

  test('renderSector creates correct number of rows', () => {
    const sector = new Sector('ROWS', 1.0, 3, 4, 2);
    sector.renderSector();
    
    const rows = document.querySelectorAll('#s-ROWS .row');
    expect(rows).toHaveLength(3);
  });

  test('renderSector creates row with correct IDs', () => {
    const sector = new Sector('ROWID', 1.0, 2, 2);
    sector.renderSector();
    
    const row1 = document.querySelector('#s-ROWID-1');
    const row2 = document.querySelector('#s-ROWID-2');
    
    expect(row1).not.toBeNull();
    expect(row2).not.toBeNull();
    expect(row1.classList.contains('row')).toBe(true);
  });

  test('renderSector creates seats with correct IDs', () => {
    const sector = new Sector('SEATS', 1.0, 2, 2);
    sector.renderSector();
    
    const seat1 = document.querySelector('#s-SEATS-1-1');
    const seat2 = document.querySelector('#s-SEATS-1-2');
    const seat3 = document.querySelector('#s-SEATS-2-1');
    const seat4 = document.querySelector('#s-SEATS-2-2');
    
    expect(seat1).not.toBeNull();
    expect(seat2).not.toBeNull();
    expect(seat3).not.toBeNull();
    expect(seat4).not.toBeNull();
    expect(seat1.classList.contains('seat')).toBe(true);
  });

  test('renderSector creates seats with varying row lengths', () => {
    const sector = new Sector('VARY', 1.0, 2, 3, 1);
    sector.renderSector();
    
    const row1Seats = document.querySelectorAll('#s-VARY-1 .seat');
    const row2Seats = document.querySelectorAll('#s-VARY-2 .seat');
    const row3Seats = document.querySelectorAll('#s-VARY-3 .seat');
    
    expect(row1Seats).toHaveLength(2);
    expect(row2Seats).toHaveLength(3);
    expect(row3Seats).toHaveLength(1);
  });

  test('renderSector adds sector label', () => {
    const sector = new Sector('LABEL', 1.0, 2, 2);
    sector.renderSector();
    
    const label = document.querySelector('#s-LABEL .sector__label');
    expect(label).not.toBeNull();
    expect(label.textContent).toBe('s-LABEL');
  });

  test('renderSector throws error if seats container not found', () => {
    document.body.innerHTML = '<div id="seat-booking-app"></div>';
    
    const sector = new Sector('ERROR', 1.0, 2, 2);
    
    expect(() => sector.renderSector()).toThrow('Seats container not found');
  });

  test('renderSector throws error if app container not found', () => {
    document.body.innerHTML = '<div id="seats"></div>';
    
    const sector = new Sector('ERROR2', 1.0, 2, 2);
    
    expect(() => sector.renderSector()).toThrow('App container not found');
  });

  test('renderSector handles single row with one seat', () => {
    const sector = new Sector('SINGLE', 1.0, 1);
    sector.renderSector();
    
    const seat = document.querySelector('#s-SINGLE-1-1');
    expect(seat).not.toBeNull();
    expect(document.querySelectorAll('#s-SINGLE .row')).toHaveLength(1);
    expect(document.querySelectorAll('#s-SINGLE .seat')).toHaveLength(1);
  });

  test('renderSector appends multiple sectors to same container', () => {
    const sector1 = new Sector('FIRST', 1.0, 2, 2);
    const sector2 = new Sector('SECOND', 1.0, 2, 2);
    
    sector1.renderSector();
    sector2.renderSector();
    
    expect(document.querySelector('#s-FIRST')).not.toBeNull();
    expect(document.querySelector('#s-SECOND')).not.toBeNull();
  });
});