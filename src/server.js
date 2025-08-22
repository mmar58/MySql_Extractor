
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Socket.io connection
io.on('connection', (socket) => {
  socket.on('export-db', async (dbConfig) => {
    try {
      const connection = await mysql.createConnection(dbConfig);
      const [tables] = await connection.query('SHOW TABLES');
      const tableKey = Object.keys(tables[0])[0];
      let results = [];
      const sqlDir = path.join(__dirname, '../public/generated_sql');
      try {
        await fs.access(sqlDir);
      } catch {
        await fs.mkdir(sqlDir, { recursive: true });
      }
      for (const row of tables) {
        const tableName = row[tableKey];
        // Structure
        const [createTable] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
        const createSQL = createTable[0]['Create Table'] + ';\n';
        const structureFile = `generated_sql/${tableName}_structure.sql`;
        await fs.writeFile(path.join(sqlDir, `${tableName}_structure.sql`), createSQL, 'utf8');
        // Data
        const [rowsData] = await connection.query(`SELECT * FROM \`${tableName}\``);
        let dataFile = null;
        if (rowsData.length > 0) {
          const columns = Object.keys(rowsData[0]).map(col => `\`${col}\``).join(', ');
          const values = rowsData.map(row =>
            '(' + Object.values(row).map(val =>
              val === null ? 'NULL' :
              typeof val === 'number' ? val :
              `'${String(val).replace(/'/g, "''")}'`
            ).join(', ') + ')'
          ).join(',\n');
          const insertSQL = `INSERT INTO \`${tableName}\` (${columns}) VALUES\n${values};\n`;
          dataFile = `generated_sql/${tableName}_data.sql`;
          await fs.writeFile(path.join(sqlDir, `${tableName}_data.sql`), insertSQL, 'utf8');
        }
        results.push({ table: tableName, structureFile, dataFile });
      }
      await connection.end();
      socket.emit('export-result', { success: true, results });
    } catch (error) {
      socket.emit('export-result', { success: false, error: error.message });
    }
  });

  socket.on('delete-all-sql', async () => {
    const sqlDir = path.join(__dirname, '../public/generated_sql');
    try {
      const files = await fs.readdir(sqlDir);
      for (const file of files) {
        await fs.unlink(path.join(sqlDir, file));
      }
      socket.emit('delete-all-sql-result', { success: true });
    } catch (error) {
      socket.emit('delete-all-sql-result', { success: false, error: error.message });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
