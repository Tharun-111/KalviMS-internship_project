/**
 * KalviMS Database Seed Script
 * Run: node seed.js
 * Seeds admin, teacher, student accounts + a sample course
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Course = require('./models/Course');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@kalvims.com',
      password: 'admin123',
      role: 'admin',
    });

    const teacher = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'teacher@kalvims.com',
      password: 'teacher123',
      role: 'teacher',
    });

    const student1 = await User.create({
      name: 'Alice Smith',
      email: 'student@kalvims.com',
      password: 'student123',
      role: 'student',
    });

    const student2 = await User.create({
      name: 'Bob Kumar',
      email: 'bob@kalvims.com',
      password: 'student123',
      role: 'student',
    });

    console.log('👤 Users created');

    // Create courses
    await Course.create({
      title: 'Data Structures & Algorithms',
      code: 'CS301',
      description: 'Fundamental data structures including arrays, linked lists, trees, and graphs.',
      teacher: teacher._id,
      students: [student1._id, student2._id],
      semester: 'Semester 3',
      credits: 4,
    });

    await Course.create({
      title: 'Database Management Systems',
      code: 'CS302',
      description: 'Relational databases, SQL, normalization, and transaction management.',
      teacher: teacher._id,
      students: [student1._id],
      semester: 'Semester 3',
      credits: 3,
    });

    await Course.create({
      title: 'Web Development',
      code: 'CS303',
      description: 'Full-stack web development with modern frameworks.',
      semester: 'Semester 4',
      credits: 3,
    });

    console.log('📚 Courses created');

    console.log('\n🎉 Seed complete!\n');
    console.log('Login credentials:');
    console.log('  Admin:   admin@kalvims.com   / admin123');
    console.log('  Teacher: teacher@kalvims.com / teacher123');
    console.log('  Student: student@kalvims.com / student123');
    console.log('  Student: bob@kalvims.com     / student123\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
