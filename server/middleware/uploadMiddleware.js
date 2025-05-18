const multer = require('multer');

// Configure storage to use memory storage instead of disk storage
const storage = multer.memoryStorage();

// File filter to only allow PDFs and DOCs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || 
      file.mimetype === 'application/msword' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Word documents are allowed!'), false);
  }
};

// Configure upload
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload; 