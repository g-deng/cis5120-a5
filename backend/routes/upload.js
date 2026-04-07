const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const supabase = require('../supabase');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// POST /api/upload/image — upload image to Supabase Storage
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // Generate unique filename
    const ext = path.extname(req.file.originalname);
    const filename = `${crypto.randomUUID()}${ext}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('project-images')
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('project-images')
      .getPublicUrl(filename);

    res.status(201).json({ url: urlData.publicUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
