# Student Attendance Application

This project is a comprehensive student attendance management system that includes features for capturing student photos using a camera module, manual photo uploads, a user-friendly dashboard for attendance tracking, and the ability to export attendance data to an Excel sheet.

## Project Structure

The project is organized into the following main directories:

- **frontend**: Contains the React application for the user interface.
- **backend**: Contains the FastAPI application for handling API requests and business logic.
- **infra**: Contains Docker and initialization scripts for setting up the infrastructure.
- **scripts**: Contains helper scripts for managing the project.

## Features

- **Camera Module**: Capture student photos directly from the application using the camera.
- **Manual Photo Upload**: Option to manually upload student photos.
- **Dashboard**: A user-friendly dashboard displaying attendance statistics and options.
- **Attendance Records**: View and manage attendance records in a table format.
- **Excel Export**: Export attendance data to an Excel sheet for reporting purposes.

## Technologies Used

- **Frontend**: React, TypeScript
- **Backend**: Python, FastAPI
- **Database**: PostgreSQL
- **Storage**: MinIO for image storage
- **Containerization**: Docker for both frontend and backend applications

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your machine.
- Python 3.8+ for backend development.
- Node.js and npm for frontend development.

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd student-attendance-app
   ```

2. Set up the environment variables:
   - Copy `.env.example` files in both `frontend` and `backend` directories to `.env` and configure them as needed.

3. Build and run the application using Docker Compose:
   ```
   cd infra
   docker-compose up --build
   ```

### Usage

- Access the frontend application at `http://localhost:3000`.
- The backend API will be available at `http://localhost:8000`.

### Exporting Attendance

To export attendance data to an Excel sheet, navigate to the Reports section in the dashboard and follow the prompts to download the report.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.