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
        // get sectors array
        const sectors = this.getSectorsArray();
        sectors.forEach((sector) => {
            const sectorId = sector.getId();
            const sectorPrice = sector.getPriceMultiplier();
            this._priceMultipliers.push(
                {
                    sector: sectorId,
                    priceMultiplier: sectorPrice
                }
            );
        });
    }
    getPriceMultipliersArray() {
        return this._priceMultipliers;
    }
    renderSectorsList() {
        // get price multipliers array
        const sectors = this.getPriceMultipliersArray()
        // get container for sectors list (<ul>)
        const container = document.querySelector(`#sectors-list`);
        // clear container
        container.innerHTML = "";
        // populate container with existing sectors
        sectors.forEach((sector) => {
            const listElement = document.createElement('li');
            const name = document.createElement('span')
            name.textContent = sector.sector;
            const price = document.createElement('input')
            price.setAttribute('id', `price-${sector}`)
            price.value = sector.priceMultiplier
            listElement.appendChild(name);
            listElement.appendChild(price);
            container.appendChild(listElement);
        })
    }
    addService(service) {
        this._services.push(service);
    }
    getServicesArray() {
        return this._services;
    }
    renderServicesList() {
        // get services array
        const services = this.getServicesArray();
        // get container (dropdown element from Document)
        const dropdownElement = document.querySelector(`#services-list`);
        // clear container
        dropdownElement.innerHTML = "";
        // populate container with existing services
        services.forEach((service) => {
            const optionElement = document.createElement('option');
            optionElement.setAttribute('value', service.getId());
            optionElement.textContent = service.getName();
            dropdownElement.appendChild(optionElement);
        })
        // set initial active service
        this.setCurrentServiceId(dropdownElement.value)
    }
    getCurrentServiceId() {
        return this._currentServiceId;
    }
    getCurrentService() {
        // this.renderServicesList();
        // get services array
        const services = this.getServicesArray();
        return services.find((service) => {
            return service.getId() === this.getCurrentServiceId()
        })
    }
    setCurrentServiceId(serviceId) {
        this._currentServiceId = serviceId;
        // console.log(this.getCurrentService());
    }
    renderCurrentServiceData() {
        // get current service
        const currentService = this.getCurrentService();

        if(currentService) {
            // get input elements
            const inputServiceName = document.querySelector(`#service-name`);
            const inputServicePrice = document.querySelector(`#service-price`);
            // set current service data as input values
            inputServiceName.value = currentService.getName();
            inputServicePrice.value = currentService.getPrice();
        }
    }
    cacheServices() {
        // check if localStorage is available
        if(typeof(Storage) !== "undefined") {
            // localStorage is available
            localStorage.setItem(`sba-services-${this.getName()}`, JSON.stringify(this.getServicesArray()));
        } else {
            // localStorage is not available
            window.alert(`Access to localStorage in this browser is not available. Data cannot be saved.`);
            throw Error(`Access to localStorage in this browser is not available. Data cannot be saved.`);
        }
    }
    fetchServices() {
        // fetch data from localStorage
        const servicesJSON = JSON.parse(localStorage.getItem(`sba-services-${this.getName()}`));

        if(!servicesJSON) {
            // if there's no data, notify user
            console.log(`Let's add some services. Use the form on the left.`)
        } else {
            servicesJSON.forEach((service) => {
                // create Service instances and add to app's array
                const serviceInstance = (new Service(service._name, service._price))
                serviceInstance.setBookedSeatsArray(service._seatsBooked);
                this.addService(serviceInstance)
            })
        }
    }
    updateOrderDetails() {
        // get current service
        const currentService = this.getCurrentService();
        // get current service price
        const servicePrice = currentService.getPrice();
        // get price multipliers
        const priceMultipliers = this.getPriceMultipliersArray();
        // get reserved seats for current service
        const reservedSeats = currentService.getReservedSeats();
        // get and clear `order-details` container
        const container = document.querySelector(`#order-details`);
        container.innerHTML = '';
        // get and clear `total-price` <span> element
        const totalPriceContainer = document.querySelector(`#order-total-price`);
        totalPriceContainer.innerHTML = '';
        let totalPrice = 0;
        // loop through reserved seats and render every element
        reservedSeats.forEach((seat) => {
            // get reserved-seat's parent's id (sector's id)
            const currentSecotrId = seat.parentElement.parentElement.id;
            // find price multiplier for this sector
            const sectorPrice = priceMultipliers.find((element) => {
                return element.sector === currentSecotrId;
            }).priceMultiplier
            // calculate price for this seat
            const seatPrice = parseFloat((servicePrice * sectorPrice).toFixed(2))
            // update total price for reserved seats
            totalPrice += seatPrice;

            // render list object for this seat
            const listItem = document.createElement(`li`)
            const listItemId = document.createElement(`span`)
            listItemId.textContent = seat.id
            const listItemPrice = document.createElement(`span`)
            listItemPrice.textContent = `$${seatPrice}`
            container.appendChild(listItem)
            listItem.appendChild(listItemId)
            listItem.appendChild(listItemPrice)
            // render updated total price element
            const totalPriceElement = document.createElement(`span`)
            totalPriceElement.textContent = `Total price: $${parseFloat(totalPrice.toFixed(2))}`
            totalPriceContainer.innerHTML = '';
            totalPriceContainer.appendChild(totalPriceElement)
        })
    }
    /* disabled until there is a way of creating sectors by user
    cacheSectors() {
        // check if localStorage is available
        if(typeof(Storage) !== "undefined") {
            // localStorage is available
            localStorage.setItem(`sba-sectors-${this.getName()}`, JSON.stringify(this.getSectorsArray()));
        } else {
            // localStorage is not available
            window.alert(`Access to localStorage in this browser is not available. Data cannot be saved.`);
            throw Error(`Access to localStorage in this browser is not available. Data cannot be saved.`);
        }
    }
    fetchSectors() {
        // fetch data from localStorage
        const sectorsJSON = JSON.parse(localStorage.getItem(`sba-sectors-${this.getName()}`));

        if(!sectorsJSON) {
            // if there's no data, notify user
            console.log(`There are no sectors in localStorage`)
        } else {
            sectorsJSON.forEach((sector) => {
                // create Service instances and add to app's array
                const sectorInstance = (new Sector(sector._id, sector._priceMultiplier))
                // serviceInstance.setBookedSeatsArray(sector._seatsBooked);
                this.addSector(sectorInstance)
            })
        }
    }
    */
};

class Service {
    constructor(name, price) {
        this._id = crypto.randomUUID();
        this._name = name;
        this._price = price;
        this._seatsReserved = []; // contains seats' IDs
        this._seatsBooked = []; // contains seats' IDs
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
        // get reserved seats
        const reservedSeats = this.getReservedSeats();
        // transfer elements to array for booked seats
        reservedSeats.forEach((seat) => {
            this._seatsBooked.push(seat.id)
        })
        // clear `reserved seats` array
        this.clearReservedSeats();
        // update corresponding `seat` elements on the page
        this.markBookedSeats();
    }
    getReservedSeats() {
        return this._seatsReserved;
    }
    addReservedSeat(seat) {
        this._seatsReserved.push(seat)
    }
    removeReservedSeat(seatId) {
        const index = this._seatsReserved.findIndex((seat) => {
            return seat === seatId
        })
        this._seatsReserved.splice(index, 1)
    }
    clearReservedSeats() {
        this._seatsReserved = [];
    }
    setBookedSeatsArray(array) {
        this._seatsBooked = array;
    }
    markBookedSeats() {
        // get all rendered seat elements
        const seatElements = document.querySelectorAll('.seat');
        // refresh seats' classes
        seatElements.forEach((seat) => {
            if(this._seatsBooked.includes(seat.id)) {
            seat.classList.remove('seat--reserved');
            seat.classList.add('seat--booked');  
            syncBookedSeatAccessibility(seat);
            } else {
            syncBookedSeatAccessibility(seat);
            }
        })
    }
};

class Sector {
    constructor(id, priceMultiplier = 1, ...seatsInRow) {
        this._id = `s-${String(id)}`;
        this._priceMultiplier = priceMultiplier;
        this._rows = seatsInRow.length;
        this._seats = [...seatsInRow];
        
        // create array of rows and seats
        // rows
        for(let i = 1; i <= seatsInRow.length; i++) {
            const rowId = `${this._id}-${i}`;
            
            // seats
            for(let j = 1; j <= seatsInRow[i-1]; j++) {
                const seatId = `${rowId}-${j}`;
                // create new seat object and push it into array
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
        // get main app container
        const appContainer = document.querySelector(`#seat-booking-app`);
        // if there is no container, throw error
        if(!appContainer) throw Error(`App container not found`);
        
        // get seats container
        const seatsContainer = document.querySelector(`#seats`);
        // if there is no container, throw error
        if(!seatsContainer) throw Error(`Seats container not found`);
        // get sector's id
        const sectorId = this._id;
        // get sector's name (without the `s-` prefix)
        const sectorName = sectorId.slice(2);
        // get `seats` array
        const seats = this._seats;

        // create sector container
        const sectorElement = document.createElement('div');
        sectorElement.classList.add(`sector`);
        sectorElement.setAttribute(`id`, sectorId);
        sectorElement.style.gridArea = sectorName;
        // append sector to the seats container
        seatsContainer.appendChild(sectorElement);

        for(let i = 0; i < this._rows; i++) {
            // create row container
            const rowElement = document.createElement('div');
            rowElement.classList.add(`row`);
            rowElement.setAttribute(`id`, `${sectorId}-${i + 1}`);
            // append row to sector container
            sectorElement.appendChild(rowElement);

            for(let j = 0; j < seats.length; j++) {
                // check if seat belongs to current row
                if (seats[j].row === `${sectorId}-${i + 1}`) {
                    // create seat element
                    const seatElement = document.createElement('button');
                    seatElement.type = 'button';
                    seatElement.classList.add(`seat`);
                    seatElement.setAttribute(`id`, seats[j].seat);
                    seatElement.setAttribute(`aria-label`, `Seat ${seats[j].seat}`);
                    seatElement.setAttribute(`aria-pressed`, `false`);
                    seatElement.setAttribute(`aria-disabled`, `false`);
                    // append seat to current row container
                    rowElement.appendChild(seatElement);
                };
            };
        };

        //create sector label
        const sectorLabel = document.createElement('span');
        sectorLabel.textContent = sectorId;
        sectorLabel.classList.add('sector__label');
        sectorElement.appendChild(sectorLabel);
    };
};

// CREATE SECTORS (name, priceMultiplier, ...seatsInRow) ----------------------
const sectorA1 = new Sector(`A1`, 1.0, 20, 20);
sectorA1.renderSector();

const sectorA2 = new Sector(`A2`, 1.2, 20, 20, 20);
sectorA2.renderSector();

const sectorB1 = new Sector(`B1`, 1.2, 20, 20, 20, 20);
sectorB1.renderSector();

const sectorB1L = new Sector(`B1L`, 1.4, 1, 1, 1, 1, 1, 1);
sectorB1L.renderSector();

const sectorB2L = new Sector(`B2L`, 1.4, 1, 1, 1, 1, 1, 1);
sectorB2L.renderSector();

const sectorC1L = new Sector(`C1L`, 1.5, 12);
sectorC1L.renderSector();

// UTILITY FUNCTIONS ----------------------------------------------------------
const localStorageSpace = function(){
    let data = '';

    console.log('Current local storage: ');
    for(let key in window.localStorage){
        if(window.localStorage.hasOwnProperty(key)){
            data += window.localStorage[key];
            console.log( key + " = " + ((window.localStorage[key].length * 16)/(8 * 1024)).toFixed(2) + ' KB' );
        }
    }

    console.log(data ? '\n' + 'Total space used: ' + ((data.length * 16)/(8 * 1024)).toFixed(2) + ' KB' : 'Empty (0 KB)');
    console.log(data ? 'Approx. space remaining: ' + (5120 - ((data.length * 16)/(8 * 1024)).toFixed(2)) + ' KB' : '5 MB');
};

// APP FUNCTIONS --------------------------------------------------------------
function isSeatBooked(seat) {
    return seat.classList.contains(`seat--booked`);
}

function syncBookedSeatAccessibility(seat) {
    const booked = isSeatBooked(seat);
    seat.disabled = booked;
    seat.setAttribute(`aria-disabled`, booked ? `true` : `false`);
    if (booked) seat.setAttribute(`aria-pressed`, `false`);
}

function parseSeatId(seatId) {
    const parts = String(seatId).split(`-`);
    if (parts.length < 4) return null;
    const sectorId = `${parts[0]}-${parts[1]}`;
    const rowNumber = Number.parseInt(parts[2], 10);
    const seatNumber = Number.parseInt(parts[3], 10);
    if (!Number.isFinite(rowNumber) || !Number.isFinite(seatNumber)) return null;
    return {
        sectorId,
        rowId: `${sectorId}-${rowNumber}`,
        rowNumber,
        seatNumber
    };
}

function mapIndex(value, fromCount, toCount) {
    if (fromCount <= 1 || toCount <= 1) return 1;
    const ratio = (value - 1) / (fromCount - 1);
    return 1 + Math.round(ratio * (toCount - 1));
}

function findNearestAvailableSeatInRowBySeatNumber(row, seatNumber) {
    if (!row) return null;
    const seats = Array.from(row.querySelectorAll(`.seat`));
    if (seats.length === 0) return null;

    const clamped = Math.max(1, Math.min(seatNumber, seats.length));
    for (let offset = 0; offset < seats.length; offset++) {
        const left = clamped - offset;
        if (left >= 1 && !isSeatBooked(seats[left - 1])) return seats[left - 1];
        const right = clamped + offset;
        if (right <= seats.length && !isSeatBooked(seats[right - 1])) return seats[right - 1];
    }
    return null;
}

function jumpToRowMappedBySeatNumber(sourceSeat, targetRowId) {
    const sourceInfo = parseSeatId(sourceSeat.id);
    if (!sourceInfo) return null;
    const sourceRow = document.getElementById(sourceInfo.rowId);
    const targetRow = document.getElementById(targetRowId);
    if (!sourceRow || !targetRow) return null;

    const sourceSeatCount = sourceRow.querySelectorAll(`.seat`).length;
    const targetSeatCount = targetRow.querySelectorAll(`.seat`).length;
    const mappedSeatNumber = mapIndex(sourceInfo.seatNumber, sourceSeatCount, targetSeatCount);
    return findNearestAvailableSeatInRowBySeatNumber(targetRow, mappedSeatNumber);
}

function jumpToSideSector(sourceSeat, targetSectorId, targetSeatNumberInRow) {
    const targetSector = document.getElementById(targetSectorId);
    if (!targetSector) return null;

    const sourceRect = sourceSeat.getBoundingClientRect();
    const sourceY = sourceRect.top + sourceRect.height / 2;

    const targetRows = Array.from(targetSector.querySelectorAll(`.row`));
    let bestSeat = null;
    let bestDistance = Infinity;

    targetRows.forEach((row) => {
        const candidate = findNearestAvailableSeatInRowBySeatNumber(row, targetSeatNumberInRow);
        if (!candidate) return;
        const rect = candidate.getBoundingClientRect();
        const y = rect.top + rect.height / 2;
        const d = Math.abs(y - sourceY);
        if (d < bestDistance) {
            bestDistance = d;
            bestSeat = candidate;
        }
    });

    return bestSeat;
}

function findNearestAvailableSeatInRow(row, preferredIndex) {
    if (!row) return null;
    const seats = Array.from(row.querySelectorAll(`.seat`));
    if (seats.length === 0) return null;

    const clampedIndex = Math.max(0, Math.min(preferredIndex, seats.length - 1));
    for (let offset = 0; offset < seats.length; offset++) {
        const leftIndex = clampedIndex - offset;
        if (leftIndex >= 0 && !isSeatBooked(seats[leftIndex])) return seats[leftIndex];
        const rightIndex = clampedIndex + offset;
        if (rightIndex < seats.length && !isSeatBooked(seats[rightIndex])) return seats[rightIndex];
    }
    return null;
}

function showSeatInfo(seat) {
    if (!seat || !seat.id) return;
    const parent = seat.parentElement;
    if (!parent) return;
    const existing = parent.querySelector(`.seat__info`);
    if (existing) existing.remove();
    const seatInfo = document.createElement('div');
    seatInfo.classList.add(`seat__info`);
    seatInfo.textContent = seat.id;
    parent.appendChild(seatInfo);
}

function hideSeatInfo(seat) {
    const parent = seat?.parentElement;
    if (!parent) return;
    const existing = parent.querySelector(`.seat__info`);
    if (existing) existing.remove();
}

function initializeApp(instanceName) {
    console.log(`Seat-Booking App instance "${instanceName}" has been successfully created!`);
    return new SeatBookingApp(instanceName);
};

function renderBookedSeats() {
    if(showingRoom1.getCurrentService()) {
        // get current Service's booked seats array
        const bookedSeats = showingRoom1.getCurrentService().getBookedSeats();
        // get all rendered seat elements
        const seatElements = document.querySelectorAll('.seat');
        seatElements.forEach((seat) => {
            if(bookedSeats.includes(seat.id)) {
                seat.classList.add(`seat--booked`)
                seat.classList.remove(`seat--reserved`)
            } else {
                seat.classList.remove(`seat--booked`)
            }
            syncBookedSeatAccessibility(seat);
        });
    }
};

// INITIALIZE APP -------------------------------------------------------------
const showingRoom1 = initializeApp(`showingRoom1`);
// add sectors
showingRoom1.addSector(sectorA1)
showingRoom1.addSector(sectorA2)
showingRoom1.addSector(sectorB1)
showingRoom1.addSector(sectorB1L)
showingRoom1.addSector(sectorB2L)
showingRoom1.addSector(sectorC1L)
// create initial price multipliers array
showingRoom1.setPriceMultipliersArray()
// fetch Services from localStorage
showingRoom1.fetchServices();
// render user interface
showingRoom1.renderSectorsList();
showingRoom1.renderServicesList();
showingRoom1.renderCurrentServiceData();
renderBookedSeats();

// GET ELEMENTS FROM DOM ------------------------------------------------------
// get all rendered seat elements
const seatElements = document.querySelectorAll('.seat');
seatElements.forEach((seat) => {
    // show seat label on mouseover
    seat.addEventListener('mouseover', () => {
        showSeatInfo(seat);
    })
    // hide seat label on mouseleave
    seat.addEventListener('mouseleave', () => {
        hideSeatInfo(seat);
    })
    // toggle seat as reserved on click
    seat.addEventListener('click', (e) => {
        // if this seat is taken, don't do anything
        if (!seat.classList.contains(`seat--booked`)) {
            e.target.classList.toggle('seat--reserved');
            seat.setAttribute(`aria-pressed`, seat.classList.contains(`seat--reserved`) ? `true` : `false`);
            // get current service
            const currentService = showingRoom1.getCurrentService()
            if(seat.classList.contains(`seat--reserved`)) {
                // save seat ID in array
                currentService.addReservedSeat(e.target);
                showingRoom1.updateOrderDetails()
            } else {
                // remove seat ID from array
                currentService.removeReservedSeat(e.target.id);
            }

        };
    });
    // allow keyboard activation via Enter/Space and arrow key navigation
    seat.addEventListener('keydown', (e) => {
        const arrowKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
        if (!arrowKeys.includes(e.key)) return;
        e.preventDefault();

        const seatInfo = parseSeatId(seat.id);
        const row = seat.parentElement;
        const seatsInCurrentRow = Array.from(row.querySelectorAll(`.seat`));
        const seatIndex = seatsInCurrentRow.indexOf(seat);
        let targetSeat = null;

        if (e.key === 'ArrowRight') {
            if (seatInfo?.sectorId === `s-B1L`) {
                targetSeat = jumpToSideSector(seat, `s-B1`, 1);
            } else if (seatInfo?.sectorId === `s-B1` && seatInfo.seatNumber === 20) {
                targetSeat = jumpToSideSector(seat, `s-B2L`, 1);
            }
            if (targetSeat) {
                targetSeat.focus();
                return;
            }
            targetSeat = seat.nextElementSibling;
            while (targetSeat && targetSeat.classList && targetSeat.classList.contains(`seat`) && isSeatBooked(targetSeat)) {
                targetSeat = targetSeat.nextElementSibling;
            }
        } else if (e.key === 'ArrowLeft') {
            if (seatInfo?.sectorId === `s-B2L`) {
                targetSeat = jumpToSideSector(seat, `s-B1`, 20);
            } else if (seatInfo?.sectorId === `s-B1` && seatInfo.seatNumber === 1) {
                targetSeat = jumpToSideSector(seat, `s-B1L`, 1);
            }
            if (targetSeat) {
                targetSeat.focus();
                return;
            }
            targetSeat = seat.previousElementSibling;
            while (targetSeat && targetSeat.classList && targetSeat.classList.contains(`seat`) && isSeatBooked(targetSeat)) {
                targetSeat = targetSeat.previousElementSibling;
            }
        } else if (e.key === 'ArrowDown') {
            if (row?.id === `s-A1-2`) {
                targetSeat = jumpToRowMappedBySeatNumber(seat, `s-A2-1`);
            } else if (row?.id === `s-A2-3`) {
                targetSeat = jumpToRowMappedBySeatNumber(seat, `s-B1-1`);
            } else if (row?.id === `s-B1-4`) {
                targetSeat = jumpToRowMappedBySeatNumber(seat, `s-C1L-1`);
            } else {
                const nextRow = row.nextElementSibling;
                if (nextRow && nextRow.classList.contains('row')) {
                    targetSeat = findNearestAvailableSeatInRow(nextRow, seatIndex);
                }
            }
        } else if (e.key === 'ArrowUp') {
            if (row?.id === `s-A2-1`) {
                targetSeat = jumpToRowMappedBySeatNumber(seat, `s-A1-2`);
            } else if (row?.id === `s-B1-1`) {
                targetSeat = jumpToRowMappedBySeatNumber(seat, `s-A2-3`);
            } else if (row?.id === `s-C1L-1`) {
                targetSeat = jumpToRowMappedBySeatNumber(seat, `s-B1-4`);
            } else {
                const prevRow = row.previousElementSibling;
                if (prevRow && prevRow.classList.contains('row')) {
                    targetSeat = findNearestAvailableSeatInRow(prevRow, seatIndex);
                }
            }
        }

        if (targetSeat && targetSeat.classList.contains('seat') && !isSeatBooked(targetSeat)) {
            targetSeat.focus();
        }
    });
    seat.addEventListener('focus', () => {
        showSeatInfo(seat);
    })
    seat.addEventListener('blur', () => {
        hideSeatInfo(seat);
    })
});

// get `current service` dropdown element
const dropdownElement = document.querySelector(`#services-list`);
dropdownElement.addEventListener('change', (e) => {
    // update current service ID
    showingRoom1.setCurrentServiceId(e.target.value);

    // // clear reserved seats
    // showingRoom1.getCurrentService().clearReservedSeats();
    
    renderBookedSeats();
    showingRoom1.renderCurrentServiceData();
})

// get `add new Service` button element
const serviceAddBtn = document.querySelector(`#service-add-btn`);
serviceAddBtn.addEventListener('click', (e) => {
    // get input elements
    const inputServiceName = document.querySelector(`#service-name`).value;
    const inputServicePrice = document.querySelector(`#service-price`).value;
    // create new Service instance
    const newService = new Service(inputServiceName, inputServicePrice)

    showingRoom1.addService(newService);
    showingRoom1.cacheServices();
    showingRoom1.renderServicesList();
    showingRoom1.renderCurrentServiceData();

    console.log(`"${inputServiceName}" has been successfully added`)
    localStorageSpace();
})

// get `update Service` button element
const serviceUpdateBtn = document.querySelector(`#service-update-btn`);
serviceUpdateBtn.addEventListener('click', () => {
    // get input elements
    const inputServiceName = document.querySelector(`#service-name`).value;
    const inputServicePrice = document.querySelector(`#service-price`).value;
    // get current service
    const currentService = showingRoom1.getCurrentService();
    currentService.setName(inputServiceName);
    currentService.setPrice(inputServicePrice);

    showingRoom1.cacheServices();
    showingRoom1.renderCurrentServiceData();

    console.log(`"${inputServiceName}" has been successfully updated`)
    localStorageSpace();
})

// get `delete Service` button element
const serviceDeleteBtn = document.querySelector(`#service-delete-btn`);
serviceDeleteBtn.addEventListener('click', () => {

    // get current service name
    const inputServiceName = document.querySelector(`#service-name`).value;
    // get current service ID
    const currentServiceId = showingRoom1.getCurrentServiceId();
    // get all services array
    const servicesArray = showingRoom1.getServicesArray();
    const indexToDelete = servicesArray.findIndex((service) => {
        return service.getId() === currentServiceId;
    })
    // remove current service from array
    servicesArray.splice(indexToDelete, 1)

    showingRoom1.cacheServices();
    showingRoom1.renderServicesList()
    showingRoom1.renderCurrentServiceData();

    console.log(`"${inputServiceName}" has been successfully removed`)
    localStorageSpace();
})

// get `book seats` button element
const bookSeatsBtn = document.querySelector(`#book-seats-btn`)
bookSeatsBtn.addEventListener('click', () => {

    // get current service
    const currentService = showingRoom1.getCurrentService();

    currentService.bookSeats();
    showingRoom1.cacheServices();
})


if (typeof module !== 'undefined') {
    module.exports = { SeatBookingApp, Service, Sector };
}

