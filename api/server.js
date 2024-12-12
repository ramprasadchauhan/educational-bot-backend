const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdf = require("pdf-parse");
const { JSONLoader } = require("langchain/document_loaders/fs/json")
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = ['https://student-help-bot.netlify.app', "http://localhost:5173/"];  // Add more as needed

// Set up CORS with specific allowed origins
app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true); // Allow requests from allowed origins
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

const port = process.env.PORT || 5000;


// Set up multer storage (in-memory storage for simplicity)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); // Define the `upload` middleware



app.get('/', (req, res) => {
    run();
    res.send('Hello World!');
});


// Route to handle PDF upload and text extraction
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
    try {
        // Get the PDF file buffer from the request
        const pdfBuffer = req.file.buffer;

        // Extract text from the PDF
        const pdfText = await extractTextFromPDF(pdfBuffer);

        // Send the extracted text as a response
        res.json({ text: pdfText });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred during text extraction.' });
    }
});

// Function to extract text from PDF buffer using pdf-parse
const extractTextFromPDF = (pdfBuffer) => {
    return new Promise((resolve, reject) => {
        pdf(pdfBuffer).then(function (data) {
            resolve(data.text); // Resolve with the extracted text
        }).catch(function (error) {
            reject(error); // Reject with any error encountered
        });
    });
};

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});


