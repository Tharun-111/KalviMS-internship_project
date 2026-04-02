const express = require('express');
const router = express.Router();
const {
  markAttendance, getCourseAttendance, getStudentAttendance, getAttendanceByDate,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('teacher', 'admin'), markAttendance);
router.get('/course/:courseId', authorize('teacher', 'admin'), getCourseAttendance);
router.get('/course/:courseId/date/:date', authorize('teacher', 'admin'), getAttendanceByDate);
router.get('/student/:studentId', getStudentAttendance);

module.exports = router;
