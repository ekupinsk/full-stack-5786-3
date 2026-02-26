# TaskFlow Management System

## Overview

TaskFlow is a full end-to-end simulation of a Client–Server architecture developed as part of the Full-Stack Web Development course.

The project demonstrates a functional Single Page Application (SPA) that communicates with simulated servers using a custom FAJAX (Fake AJAX) mechanism over a simulated network layer.

---

## Architecture

The system includes the following components:

### Client (SPA)
- Login and Registration pages
- Task management dashboard
- Full CRUD operations (Create, Read, Update, Delete)
- Asynchronous communication handling
- Automatic retry mechanism for simulated network failures

### Network Simulation
- Random delay between 1–3 seconds
- Controlled packet drop probability
- Simulated outbound and inbound message flow

### FAJAX Layer
- Custom `FXMLHttpRequest` class
- REST-like communication
- JSON-based request/response structure

### Servers
- User Authentication Server
- Task Data Server
- Authorization using token-based validation

### Database Layer
- LocalStorage-based data persistence
- Separate repositories for users and tasks
- REST API–style operations

---

## Features

- User authentication (Register / Login)
- Token-based authorization
- Task creation, editing, deletion
- Duplicate task title prevention
- Asynchronous error handling
- Automatic retry with countdown on network drops
- Case-sensitive task title validation

---

## Technologies Used

- Vanilla JavaScript (ES6+)
- HTML5
- CSS3
- LocalStorage
- Custom Network Simulation
- Custom FAJAX Implementation

---

## How to Run

1. Open the project folder.
2. Run using Live Server (recommended) or open `index.html`.
3. Register a new user or login with existing credentials.
4. Manage your tasks.

---

## Educational Purpose

This project was developed to simulate real-world client–server communication, REST APIs, asynchronous behavior, and network instability handling without using external frameworks.

---

## Author

Developed as part of the Full-Stack Web Development course.