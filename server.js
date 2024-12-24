const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const connectDb = require('./connectDb');
const Image = require('./model');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
connectDb();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET, POST', 
    allowedHeaders: 'Content-Type',
  }));

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
    res.status(200).send("Post and save successfully!");
  } catch (error) {
    res.status(500).send('Error during file upload');
  }
});

app.get('/latest-image', async (req, res) => {
    try {
      // Lấy danh sách tất cả các tệp đã tải lên từ Cloudinary
      const result = await cloudinary.api.resources({
        type: 'upload', // Chỉ lấy các tài nguyên tải lên
        max_results: 1, // Lấy 1 tệp
        order: 'desc', // Sắp xếp theo thứ tự giảm dần theo thời gian tải lên
      });
  
      if (!result.resources || result.resources.length === 0) {
        return res.status(404).send('No images found');
      }
  
      const latestImage = result.resources[0];
  
      res.status(200).json({
        imageUrl: latestImage.secure_url,
        publicId: latestImage.public_id,
        createdAt: latestImage.created_at,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching latest image');
    }
  });

app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
