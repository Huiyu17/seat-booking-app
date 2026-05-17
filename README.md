# Seat Booking App - CPT304 Coursework Enhancement

[![Test and Upload Coverage](https://github.com/Huiyu17/seat-booking-app/actions/workflows/codecov.yml/badge.svg)](https://github.com/Huiyu17/seat-booking-app/actions/workflows/codecov.yml)
[![codecov](https://codecov.io/gh/Huiyu17/seat-booking-app/branch/main/graph/badge.svg)](https://codecov.io/gh/Huiyu17/seat-booking-app)

## Live Deployment

Vercel: https://seat-booking-app-rouge.vercel.app/

## Project Overview

This repository is a coursework enhancement of the original open-source Seat Booking App implemented in vanilla JavaScript.

Original project: https://github.com/sptin2002/seat-booking-app

The purpose of this fork is to improve the original prototype into a more production-ready application through source-code auditing, research-led refactoring, automated testing, accessibility enhancement, and deployment on Vercel.

## Coursework Enhancements

The main improvements include:

- Input validation and error handling
- User feedback improvements with button interaction states and toast messages
- Keyboard accessibility for seat selection
- Responsive layout adaptation and light/dark theme switching
- LocalStorage privacy notice and cookie consent
- Internationalisation support
- Automated testing with Jest
- Code coverage reporting with Codecov
- CI checks through GitHub Actions
- Lighthouse accessibility improvements

## Quality Evidence

- Jest tests run automatically on pull requests.
- Codecov reports project test coverage.
- The deployed app is hosted on Vercel.
- The app includes a Privacy Policy and cookie consent banner.
- The UI supports English/Chinese language switching.
- Lighthouse is used to verify accessibility improvements.

## Running Locally

```bash
npm ci
npm test
```

# Original Project Description: Seat-Booking App
**This project has not been finished yet**

This is a project of a Seat Booking App implemented using vanilla `JavaScript`. It can be easily adjusted to be used in any project that needs to have a simple **seat-reservation system**. Please note that this project is not finished yet.

The app uses `ES6` classes and methods, and also uses modern browser APIs such as `querySelector`, `createElement`, and `localStorage`. It also uses the `crypto` API to generate random ids for services and sectors.

## How it works
The app has three main classes: `SeatBookingApp`, `Service`, and `Sector`.

1. The SeatBookingApp class is responsible for creating instances of Service and Sector, rendering services to the DOM, and caching data to local storage. 
It provides methods to add sectors and services to the app, get the list of services, and set the current service. It renders the services list to the DOM and caches the services to local storage. 

2. The Service class represents a service with a name, price, and available seats. It provides methods to book seats, add reserved seats, remove reserved seats, and mark seats as booked. This class provides methods to add and remove reserved seats, calculate their prices and book them.

3. The Sector class represents a sector with a unique id, a price multiplier, and a list of seats in each row. It generates unique seat ids and provides a method to render the sectors to the DOM.

## Bugs
* reserved seats and order details list should be cleared after adding, deleting or modifying current service and after changing services
* when localStorage is empty, everything should be blocked until a service is created and cached in localStorage

## Things to be implemented
* **prompt user to create first service**
* **add input validation and better error handling**
* enable user to update price multipliers for each sector
* enable user to create sectors
    * storing mechanism for sectors is ready (disabled for now)
