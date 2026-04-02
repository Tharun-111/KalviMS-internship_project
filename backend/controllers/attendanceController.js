const Attendance = require('../models/Attendance');
const Course = require('../models/Course');

// @desc    Mark attendance for a course
// @route   POST /api/attendance
// @access  Teacher
const markAttendance = async (req, res, next) => {
  try {
    const { courseId, date, records } = req.body;
    // records: [{ student: id, status: 'present'|'absent'|'late' }]

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Check if teacher owns this course
    if (
      req.user.role === 'teacher' &&
      course.teacher?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Upsert attendance record
    const attendance = await Attendance.findOneAndUpdate(
      { course: courseId, date: attendanceDate },
      { course: courseId, date: attendanceDate, records, markedBy: req.user._id },
      { upsert: true, new: true, runValidators: true }
    ).populate('records.student', 'name');

    res.status(201).json(attendance);
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance for a course
// @route   GET /api/attendance/course/:courseId
// @access  Teacher, Admin
const getCourseAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.find({ course: req.params.courseId })
      .populate('records.student', 'name email')
      .sort('-date');

    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

// @desc    Get student attendance percentage per course
// @route   GET /api/attendance/student/:studentId
// @access  Student (own), Teacher, Admin
const getStudentAttendance = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;

    // Students can only view their own
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all courses the student is enrolled in
    const courses = await Course.find({ students: studentId }).select('title code');

    const result = await Promise.all(
      courses.map(async (course) => {
        const allAttendance = await Attendance.find({ course: course._id });

        const totalClasses = allAttendance.length;
        let presentCount = 0;

        allAttendance.forEach((att) => {
          const record = att.records.find(
            (r) => r.student.toString() === studentId
          );
          if (record && (record.status === 'present' || record.status === 'late')) {
            presentCount++;
          }
        });

        const percentage =
          totalClasses === 0
            ? 0
            : Math.round((presentCount / totalClasses) * 100);

        return {
          course: { _id: course._id, title: course.title, code: course.code },
          totalClasses,
          presentCount,
          percentage,
        };
      })
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance for a specific date and course
// @route   GET /api/attendance/course/:courseId/date/:date
// @access  Teacher, Admin
const getAttendanceByDate = async (req, res, next) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      course: req.params.courseId,
      date,
    }).populate('records.student', 'name email');

    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  getCourseAttendance,
  getStudentAttendance,
  getAttendanceByDate,
};
