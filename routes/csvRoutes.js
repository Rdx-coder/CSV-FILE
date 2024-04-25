// Importing required modules
const express = require('express'); // Express framework for routing
const router = express.Router(); // Creating router object for defining routes
const multer = require('multer'); // Middleware for handling file uploads

// Importing controllers
const homeController = require('../controllers/home_controller'); // Controller for home routes
const csvController = require('../controllers/csv_controller'); // Controller for CSV routes

// Configuring multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Defining routes
router.get('/', homeController.home); // Route for home page
router.get('/csv/:id', csvController.view); // Route for viewing a CSV file
router.post('/upload', upload.single('csv') ,csvController.upload); // Route for uploading a CSV file

// Exporting router object
module.exports = router;
