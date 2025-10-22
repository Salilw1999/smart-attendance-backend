# Student Attendance Application - Frontend

This project is a student attendance application built with React and TypeScript. It provides functionalities for capturing student photos using a camera module, manually uploading student photos, displaying attendance records, and exporting attendance data to an Excel sheet.

## Features

- **Camera Module**: Capture student photos directly from the application.
- **Manual Photo Upload**: Upload student photos from your device.
- **Dashboard**: View attendance statistics and manage student records.
- **Attendance Table**: Display attendance records in a user-friendly table format.
- **Excel Export**: Export attendance data to an Excel sheet for reporting purposes.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd student-attendance-app/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

### Running the Application

To start the development server, run:
```
npm start
```
The application will be available at `http://localhost:3000`.

### Building for Production

To create a production build, run:
```
npm run build
```
This will generate a `build` directory with the production-ready files.

## Folder Structure

- `public/`: Contains static files like `index.html`.
- `src/`: Contains the source code for the application.
  - `components/`: Reusable components such as `CameraCapture`, `ManualPhotoUpload`, `Dashboard`, etc.
  - `pages/`: Different pages of the application.
  - `hooks/`: Custom hooks for managing state and side effects.
  - `services/`: API service for making requests to the backend.
  - `types/`: TypeScript types and interfaces.

## Docker

To build and run the frontend application using Docker, use the provided `Dockerfile` in the `frontend` directory.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.