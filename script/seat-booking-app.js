'use strict';

class SeatBookingApp {
    constructor(name) {
        this._name = name;
        this._sectors = [];
        this._priceMultipliers = [];
        this._services = [];
        this._currentServiceId = '';
    }

    getName() {
        return this._name;
    }

    addSector(sector) {
        this._sectors.push(sector);
    }

    getSectorsArray() {
        return this._sectors;
    }

    setPriceMultipliersArray() {
        this._priceMultipliers = [];

        const sectors = this.getSectorsArray();

        sectors.forEach((sector) => {
            const sectorId = sector.getId();
            const sectorPrice = sector.getPriceMultiplier();

            this._priceMultipliers.push({
                sector: sectorId,
                priceMultiplier: sectorPrice
            });
        });
    }

    getPriceMultipliersArray() {
        return this._priceMultipliers;
    }

    renderSectorsList() {
        const sectors = this.getPriceMultipliersArray();
        const container = document.querySelector('#sectors-list');

        if (!container) return;

        container.innerHTML = '';

        sectors.forEach((sector) => {
            const listElement = document.createElement('li');

            const label = document.createElement('label');
            label.setAttribute('for', `price-${sector.sector}`);
            label.textContent = sector.sector;

            const price = document.createElement('input');
            price.setAttribute('id', `price-${sector.sector}`);
            price.setAttribute('type', 'number');
            price.setAttribute('step', '0.01');
            price.setAttribute('min', '0');
            price.value = sector.priceMultiplier;
            price.disabled = true;
            price.style.border = 'none';

            listElement.appendChild(label);
            listElement.appendChild(price);
            container.appendChild(listElement);
        });
    }

    addService(service) {
        this._services.push(service);
    }

    getServicesArray() {
        return this._services;
    }

    renderServicesList() {
        const services = this.getServicesArray();
        const dropdownElement = document.querySelector('#services-list');

        if (!dropdownElement) return;

        dropdownElement.innerHTML = '';

        services.forEach((service) => {
            const optionElement = document.createElement('option');
            optionElement.setAttribute('value', service.getId());
            optionElement.textContent = service.getName();
            dropdownElement.appendChild(optionElement);
        });

        this.setCurrentServiceId(dropdownElement.value || '');
    }

    getCurrentServiceId() {
        return this._currentServiceId;
    }

    getCurrentService() {
        const services = this.getServicesArray();

        return services.find((service) => {
            return service.getId() === this.getCurrentServiceId();
        }) || null;
    }

    setCurrentServiceId(serviceId) {
        this._currentServiceId = serviceId;
    }

    renderCurrentServiceData() {
        const currentService = this.getCurrentService();

        const inputServiceName = document.querySelector('#service-name');
        const inputServicePrice = document.querySelector('#service-price');

        if (!inputServiceName || !inputServicePrice) return;

        if (!currentService) {
            inputServiceName.value = '';
            inputServicePrice.value = '';
            return;
        }

        inputServiceName.value = currentService.getName();
        inputServicePrice.value = currentService.getPrice();
    }

    cacheServices() {
        if (typeof Storage !== 'undefined') {
            localStorage.setItem(
                `sba-services-${this.getName()}`,
                JSON.stringify(this.getServicesArray())
            );
        } else {
            window.alert('Access to localStorage in this browser is not available. Data cannot be saved.');
            throw new Error('Access to localStorage in this browser is not available. Data cannot be saved.');
        }
    }

    fetchServices() {
        const rawData = localStorage.getItem(`sba-services-${this.getName()}`);

        if (!rawData) {
            console.log("Let's add some services. Use the form on the left.");
            showToast('No showings found. Use the form to add one.', 'info');
            return;
        }

        let servicesJSON;

        try {
            servicesJSON = JSON.parse(rawData);
        } catch (error) {
            console.warn('Invalid localStorage service data, skipping');
            return;
        }

        if (!Array.isArray(servicesJSON)) {
            console.warn('Invalid service data, skipping');
            return;
        }

        servicesJSON.forEach((service) => {
            if (
                !service ||
                typeof service._name !== 'string' ||
                typeof service._price !== 'number'
            ) {
                console.warn('Invalid service data, skipping');
                return;
            }

            const sanitizedName = sanitizeText(service._name);
            const sanitizedPrice = Number(service._price);

            if (!sanitizedName || isNaN(sanitizedPrice)) {
                console.warn('Sanitized service data invalid, skipping');
                return;
            }

            const serviceInstance = new Service(sanitizedName, sanitizedPrice);

            if (Array.isArray(service._seatsBooked)) {
                serviceInstance.setBookedSeatsArray(service._seatsBooked);
            } else {
                serviceInstance.setBookedSeatsArray([]);
            }

            this.addService(serviceInstance);
        });
    }

    updateOrderDetails() {
        const currentService = this.getCurrentService();

        const container = document.querySelector('#order-details');
        const totalPriceContainer = document.querySelector('#order-total-price');

        if (!container || !totalPriceContainer) return;

        container.textContent = '';
        totalPriceContainer.textContent = '';

        if (!currentService) return;

        const servicePrice = Number(currentService.getPrice());
        const priceMultipliers = this.getPriceMultipliersArray();
        const reservedSeats = currentService.getReservedSeats();

        if (isNaN(servicePrice)) return;
        if (!Array.isArray(reservedSeats)) return;

        let totalPrice = 0;

        reservedSeats.forEach((seat) => {
            if (!seat || !seat.id) return;
            if (!seat.parentElement || !seat.parentElement.parentElement) return;

            const currentSectorId = seat.parentElement.parentElement.id;

            const priceInfo = priceMultipliers.find((element) => {
                return element.sector === currentSectorId;
            });

            if (!priceInfo) return;

            const sectorPrice = Number(priceInfo.priceMultiplier);

            if (isNaN(sectorPrice)) return;

            const seatPrice = parseFloat((servicePrice * sectorPrice).toFixed(2));
            totalPrice += seatPrice;

            const listItem = document.createElement('li');

            const listItemId = document.createElement('span');
            listItemId.textContent = seat.id;

            const listItemPrice = document.createElement('span');
            listItemPrice.textContent = `$${seatPrice}`;

            listItem.appendChild(listItemId);
            listItem.appendChild(listItemPrice);
            container.appendChild(listItem);
        });

        const totalPriceElement = document.createElement('span');
        totalPriceElement.textContent = `Total price: $${parseFloat(totalPrice.toFixed(2))}`;
        totalPriceContainer.appendChild(totalPriceElement);
    }
}

class Service {
    constructor(name, price) {
        this._id = createId();
        this._name = name;
        this._price = price;
        this._seatsReserved = [];
        this._seatsBooked = [];
    }

    getId() {
        return this._id;
    }

    getName() {
        return this._name;
    }

    getPrice() {
        return this._price;
    }

    setName(name) {
        this._name = name;
    }

    setPrice(price) {
        this._price = price;
    }

    getBookedSeats() {
        return this._seatsBooked;
    }

    bookSeats() {
        const reservedSeats = this.getReservedSeats();

        reservedSeats.forEach((seat) => {
            if (seat && seat.id && !this._seatsBooked.includes(seat.id)) {
                this._seatsBooked.push(seat.id);
            }
        });

        this.clearReservedSeats();
        this.markBookedSeats();
    }

    getReservedSeats() {
        return this._seatsReserved;
    }

    addReservedSeat(seat) {
        if (!seat || !seat.id) return;

        const exists = this._seatsReserved.some((reservedSeat) => {
            return reservedSeat.id === seat.id;
        });

        if (!exists) {
            this._seatsReserved.push(seat);
        }
    }

    removeReservedSeat(seatId) {
        const index = this._seatsReserved.findIndex((seat) => {
            return seat.id === seatId;
        });

        if (index !== -1) {
            this._seatsReserved.splice(index, 1);
        }
    }

    clearReservedSeats() {
        this._seatsReserved = [];
    }

    setBookedSeatsArray(array) {
        if (Array.isArray(array)) {
            this._seatsBooked = array;
        } else {
            this._seatsBooked = [];
        }
    }

    markBookedSeats() {
        const seatElements = document.querySelectorAll('.seat');

        seatElements.forEach((seat) => {
            if (this._seatsBooked.includes(seat.id)) {
                seat.classList.remove('seat--reserved');
                seat.classList.add('seat--booked');
            }
        });
    }
}

class Sector {
    constructor(id, priceMultiplier = 1, ...seatsInRow) {
        this._id = `s-${String(id)}`;
        this._priceMultiplier = priceMultiplier;
        this._rows = seatsInRow.length;
        this._seats = [];

        for (let i = 1; i <= seatsInRow.length; i++) {
            const rowId = `${this._id}-${i}`;

            for (let j = 1; j <= seatsInRow[i - 1]; j++) {
                const seatId = `${rowId}-${j}`;

                this._seats.push({
                    sector: this._id,
                    row: rowId,
                    seat: seatId
                });
            }
        }
    }

    getId() {
        return this._id;
    }

    getPriceMultiplier() {
        return this._priceMultiplier;
    }

    setPriceMultiplier(priceMultiplier) {
        this._priceMultiplier = priceMultiplier;
    }

    renderSector() {
        const appContainer = document.querySelector('#seat-booking-app');

        if (!appContainer) {
            throw new Error('App container not found');
        }

        const seatsContainer = document.querySelector('#seats');

        if (!seatsContainer) {
            throw new Error('Seats container not found');
        }

        const sectorId = this._id;
        const sectorName = sectorId.slice(2);

        const sectorElement = document.createElement('div');
        sectorElement.classList.add('sector');
        sectorElement.setAttribute('id', sectorId);
        sectorElement.style.gridArea = sectorName;

        const sectorLabel = document.createElement('div');
        sectorLabel.classList.add('sector__label');
        sectorLabel.textContent = sectorId;
        sectorElement.appendChild(sectorLabel);

        for (let i = 1; i <= this._rows; i++) {
            const rowId = `${sectorId}-${i}`;

            const rowElement = document.createElement('div');
            rowElement.classList.add('row');
            rowElement.setAttribute('id', rowId);

            const seatsInThisRow = this._seats.filter((seat) => {
                return seat.row === rowId;
            });

            seatsInThisRow.forEach((seat) => {
                const seatElement = document.createElement('div');
                seatElement.classList.add('seat');
                seatElement.setAttribute('id', seat.seat);
                rowElement.appendChild(seatElement);
            });

            sectorElement.appendChild(rowElement);
        }

        seatsContainer.appendChild(sectorElement);
    }
}

/**
 * Helpers
 */

function createId() {
    if (
        typeof crypto !== 'undefined' &&
        typeof crypto.randomUUID === 'function'
    ) {
        return crypto.randomUUID();
    }

    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sanitizeText(text) {
    if (typeof DOMPurify !== 'undefined') {
        return DOMPurify.sanitize(text);
    }

    return String(text).replace(/[&<>"']/g, (char) => {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return entities[char];
    });
}

function initializeApp(name) {
    return new SeatBookingApp(name);
}

/**
 * Validation functions for Codecov / Jest
 */

function validateServiceForm() {
    const nameInput = document.querySelector('#service-name');
    const priceInput = document.querySelector('#service-price');

    if (!nameInput || !priceInput) {
        alert('Service form elements not found.');
        return false;
    }

    const inputServiceName = nameInput.value.trim();
    const inputServicePrice = priceInput.value.trim();

    if (!inputServiceName) {
        alert('Please enter a Movie title.');
        return false;
    }

    const price = parseFloat(inputServicePrice);

    if (isNaN(price) || price <= 0) {
        alert('Please enter a valid Price base (must be a positive number).');
        return false;
    }

    return {
        name: inputServiceName,
        price: price
    };
}

function validateSectorPriceMultipliers() {
    const priceInputs = document.querySelectorAll('#sectors-list input');

    for (const input of priceInputs) {
        const inputValue = input.value.trim();

        if (!inputValue) {
            alert('Please fill in all Price multipliers.');
            return false;
        }

        const newMultiplier = parseFloat(inputValue);

        if (isNaN(newMultiplier) || newMultiplier < 0) {
            alert('Please enter valid Price multipliers.');
            return false;
        }
    }

    return true;
}

function enableSectorPriceEditing() {
    const priceInputs = document.querySelectorAll('#sectors-list input');

    priceInputs.forEach((input) => {
        input.disabled = !input.disabled;
        input.style.border = input.disabled ? 'none' : '1px solid #ccc';
    });

    const saveBtn = document.querySelector('#sectors-save-btn');

    if (saveBtn) {
        saveBtn.style.display = 'inline-block';
    }
}

function saveSectorPriceMultipliers(app) {
    if (!validateSectorPriceMultipliers()) {
        return false;
    }

    const priceInputs = document.querySelectorAll('#sectors-list input');
    const sectors = app.getSectorsArray();

    priceInputs.forEach((input) => {
        const sectorId = input.id.replace('price-', '');
        const newMultiplier = parseFloat(input.value);

        const sector = sectors.find((s) => {
            return s.getId() === sectorId;
        });

        if (sector) {
            sector.setPriceMultiplier(newMultiplier);
        }
    });

    app.setPriceMultipliersArray();
    app.updateOrderDetails();

    priceInputs.forEach((input) => {
        input.disabled = true;
        input.style.border = 'none';
    });

    const saveBtn = document.querySelector('#sectors-save-btn');

    if (saveBtn) {
        saveBtn.style.display = 'none';
    }

    console.log('Sector prices have been updated');
    showToast('Sector prices updated successfully!', 'success');

    return true;
}

function addServiceFromForm(app) {
    const result = validateServiceForm();

    if (!result) return false;

    const newService = new Service(result.name, result.price);

    app.addService(newService);
    app.cacheServices();
    app.renderServicesList();
    app.renderCurrentServiceData();

    console.log(`"${result.name}" has been successfully added`);
    showToast(`"${result.name}" added successfully!`, 'success');

    if (typeof localStorageSpace === 'function') {
        localStorageSpace();
    }

    return true;
}

function updateServiceFromForm(app) {
    const result = validateServiceForm();

    if (!result) return false;

    const currentService = app.getCurrentService();

    if (!currentService) {
        alert('Please select a service first.');
        return false;
    }

    currentService.setName(result.name);
    currentService.setPrice(result.price);

    app.cacheServices();
    app.renderServicesList();
    app.renderCurrentServiceData();
    app.updateOrderDetails();

    console.log(`"${result.name}" has been successfully updated`);
    showToast(`"${result.name}" updated successfully!`, 'success');

    if (typeof localStorageSpace === 'function') {
        localStorageSpace();
    }

    return true;
}

function deleteCurrentService(app) {
    const inputServiceNameElement = document.querySelector('#service-name');
    const inputServiceName = inputServiceNameElement ? inputServiceNameElement.value : '';

    const currentServiceId = app.getCurrentServiceId();
    const servicesArray = app.getServicesArray();

    const indexToDelete = servicesArray.findIndex((service) => {
        return service.getId() === currentServiceId;
    });

    if (indexToDelete === -1) {
        alert('Please select a service first.');
        return false;
    }

    servicesArray.splice(indexToDelete, 1);

    app.cacheServices();
    app.renderServicesList();
    app.renderCurrentServiceData();

    console.log(`"${inputServiceName}" has been successfully removed`);
    showToast(`"${inputServiceName}" deleted.`, 'info');

    if (typeof localStorageSpace === 'function') {
        localStorageSpace();
    }

    return true;
}

function bookCurrentSeats(app) {
    const currentService = app.getCurrentService();

    if (!currentService) {
        alert('Please select a service first.');
        return false;
    }

    const reservedSeats = currentService.getReservedSeats();

    if (reservedSeats.length === 0) {
        alert('Please select at least one seat before booking.');
        return false;
    }

    const serviceName = currentService.getName();
    const servicePrice = Number(currentService.getPrice());
    const priceMultipliers = app.getPriceMultipliersArray();

    let totalPrice = 0;
    let seatDetails = '';

    reservedSeats.forEach((seat) => {
        const sectorId = seat.parentElement.parentElement.id;

        const priceInfo = priceMultipliers.find((element) => {
            return element.sector === sectorId;
        });

        if (!priceInfo) return;

        const sectorPrice = Number(priceInfo.priceMultiplier);
        const seatPrice = parseFloat((servicePrice * sectorPrice).toFixed(2));

        totalPrice += seatPrice;
        seatDetails += `\n- ${seat.id}: $${seatPrice}`;
    });

    totalPrice = parseFloat(totalPrice.toFixed(2));

    const confirmationMessage =
        `Confirm booking for "${serviceName}"?\n\n` +
        `Selected seats:${seatDetails}\n\n` +
        `Total price: $${totalPrice}\n\n` +
        `Click OK to confirm booking.`;

    if (confirm(confirmationMessage)) {
        const bookedSeatsCount = reservedSeats.length;

        currentService.bookSeats();
        app.cacheServices();
        app.updateOrderDetails();

        showToast(`Booking successful! You have booked ${bookedSeatsCount} seat(s) for $${totalPrice}.`, 'success');

        return true;
    }

    console.log('Booking cancelled by user.');
    return false;
}

function renderBookedSeats(app) {
    const currentService = app.getCurrentService();

    if (!currentService) return;

    const bookedSeats = currentService.getBookedSeats();
    const seatElements = document.querySelectorAll('.seat');

    seatElements.forEach((seat) => {
        seat.classList.remove('seat--reserved');

        if (bookedSeats.includes(seat.id)) {
            seat.classList.add('seat--booked');
        } else {
            seat.classList.remove('seat--booked');
        }
    });
}

function attachSeatEvents(app) {
    const seatElements = document.querySelectorAll('.seat');

    seatElements.forEach((seat) => {
        seat.addEventListener('mouseover', (e) => {
            const oldInfo = document.querySelector('.seat__info');
        
            if (oldInfo) {
                oldInfo.remove();
            }
        
            const seatInfo = document.createElement('div');
            seatInfo.classList.add('seat__info');
            seatInfo.textContent = e.target.id;
    
            const screeningRoom = document.querySelector('#screening-room-1');
            if (screeningRoom) {
                seatInfo.style.position = 'absolute';
                seatInfo.style.left = '50%';
                seatInfo.style.transform = 'translateX(-50%)';
        
  
                const screenEl = document.querySelector('#screen');
                const seatsEl = document.querySelector('#seats');
                const roomRect = screeningRoom.getBoundingClientRect();
        
                if (screenEl && seatsEl) {
                    const screenBottom = screenEl.getBoundingClientRect().bottom - roomRect.top;
                    const seatsTop = seatsEl.getBoundingClientRect().top - roomRect.top;
                    const midY = (screenBottom + seatsTop) / 2;
        
                    seatInfo.style.top = `${midY}px`;
                    seatInfo.style.transform = 'translate(-50%, -50%)';
                }
        
                screeningRoom.appendChild(seatInfo);
            } else {
                const screenEl = document.querySelector('#screen');
if (screenEl) {
    screenEl.appendChild(seatInfo);
} else {
    e.target.parentElement.appendChild(seatInfo);
}
            }
        });

        seat.addEventListener('mouseleave', () => {
            const seatInfo = document.querySelector('.seat__info');

            if (seatInfo) {
                seatInfo.remove();
            }
        });

        seat.addEventListener('click', (e) => {
            if (seat.classList.contains('seat--booked')) return;

            const currentService = app.getCurrentService();

            if (!currentService) {
                alert('Please add or select a service first.');
                return;
            }

            e.target.classList.toggle('seat--reserved');

            if (seat.classList.contains('seat--reserved')) {
                currentService.addReservedSeat(e.target);
            } else {
                currentService.removeReservedSeat(e.target.id);
            }

            app.updateOrderDetails();
        });
    });
}

function attachControlEvents(app) {
    const dropdownElement = document.querySelector('#services-list');

    if (dropdownElement) {
        dropdownElement.addEventListener('change', (e) => {
            app.setCurrentServiceId(e.target.value);
            renderBookedSeats(app);
            app.renderCurrentServiceData();
            app.updateOrderDetails();
        });
    }

    const serviceAddBtn = document.querySelector('#service-add-btn');

    if (serviceAddBtn) {
        serviceAddBtn.addEventListener('click', () => {
            addServiceFromForm(app);
        });
    }

    const serviceUpdateBtn = document.querySelector('#service-update-btn');

    if (serviceUpdateBtn) {
        serviceUpdateBtn.addEventListener('click', () => {
            updateServiceFromForm(app);
        });
    }

    const serviceDeleteBtn = document.querySelector('#service-delete-btn');

    if (serviceDeleteBtn) {
        serviceDeleteBtn.addEventListener('click', () => {
            deleteCurrentService(app);
        });
    }

    const bookSeatsBtn = document.querySelector('#book-seats-btn');

    if (bookSeatsBtn) {
        bookSeatsBtn.addEventListener('click', () => {
            bookCurrentSeats(app);
        });
    }

    const sectorsPriceBtn = document.querySelector('#sectors-price-btn');

    if (sectorsPriceBtn) {
        sectorsPriceBtn.addEventListener('click', () => {
            enableSectorPriceEditing();
        });
    }

    const sectorsSaveBtn = document.querySelector('#sectors-save-btn');

    if (sectorsSaveBtn) {
        sectorsSaveBtn.addEventListener('click', () => {
            saveSectorPriceMultipliers(app);
        });
    }
}

function scaleScreeningRoomContent() {
    const screeningRoom = document.querySelector('#screening-room-1');
    const seats = document.querySelector('#seats');

    if (!screeningRoom || !seats) return;

    seats.style.transform = 'translateX(0px) scale(1)';

    const screeningRoomStyle = window.getComputedStyle(screeningRoom);
    const paddingLeft = parseFloat(screeningRoomStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(screeningRoomStyle.paddingRight) || 0;
    const safetyPadding = 20;

    const roomContentWidth = Math.max(
        screeningRoom.clientWidth - paddingLeft - paddingRight,
        0
    );
    const rawSeatsWidth = seats.scrollWidth;

    if (roomContentWidth <= 0 || rawSeatsWidth <= 0) return;

    const fitWidth = Math.max(roomContentWidth - safetyPadding * 2, 0);
    const scale = Math.min(1, fitWidth / rawSeatsWidth || 1);
    const scaledSeatsWidth = rawSeatsWidth * scale;
    let translateX = (roomContentWidth - scaledSeatsWidth) / 2;

    const roomRect = screeningRoom.getBoundingClientRect();
    const seatsRect = seats.getBoundingClientRect();
    const hasStableGeometry = roomRect.width > 0 && seatsRect.width > 0;

    if (hasStableGeometry) {
        const contentLeft = roomRect.left + paddingLeft;
        const targetLeft = contentLeft + (roomContentWidth - scaledSeatsWidth) / 2;
        translateX = targetLeft - seatsRect.left;
    }

    seats.style.transform = `translateX(${translateX}px) scale(${scale})`;
}

function setupScreeningRoomAutoScale() {
    const screeningRoom = document.querySelector('#screening-room-1');
    const seats = document.querySelector('#seats');

    if (!screeningRoom || !seats) return;

    const queueScale = () => {
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                scaleScreeningRoomContent();
            });
        });
    };

    scaleScreeningRoomContent();
    window.addEventListener('resize', queueScale);
    window.addEventListener('load', queueScale);

    if (typeof ResizeObserver === 'function') {
        const observer = new ResizeObserver(() => {
            queueScale();
        });
        observer.observe(screeningRoom);
        observer.observe(seats);
    }
}

function setupSeatBookingApp() {
    const appContainer = document.querySelector('#seat-booking-app');

    if (!appContainer) return null;

    const showingRoom1 = initializeApp('showingRoom1');

    const sectorA1 = new Sector('A1', 1.0, 20, 20);
    const sectorA2 = new Sector('A2', 1.2, 20, 20, 20);
    const sectorB1 = new Sector('B1', 1.2, 20, 20, 20, 20);
    const sectorB1L = new Sector('B1L', 1.4, 1, 1, 1, 1, 1, 1);
    const sectorB2L = new Sector('B2L', 1.4, 1, 1, 1, 1, 1, 1);
    const sectorC1L = new Sector('C1L', 1.5, 12);

    showingRoom1.addSector(sectorA1);
    showingRoom1.addSector(sectorA2);
    showingRoom1.addSector(sectorB1);
    showingRoom1.addSector(sectorB1L);
    showingRoom1.addSector(sectorB2L);
    showingRoom1.addSector(sectorC1L);

    sectorA1.renderSector();
    sectorA2.renderSector();
    sectorB1.renderSector();
    sectorB1L.renderSector();
    sectorB2L.renderSector();
    sectorC1L.renderSector();

    showingRoom1.setPriceMultipliersArray();
    showingRoom1.fetchServices();

    showingRoom1.renderSectorsList();
    showingRoom1.renderServicesList();
    showingRoom1.renderCurrentServiceData();

    renderBookedSeats(showingRoom1);
    attachSeatEvents(showingRoom1);
    attachControlEvents(showingRoom1);
    setupScreeningRoomAutoScale();

    window.showingRoom1 = showingRoom1;

    return showingRoom1;
}

function showToast(message, type = 'info') {
    const region = document.getElementById('toast-region');
    if (!region) return;
    region.innerHTML = '';
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    region.appendChild(toast);
    setTimeout(() => { region.innerHTML = ''; }, 5000);
}

/**
 * Browser auto init.
 */
if (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof module === 'undefined'
) {
    document.addEventListener('DOMContentLoaded', () => {
        setupSeatBookingApp();
    });
}

/**
 * Export for Jest / Codecov
 */
if (typeof module !== 'undefined') {
    module.exports = {
        SeatBookingApp,
        Service,
        Sector,
        initializeApp,
        validateServiceForm,
        validateSectorPriceMultipliers,
        enableSectorPriceEditing,
        saveSectorPriceMultipliers,
        addServiceFromForm,
        updateServiceFromForm,
        deleteCurrentService,
        bookCurrentSeats,
        renderBookedSeats,
        attachSeatEvents,
        attachControlEvents,
        scaleScreeningRoomContent,
        setupScreeningRoomAutoScale,
        setupSeatBookingApp,
        sanitizeText,
        showToast
    };
}
