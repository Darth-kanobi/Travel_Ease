import pool from './database.js';

async function seedDatabase() {
  try {
    // Insert sample flights
    await pool.execute(`
      INSERT INTO flights (flight_number, departure_city, arrival_city, departure_time, arrival_time, price, seats_available)
      VALUES ?
    `, [
      [
        ['AI101', 'Mumbai', 'Delhi', '2023-12-15 08:00:00', '2023-12-15 10:15:00', 4999.00, 120],
        ['AI102', 'Delhi', 'Mumbai', '2023-12-15 11:00:00', '2023-12-15 13:15:00', 4999.00, 120],
        // Add more flights as needed
      ]
    ]);

    // Insert sample hotels
    await pool.execute(`
      INSERT INTO hotels (name, city, price_per_night, rooms_available, amenities)
      VALUES ?
    `, [
      [
        ['Taj Mahal Palace', 'Mumbai', 12000.00, 50, 'Pool, Spa, Restaurant'],
        ['The Oberoi', 'Delhi', 15000.00, 40, 'Pool, Gym, Restaurant'],
        // Add more hotels as needed
      ]
    ]);

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    pool.end();
  }
}

seedDatabase();