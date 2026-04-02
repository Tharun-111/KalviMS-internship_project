const Marks = require('../models/Marks');
const Course = require('../models/Course');

// @desc    Get marks for a student
// @route   GET /api/marks/student/:studentId
// @access  Student (own), Teacher, Admin
const getStudentMarks = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;

    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const marks = await Marks.find({ student: studentId })
      .populate('course', 'title code credits')
      .populate('enteredBy', 'name');

    res.json(marks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get marks for a course
// @route   GET /api/marks/course/:courseId
// @access  Teacher, Admin
const getCourseMarks = async (req, res, next) => {
  try {
    const marks = await Marks.find({ course: req.params.courseId })
      .populate('student', 'name email')
      .populate('course', 'title code');

    res.json(marks);
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update marks
// @route   POST /api/marks
// @access  Teacher, Admin
const upsertMarks = async (req, res, next) => {
  try {
    const { studentId, courseId, internal, midterm, final, remarks } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (
      req.user.role === 'teacher' &&
      course.teacher?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const marks = await Marks.findOneAndUpdate(
      { student: studentId, course: courseId },
      { student: studentId, course: courseId, internal, midterm, final, remarks, enteredBy: req.user._id },
      { upsert: true, new: true, runValidators: true }
    ).populate('student', 'name email').populate('course', 'title code');

    res.status(201).json(marks);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete marks record
// @route   DELETE /api/marks/:id
// @access  Admin
const deleteMarks = async (req, res, next) => {
  try {
    await Marks.findByIdAndDelete(req.params.id);
    res.json({ message: 'Marks deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my marks (student)
// @route   GET /api/marks/me
// @access  Student
const getMyMarks = async (req, res, next) => {
  try {
    const marks = await Marks.find({ student: req.user._id })
      .populate('course', 'title code credits');
    res.json(marks);
  } catch (error) {
    next(error);
  }
};

module.exports = { getStudentMarks, getCourseMarks, upsertMarks, deleteMarks, getMyMarks };
