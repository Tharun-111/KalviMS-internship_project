const express = require('express');
const router = express.Router();
const {
  getCourses, getCourse, createCourse, updateCourse, deleteCourse,
  assignTeacher, enrollStudent, unenrollStudent, getTeachers, getStudents,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/teachers', authorize('admin'), getTeachers);
router.get('/students', authorize('admin', 'teacher'), getStudents);

router.route('/')
  .get(getCourses)
  .post(authorize('admin'), createCourse);

router.route('/:id')
  .get(getCourse)
  .put(authorize('admin'), updateCourse)
  .delete(authorize('admin'), deleteCourse);

router.put('/:id/assign-teacher', authorize('admin'), assignTeacher);
router.put('/:id/enroll', authorize('admin'), enrollStudent);
router.put('/:id/unenroll', authorize('admin'), unenrollStudent);

module.exports = router;
