const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    // Exam types
    internal: { type: Number, default: 0, min: 0, max: 50 },
    midterm:  { type: Number, default: 0, min: 0, max: 50 },
    final:    { type: Number, default: 0, min: 0, max: 100 },
    // Auto-calculated
    total:    { type: Number, default: 0 },
    grade:    { type: String, default: '' },
    remarks:  { type: String, default: '' },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// One marks record per student per course
marksSchema.index({ student: 1, course: 1 }, { unique: true });

// Auto-calculate total and grade before save
marksSchema.pre('save', function (next) {
  this.total = this.internal + this.midterm + this.final;
  if (this.total >= 180) this.grade = 'A+';
  else if (this.total >= 160) this.grade = 'A';
  else if (this.total >= 140) this.grade = 'B+';
  else if (this.total >= 120) this.grade = 'B';
  else if (this.total >= 100) this.grade = 'C';
  else this.grade = 'F';
  next();
});

module.exports = mongoose.model('Marks', marksSchema);
