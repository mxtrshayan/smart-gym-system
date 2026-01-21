const express = require('express');
const router = express.Router();
const db = require('./db');


router.post('/register', (req, res) => {
    const { firstName, lastName, email, phone, gender, age, fitnessGoal } = req.body;

    if (!firstName || !email || !fitnessGoal) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const sql = `INSERT INTO users (first_name, last_name, email, phone, gender, age, fitness_goal) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [firstName, lastName, email, phone, gender, age, fitnessGoal], (err, result) => {
        if (err) {
            console.error(err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: "Email already registered." });
            }
            return res.status(500).json({ message: "Database error." });
        }
        res.status(201).json({ success: true, userId: result.insertId, message: "User registered!" });
    });
});


router.get('/trainers', (req, res) => {
    const goal = req.query.goal;
    const search = req.query.search;
    
    let sql = "SELECT * FROM trainers";
    let params = [];

    if (search) {
        sql += " WHERE name LIKE ? OR id = ?";
        params.push(`%${search}%`, search);
    } else if (goal) {
        sql += " WHERE specialty LIKE ?";
        params.push(`%${goal}%`);
    }

    sql += " ORDER BY id ASC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results);
    });
});


router.post('/book-trainer', (req, res) => {
    const { userId, trainerId, timeSlot } = req.body;
    const sql = "UPDATE users SET trainer_id = ?, booking_time = ? WHERE id = ?";
    
    db.query(sql, [trainerId, timeSlot, userId], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ success: true, message: "Booking confirmed" });
    });
});


router.get('/foods', (req, res) => {
    const search = req.query.search;
    let sql = "SELECT * FROM foods";
    let params = [];

    if (search) {
        sql += " WHERE name LIKE ?";
        params.push(`%${search}%`);
    }

    sql += " ORDER BY name ASC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results);
    });
});



router.get('/tips', (req, res) => {
    db.query("SELECT * FROM health_tips ORDER BY RAND() LIMIT 1", (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results[0] || { tip_text: "Stay healthy!" });
    });
});


router.get('/admin/users', (req, res) => {
    const search = req.query.search;
    let params = [];

    
    let sql = `
        SELECT users.id, users.first_name, users.last_name, users.email, users.phone, users.age, users.gender,
               users.fitness_goal, users.booking_time, trainers.name AS trainer_name
        FROM users
        LEFT JOIN trainers ON users.trainer_id = trainers.id
    `;

    if (search) {
        sql += " WHERE users.first_name LIKE ? OR users.last_name LIKE ? OR users.id = ?";
        params.push(`%${search}%`, `%${search}%`, search);
    }

    sql += " ORDER BY users.id ASC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results);
    });
});

router.put('/admin/users/:id', (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, phone, age, gender, fitnessGoal, trainerId, bookingTime } = req.body;

    const sql = `UPDATE users SET first_name=?, last_name=?, email=?, phone=?, age=?, gender=?, fitness_goal=?, trainer_id=?, booking_time=? WHERE id=?`;

    db.query(sql, [firstName, lastName, email, phone, age, gender, fitnessGoal, trainerId, bookingTime, id], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ success: true, message: "User updated" });
    });
});


router.post('/admin/trainers', (req, res) => {
    const { name, specialty, experience, availability } = req.body;
    const sql = "INSERT INTO trainers (name, specialty, experience, availability) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, specialty, experience, availability], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ success: true, id: result.insertId });
    });
});


router.put('/admin/trainers/:id', (req, res) => {
    const { id } = req.params;
    const { name, specialty, experience, availability } = req.body;
    
    const sql = "UPDATE trainers SET name=?, specialty=?, experience=?, availability=? WHERE id=?";
    
    db.query(sql, [name, specialty, experience, availability, id], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });

        
        const cascadeSql = "UPDATE users SET booking_time = ? WHERE trainer_id = ?";
        db.query(cascadeSql, [availability, id], (cascadeErr) => {
            if (cascadeErr) console.error("Cascade Error:", cascadeErr);
        });

        res.json({ success: true, message: "Trainer updated & Users synced" });
    });
});


router.post('/admin/foods', (req, res) => {
    const { name, calories, protein, carbs, fat } = req.body;

    db.query("SELECT id FROM foods WHERE name = ?", [name], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        
        if (results.length > 0) {
            return res.status(409).json({ error: "Food already exists" });
        }

        const sql = "INSERT INTO foods (name, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [name, calories, protein, carbs, fat], (err, result) => {
            if (err) return res.status(500).json({ error: "Database error" });
            res.json({ success: true, id: result.insertId });
        });
    });
});


router.get('/admin/tips', (req, res) => {
    db.query("SELECT * FROM health_tips", (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results);
    });
});

router.post('/admin/tips', (req, res) => {
    const { tip_text } = req.body;
    db.query("INSERT INTO health_tips (tip_text) VALUES (?)", [tip_text], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ success: true, id: result.insertId });
    });
});


router.delete('/admin/delete/:table/:id', (req, res) => {
    const { table, id } = req.params;

    const allowedTables = ['users', 'trainers', 'foods', 'health_tips'];
    if (!allowedTables.includes(table)) {
        return res.status(400).json({ error: "Invalid table name" });
    }

    const sql = `DELETE FROM ${table} WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ success: true, message: "Deleted" });
    });
});

module.exports = router;