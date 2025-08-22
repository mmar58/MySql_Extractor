# MySQL Exporter Web App

This project is a Node.js web application that allows you to:
- Connect to a MySQL database using credentials provided via a web UI
- Export each table's structure and data as separate SQL files
- Download the generated SQL files from the browser
- Delete generated SQL files from the UI

## Features
- Express.js backend with Socket.IO for real-time communication
- MySQL database access using `mysql2`
- All generated SQL files are saved in `public/generated_sql`
- Simple HTML UI for database connection, export, download, and file deletion
- Hot-reload development with `nodemon`

## Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- npm
- A MySQL database to connect to

### Installation
1. Clone or copy this repository.
2. Install dependencies:
   ```
   npm install
   ```

### Running the App
- For production:
  ```
  npm start
  ```
- For development (auto-reload):
  ```
  npm run dev
  ```

The server will start on [http://localhost:3000](http://localhost:3000)

### Usage
1. Open your browser and go to [http://localhost:3000](http://localhost:3000)
2. Enter your MySQL credentials and database name
3. Click **Export Tables**
4. Download the generated SQL files for each table (structure and data)
5. Use the delete option to remove generated SQL files from the server

### Project Structure
- `src/server.js` - Express + Socket.IO backend
- `public/index.html` - Web UI
- `public/generated_sql/` - Folder for generated SQL files
- `db_credentials.ts` - Example credentials (not used by the web UI)

### Customization
- You can modify the UI in `public/index.html`
- Backend logic can be changed in `src/server.js`

### License
MIT
