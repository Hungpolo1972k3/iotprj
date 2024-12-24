const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const connectDb = require('./connectDb');
const Image = require('./model');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
connectDb();

const storage = multer.memoryStorage(); 
const upload = multer({ storage });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const result = await cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      async (error, result) => {
        if (error) {
          return res.status(500).send('Cloudinary upload failed');
        }

        const image = new Image({
          imageUrl: result.secure_url,
          cloudinaryId: result.public_id,
        });

        await image.save();
      }
    );
    result.end(req.file.buffer);
    const latestImage = await Image.findOne().sort({ createdAt: -1 }).exec();

    if (!latestImage) {
      return res.status(404).send('No images found');
    }
    res.status(200).json({
        imageUrl: latestImage.imageUrl,
        cloudinaryId: latestImage.cloudinaryId,
        createdAt: latestImage.createdAt,
      });
  } catch (error) {
    res.status(500).send('Error during file upload');
  }
});

app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
