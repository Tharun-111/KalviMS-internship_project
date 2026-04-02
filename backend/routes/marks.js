const express = require('express');
const router = express.Router();
const { getStudentMarks, getCourseMarks, upsertMarks, deleteMarks, getMyMarks } =
  require('../controllers/marksController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/me', authorize('student'), getMyMarks);
router.get('/student/:studentId', getStudentMarks);
router.get('/course/:courseId', authorize('teacher', 'admin'), getCourseMarks);
router.post('/', authorize('teacher', 'admin'), upsertMarks);
router.delete('/:id', authorize('admin'), deleteMarks);

module.exports = router;
