const express = require('express');
const router = express.Router();
const {
  getMaterials, getCourseMaterials, uploadMaterial, deleteMaterial,
} = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/auth');
const { uploadMaterial: upload } = require('../config/cloudinary');

router.use(protect);

router.route('/')
  .get(getMaterials)
  .post(authorize('teacher', 'admin'), upload.single('file'), uploadMaterial);

router.get('/course/:courseId', getCourseMaterials);
router.delete('/:id', authorize('teacher', 'admin'), deleteMaterial);

module.exports = router;
