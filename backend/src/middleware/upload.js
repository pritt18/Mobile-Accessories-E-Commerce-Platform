const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/products';
    if (req.originalUrl.includes('banner')) folder = 'uploads/banners';
    if (req.originalUrl.includes('review')) folder = 'uploads/reviews';
    if (req.originalUrl.includes('avatar')) folder = 'uploads/avatars';

    const fullPath = path.join(__dirname, '../../', folder);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|svg/;
  const mime = allowedTypes.test(file.mimetype);
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mime && ext) {
    return cb(null, true);
  }
  cb(new Error('Only image files (JPEG, PNG, WebP, SVG) are allowed!'));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

module.exports = upload;
