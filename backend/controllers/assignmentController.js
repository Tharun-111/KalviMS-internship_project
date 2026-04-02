const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');

// @desc    Get all assignments (filtered by role)
// @route   GET /api/assignments
// @access  Private
const getAssignments = async (req, res, next) => {
  try {
    let courseIds = [];

    if (req.user.role === 'teacher') {
      const courses = await Course.find({ teacher: req.user._id }).select('_id');
      courseIds = courses.map((c) => c._id);
    } else if (req.user.role === 'student') {
      const courses = await Course.find({ students: req.user._id }).select('_id');
      courseIds = courses.map((c) => c._id);
    }

    const query = req.user.role === 'admin' ? {} : { course: { $in: courseIds } };

    const assignments = await Assignment.find(query)
      .populate('course', 'title code')
      .populate('createdBy', 'name')
      .sort('-createdAt');

    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get assignments by course
// @route   GET /api/assignments/course/:courseId
// @access  Private
const getCourseAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate('course', 'title code')
      .sort('-createdAt');
    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Teacher, Admin
const createAssignment = async (req, res, next) => {
  try {
    const { courseId, title, description, deadline, totalMarks } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (
      req.user.role === 'teacher' &&
      course.teacher?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const assignment = await Assignment.create({
      course: courseId,
      title,
      description,
      deadline,
      totalMarks,
      createdBy: req.user._id,
    });

    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Teacher, Admin
const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Teacher, Admin
const deleteAssignment = async (req, res, next) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    await Submission.deleteMany({ assignment: req.params.id });
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Student
const submitAssignment = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please upload a file' });

    const submission = await Submission.findOneAndUpdate(
      { assignment: req.params.id, student: req.user._id },
      {
        assignment: req.params.id,
        student: req.user._id,
        fileUrl: req.file.path,
        fileName: req.file.originalname,
        submittedAt: new Date(),
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
};

// @desc    Get submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Teacher, Admin
const getSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student', 'name email')
      .sort('-submittedAt');

    res.json(submissions);
  } catch (error) {
    next(error);
  }
};

// @desc    Grade a submission
// @route   PUT /api/assignments/submissions/:submissionId/grade
// @access  Teacher, Admin
const gradeSubmission = async (req, res, next) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      { grade, feedback },
      { new: true }
    ).populate('student', 'name email');

    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    res.json(submission);
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's own submissions
// @route   GET /api/assignments/my-submissions
// @access  Student
const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate({
        path: 'assignment',
        populate: { path: 'course', select: 'title code' },
      })
      .sort('-submittedAt');

    res.json(submissions);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssignments,
  getCourseAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getSubmissions,
  gradeSubmission,
  getMySubmissions,
};
