# https://metrosync-backend-beta.vercel.app/ 
# this is the deplyment link


# https://github.com/youssefibrahemdonia/metrosync-backend.git
## git hub repo 
# METROSYNC // TRANSIT GRID TERMINAL

A full-stack web application designed for monitoring transit grid stations, managing arrival schedules, reserving seating slots, and tracking live user telemetry across stations.

---

## 🚀 Features

- **Terminal-Themed Interface:** Built with a clean, high-contrast cyber-transit aesthetic.
- **Role-Based Authentication:** Secure JWT-based registration and login system supporting both standard users and administrators.
- **Admin Management:** Dedicated dashboard for administrators to add, inspect, and delete transit stations and metro schedules.
- **Live User Tracking:** Real-time backend tracking that updates the active user counter only when a real user joins or leaves a station feed.
- **Interactive Station Views:** Detailed station feeds including time-slot reservations and embedded Google Maps integration.

---

## 📁 Project Structure

```text
metrosync/
├── server.js               # Entry point for the Express server
├── package.json             # Project dependencies and scripts
├── postman/                 # API collection exports for testing
│   └── metrosync_api.json
├── src/
│   ├── models/               # Mongoose schemas (User, Station)
│   ├── middleware/            # Authentication & role verification middleware
│   ├── controllers/           # Route logic and handlers
│   └── routes/                # Express routers (Auth, Stations)
└── public/                  # Frontend static assets
    ├── index.html             # Login / terminal entry
    ├── dashboard.html          # User transit grid dashboard
    ├── admin-dashboard.html    # Admin control panel
    ├── style.css               # Global terminal stylesheet
    ├── auth.js                 # Login & registration frontend logic
    ├── script.js                # User dashboard client logic
    └── admin.js                 # Admin dashboard client logic
```

---

## 🛠️ Prerequisites & Tech Stack

- **Node.js** (v16+ recommended)
- **MongoDB** (running locally or via a cloud connection string)
- **Postman** (optional, for API endpoint testing)

---

## ⚙️ Installation & Setup

1. **Clone the repository or download the project files:**

   ```bash
   cd metrosync
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env` file in the root directory and add the following configuration:

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/metrosync
   JWT_SECRET=your_super_secret_jwt_key
   ```

4. **Start the server:**

   ```bash
   npm start
   ```

5. **Access the application:**

   Open your browser and navigate to:

   ```text
   http://localhost:5000
   ```

---

## 🔌 API Endpoints Overview

| Method | Endpoint                       | Description                        | Access      |
|--------|---------------------------------|-------------------------------------|-------------|
| GET    | `/health`                       | Server health check                 | Public      |
| POST   | `/api/v1/auth/register`         | Register a new user/admin           | Public      |
| POST   | `/api/v1/auth/login`            | Authenticate and get JWT token      | Public      |
| GET    | `/api/v1/stations`              | Retrieve all transit stations       | Public      |
| POST   | `/api/v1/stations`              | Create a new station & schedule     | Admin Only  |
| DELETE | `/api/v1/stations/:id`          | Remove a station from the grid      | Admin Only  |
| POST   | `/api/v1/stations/:id/join`     | Increment real user counter         | Public      |
| POST   | `/api/v1/stations/:id/leave`    | Decrement real user counter         | Public      |

---

## 📄 License

This project is open-source and available under the **MIT License**.
