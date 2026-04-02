const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res, next) => {
  try {
    let query = {};

    // Filter based on role
    if (req.user.role === 'teacher') {
      query.teacher = req.user._id;
    } else if (req.user.role === 'student') {
      query.students = req.user._id;
    }

    const courses = await Course.find(query)
      .populate('teacher', 'name email')
      .populate('students', 'name email');

    res.json(courses);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('students', 'name email');

    if (!course) return res.status(404).json({ message: 'Course not found' });

    res.json(course);
  } catch (error) {
    next(error);
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Admin
const createCourse = async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Admin
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('teacher', 'name email');

    if (!course) return res.status(404).json({ message: 'Course not found' });

    res.json(course);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Admin
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign teacher to course
// @route   PUT /api/courses/:id/assign-teacher
// @access  Admin
const assignTeacher = async (req, res, next) => {
  try {
    const { teacherId } = req.body;
    const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { teacher: teacherId },
      { new: true }
    ).populate('teacher', 'name email');

    res.json(course);
  } catch (error) {
    next(error);
  }
};

// @desc    Enroll student in course
// @route   PUT /api/courses/:id/enroll
// @access  Admin
const enrollStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already enrolled' });
    }

    course.students.push(studentId);
    await course.save();

    res.json({ message: 'Student enrolled successfully', course });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove student from course
// @route   PUT /api/courses/:id/unenroll
// @access  Admin
const unenrollStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.students = course.students.filter(
      (s) => s.toString() !== studentId
    );
    await course.save();

    res.json({ message: 'Student unenrolled', course });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all teachers
// @route   GET /api/courses/teachers
// @access  Admin
const getTeachers = async (req, res, next) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('name email');
    res.json(teachers);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students
// @route   GET /api/courses/students
// @access  Admin, Teacher
const getStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).select('name email');
    res.json(students);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  assignTeacher,
  enrollStudent,
  unenrollStudent,
  getTeachers,
  getStudents,
};
