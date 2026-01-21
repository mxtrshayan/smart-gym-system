CREATE DATABASE IF NOT EXISTS gym_wellness;
USE gym_wellness;

-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    gender ENUM('Male','Female','Other'),
    age INT,
    fitness_goal VARCHAR(100),
    trainer_id INT,
    booking_time VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Trainers Table
CREATE TABLE trainers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    specialty VARCHAR(100),
    experience VARCHAR(50),
    availability VARCHAR(255)
);

-- 3. Foods Table
CREATE TABLE foods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    calories INT,
    protein FLOAT,
    carbs FLOAT,
    fat FLOAT
);

-- 4. Health Tips Table
CREATE TABLE health_tips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tip_text TEXT
);