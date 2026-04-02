const express = require('express');
const router = express.Router();
const {
  getAssignments, getCourseAssignments, createAssignment, updateAssignment,
  deleteAssignment, submitAssignment, getSubmissions, gradeSubmission, getMySubmissions,
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');
const { uploadSubmission } = require('../config/cloudinary');

router.use(protect);

router.get('/my-submissions', authorize('student'), getMySubmissions);

router.route('/')
  .get(getAssignments)
  .post(authorize('teacher', 'admin'), createAssignment);

router.get('/course/:courseId', getCourseAssignments);

router.route('/:id')
  .put(authorize('teacher', 'admin'), updateAssignment)
  .delete(authorize('teacher', 'admin'), deleteAssignment);

router.post('/:id/submit', authorize('student'), uploadSubmission.single('file'), submitAssignment);
router.get('/:id/submissions', authorize('teacher', 'admin'), getSubmissions);
router.put('/submissions/:submissionId/grade', authorize('teacher', 'admin'), gradeSubmission);

module.exports = router;
