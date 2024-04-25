// Importing required modules
const fs = require('fs'); // File system module for file operations
const csv = require('csv-parser'); // Module for parsing CSV files
const CSV = require('../models/csvModel'); // Importing CSV model for MongoDB
const path = require('path'); // Module for handling file paths

// Function to handle file uploads
module.exports.upload = async function (req, res) {

  try {
    // Checking if a file was uploaded
    if (!req.file) {
      return res.status(400).send('No files were uploaded.'); // Handling error if no file is present
    }

    // Checking if the uploaded file is a CSV file
    if (req.file.mimetype !== 'text/csv') {
      return res.status(400).send('Only CSV files are allowed.'); // Handling error if file is not CSV
    }
  
    // Parsing the uploaded CSV file and storing it in an array
    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        // Saving CSV data to the database
        if (req.file) {
          const oldPath = req.file.path;
          const newPath = path.join(__dirname, '../uploads', req.file.originalname);
          fs.rename(oldPath, newPath, (err) => {
            if (err) throw err;
          });
          const csvData = new CSV({
            filename: req.file.originalname,
            header_row: results[0],
            data_rows: results.slice(1),
          });
          await csvData.save();
        } else {
          res.status(400).send('No file uploaded');
        }

        // Redirecting to home page after upload
        return res.redirect('/');
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Function to view a CSV file
module.exports.view = async function (req, res) {
  try {
    const csvFile = await CSV.findById(req.params.id);
    if (!csvFile) {
      return res.status(404).send('File not found');
    }

    // Read CSV file contents
    const uploadsPath = path.join(__dirname, '../uploads');
    const fileData = await new Promise((resolve, reject) => {
      fs.readFile(path.join(uploadsPath, csvFile.filename), 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          // Parsing the CSV data and preparing it for view
          const rows = data.trim().split('\n');
          const header_row = rows[0].split(',');
          const data_rows = rows.slice(1).map(row => {
            const row_data = {};
            row.split(',').forEach((value, index) => {
              row_data[header_row[index]] = value;
            });
            return row_data;
          });
          resolve({ filename: csvFile.filename, header_row, data_rows });
        }
      });
    });

    // Rendering the CSV view template with the parsed CSV data
    res.render('csv_view', {
      fileData,
      title: 'CSV file',
      style: '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">',
      script: '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4" crossorigin="anonymous"></script>',
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
}
