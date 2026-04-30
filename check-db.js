const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.development' });

async function check() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'Manto88@',
    database: process.env.DB_NAME || 'kostmate',
    port: process.env.DB_PORT || 3307,
  });

  console.log('Checking rentals...');
  const [rentals] = await connection.execute('SELECT * FROM rentals WHERE id = "18ae14da-a3e2-4d98-ae6d-8e81fd9701e9"');
  console.log('Rental details:', rentals[0]);

  console.log('Checking payments...');
  const [payments] = await connection.execute('SELECT * FROM payments WHERE rental_id = "18ae14da-a3e2-4d98-ae6d-8e81fd9701e9"');
  console.log('Generated payments:', payments.length);
  console.log(payments);
  
  await connection.end();
}

check().catch(console.error);
