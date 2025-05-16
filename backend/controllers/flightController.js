const db = require('../db');
const client = require('../utils/client');

const crypto = require('crypto');


//generates a unique hash (ID) for the flight search request
const hashPayload = (payload) =>
    crypto.createHash('md5').update(JSON.stringify(payload)).digest('hex');


// get cities data from the redis DB if not found query sql
async function getCities(req, res) {
    try {
        const cached = await client.get('cities');
        if (cached) return res.json(JSON.parse(cached));

        const [rows] = await db.query('SELECT * FROM cities');
        await client.setex('cities', 3600, JSON.stringify(rows));
        res.json(rows);
    } catch (err) {
        console.log("Error", err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

async function searchFlights(req, res) {
    try {
        const { from, to, date, classType, fareType, airline, minPrice, maxPrice, timeSlot } = req.body;
        const hash = hashPayload(req.body);
        const cached = await client.get(`search:${hash}`);
        // we do json.parse to convert json data to js object
        if (cached) return res.json(JSON.parse(cached));

        let query = `
            SELECT f.*, c1.name AS from_city, c2.name AS to_city
            FROM flights f
            JOIN cities c1 ON f.from_city_id = c1.id
            JOIN cities c2 ON f.to_city_id = c2.id
            WHERE f.from_city_id = ? AND f.to_city_id = ? AND f.date = ? AND f.class = ? AND f.fare_type = ?
        `;
        const params = [from, to, date, classType, fareType];

        if (airline) {
            query += ' AND f.airline = ?';
            params.push(airline);
        }
        if (minPrice && maxPrice) {
            query += ' AND f.price BETWEEN ? AND ?';
            params.push(minPrice, maxPrice);
        }
        if (timeSlot) {
            if (timeSlot === 'morning') query += ` AND f.departure_time BETWEEN '06:00:00' AND '11:59:59'`;
            else if (timeSlot === 'afternoon') query += ` AND f.departure_time BETWEEN '12:00:00' AND '17:59:59'`;
            else if (timeSlot === 'evening') query += ` AND f.departure_time BETWEEN '18:00:00' AND '23:59:59'`;
        }

        const [flights] = await db.query(query, params);
        await client.setex(`search:${hash}`, 300, JSON.stringify(flights));
        res.status(200).json(flights);
    } catch (err) {
        console.error('Flight Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }

};

async function bookFlight(req, res) {
    try {
        const { user_id, flight_id, passengers, travel_class, round_trip, return_date } = req.body;

        await db.query(`
        INSERT INTO bookings (user_id, flight_id, passengers, travel_class, round_trip, return_date)
        VALUES (?, ?, ?, ?, ?, ?)
        `, [user_id, flight_id, passengers, travel_class, round_trip, return_date]);

        res.status(201).json({ message: 'Booking successful' });
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }

};

async function addFlight(req, res) {
    try {
        const { airline, from_city_id, to_city_id, date, departure_time, arrival_time, duration, price, class: classType, fare_type } = req.body;

        await db.query(`
            INSERT INTO flights (airline, from_city_id, to_city_id, date, departure_time, arrival_time, duration, price, class, fare_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [airline, from_city_id, to_city_id, date, departure_time, arrival_time, duration, price, classType, fare_type]);

        res.status(201).json({ message: 'Flight added' });
    } catch (err) {
        console.error('Add flight Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
async function deleteFlight(req, res) {
    try {
        const { id } = req.params;
        await db.query(`DELETE FROM flights WHERE id = ?`, [id]);
        res.status(202).json({ message: 'Flight deleted' });
    } catch (error) {
        console.error('Delete flight Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
async function getRevenue(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT SUM(f.price * b.passengers) AS total_revenue
            FROM bookings b
            JOIN flights f ON b.flight_id = f.id
        `);
        res.status(200).json(rows[0]);
    } catch (err) {
        console.error('Verify Email Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getCities,
    bookFlight,
    searchFlights,
    addFlight,
    deleteFlight,
    getRevenue
}