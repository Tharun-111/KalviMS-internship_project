const Material = require('../models/Material');
const Course = require('../models/Course');

// @desc    Get materials (filtered by role)
// @route   GET /api/materials
// @access  Private
const getMaterials = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      const courses = await Course.find({ students: req.user._id }).select('_id');
      query.course = { $in: courses.map((c) => c._id) };
    } else if (req.user.role === 'teacher') {
      const courses = await Course.find({ teacher: req.user._id }).select('_id');
      query.course = { $in: courses.map((c) => c._id) };
    }

    const materials = await Material.find(query)
      .populate('course', 'title code')
      .populate('uploadedBy', 'name')
      .sort('-createdAt');

    res.json(materials);
  } catch (error) {
    next(error);
  }
};

// @desc    Get materials by course
// @route   GET /api/materials/course/:courseId
// @access  Private
const getCourseMaterials = async (req, res, next) => {
  try {
    const materials = await Material.find({ course: req.params.courseId })
      .populate('uploadedBy', 'name')
      .sort('-createdAt');
    res.json(materials);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload material
// @route   POST /api/materials
// @access  Teacher, Admin
const uploadMaterial = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please upload a file' });

    const { courseId, title, description } = req.body;

    const material = await Material.create({
      course: courseId,
      title,
      description,
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      uploadedBy: req.user._id,
    });

    res.status(201).json(material);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Teacher, Admin
const deleteMaterial = async (req, res, next) => {
  try {
    await Material.findByIdAndDelete(req.params.id);
    res.json({ message: 'Material deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMaterials, getCourseMaterials, uploadMaterial, deleteMaterial };
