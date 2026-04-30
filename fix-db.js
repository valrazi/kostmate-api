const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.development' });

async function fix() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'Manto88@',
    database: process.env.DB_NAME || 'kostmate',
    port: process.env.DB_PORT || 3307,
  });

  const rentalId = '18ae14da-a3e2-4d98-ae6d-8e81fd9701e9';
  console.log(`Restoring rental ${rentalId}...`);
  
  const [result] = await connection.execute(
    'UPDATE rentals SET deleted_at = NULL WHERE id = ?',
    [rentalId]
  );
  
  console.log('Update result:', result);
  await connection.end();
}

fix().catch(console.error);
