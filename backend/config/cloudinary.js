const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for assignment submissions
const submissionStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'kalvims/submissions',
    allowed_formats: ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'zip'],
    resource_type: 'raw',
  },
});

// Storage for study materials
const materialStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'kalvims/materials',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx'],
    resource_type: 'raw',
  },
});

const uploadSubmission = multer({ storage: submissionStorage });
const uploadMaterial = multer({ storage: materialStorage });

module.exports = { cloudinary, uploadSubmission, uploadMaterial };
