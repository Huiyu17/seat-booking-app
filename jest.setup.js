global.crypto = {
    randomUUID: () => Math.random().toString(36).slice(2)
};

document.body.innerHTML = `
  <div id="seat-booking-app">
    <div id="settings">
      <select id="services-list"></select>
      <input id="service-name" type="text">
      <input id="service-price" type="number">
      <ul id="sectors-list"></ul>
      <ul id="order-details"></ul>
      <span id="order-total-price"></span>
      <button id="service-add-btn"></button>
      <button id="service-update-btn"></button>
      <button id="service-delete-btn"></button>
      <button id="book-seats-btn"></button>
      <button id="sectors-price-btn"></button>
      <button id="sectors-save-btn"></button>
    </div>
    <div id="screening-room-1">
      <div id="screen">Screen</div>
      <div id="seats"></div>
    </div>
  </div>
`;
