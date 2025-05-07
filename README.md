# Spring Boot React Blog

A blog application built with Spring Boot for the backend and React for the frontend.

## Prerequisites

- Java 17 or later
- Maven
- Node.js and npm (for the React frontend)

## Backend (Spring Boot)

Located in the root directory.

To run the backend:
```bash
mvn spring-boot:run
```

## Frontend (React)

The frontend is a React application located in the `frontend` subdirectory.

```bash
cd frontend
npm install # (Usually not needed after create-react-app, but good practice)
npm start
```

## Building for Production

To build the React app for production:
```bash
cd frontend
npm run build
```

The build output will be in the `frontend/build` directory. For production, these static files can be copied to the Spring Boot `src/main/resources/static` directory to be served by the backend.
