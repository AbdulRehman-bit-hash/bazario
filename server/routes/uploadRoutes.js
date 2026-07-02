import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadProductImages, uploadAvatar } from '../config/cloudinary.js';

const router = express.Router();

router.post('/product-images', protect, (req, res, next) => {
  uploadProductImages(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    const images = req.files.map((f) => ({ url: f.path, public_id: f.filename }));
    res.json({ images });
  });
});

router.post('/avatar', protect, (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    res.json({ url: req.file.path, public_id: req.file.filename });
  });
});

export default router;
