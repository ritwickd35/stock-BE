# Stock Market Data Visualization - Backend (Node.js, Express.js)

## Overview

The backend component of this project is built with Node.js and Express.js and serves as the foundation for generating and providing mock stock market data to the frontend. It includes data generation, an API endpoint for data retrieval, and real-time communication with the frontend.

## Server Setup

The backend server is established using Node.js and Express.js. Key components of server setup include:

- **Node.js and Express.js:** The core of the backend is powered by Node.js and the Express.js framework, providing a robust foundation for handling HTTP requests and responses.

- **Mock Data Generation:** The server is equipped to generate mock stock market data for various stock instruments. This data generation is a critical function of the backend.

- **API Endpoint:** The backend exposes an API endpoint at `/api/search`, which accepts query parameters for `symbol` and `period`. This endpoint is responsible for providing structured data in JSON format, including attributes such as date/time, close price, high price, low price, and volume.

## Data Regeneration

To facilitate data regeneration, the backend utilizes the Piscina library, a powerful tool for managing and distributing compute-intensive tasks. Key features include:

- **Piscina Library:** The server employs the Piscina library to maintain a pool of worker threads. These worker threads are dedicated to offloading resource-heavy tasks like data generation, ensuring that the main thread remains responsive and non-blocking.

- **Task Submission:** Users have the capability to submit a request for regenerating data for a specific stock instrument. This request is efficiently handled by a worker thread, preventing any disruption to the main thread's operations.

- **Real-time Notifications:** The backend is integrated with Socket.io, a real-time communication library, to provide users with instant notifications. Users are informed when data generation tasks are completed.

- **Socket Communication:** Upon task completion, the worker thread communicates with the main thread. Subsequently, the main thread sends an acknowledgment to the user via a connected socket, ensuring that the user is promptly notified.

This backend component complements the frontend's capabilities, making it possible to generate, retrieve, and communicate stock market data seamlessly, enhancing the user experience with real-time updates and efficient data regeneration.

## Project Setup

```sh
docker-compose up --build
```

### Compile and Hot-Reload for Development

```sh
node index.js
```
