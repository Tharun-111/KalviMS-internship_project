import api from './axios';

// ─── Auth ────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  createUser: (data) => api.post('/auth/create-user', data),
};

// ─── Users ───────────────────────────────────────────────
export const usersAPI = {
  getAll: (role) => api.get('/users', { params: { role } }),
  getOne: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
};

// ─── Courses ──────────────────────────────────────────────
export const coursesAPI = {
  getAll: () => api.get('/courses'),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  assignTeacher: (id, teacherId) => api.put(`/courses/${id}/assign-teacher`, { teacherId }),
  enrollStudent: (id, studentId) => api.put(`/courses/${id}/enroll`, { studentId }),
  unenrollStudent: (id, studentId) => api.put(`/courses/${id}/unenroll`, { studentId }),
  getTeachers: () => api.get('/courses/teachers'),
  getStudents: () => api.get('/courses/students'),
};

// ─── Attendance ───────────────────────────────────────────
export const attendanceAPI = {
  mark: (data) => api.post('/attendance', data),
  getByCourse: (courseId) => api.get(`/attendance/course/${courseId}`),
  getByStudent: (studentId) => api.get(`/attendance/student/${studentId}`),
  getByDate: (courseId, date) => api.get(`/attendance/course/${courseId}/date/${date}`),
};

// ─── Assignments ─────────────────────────────────────────
export const assignmentsAPI = {
  getAll: () => api.get('/assignments'),
  getByCourse: (courseId) => api.get(`/assignments/course/${courseId}`),
  create: (data) => api.post('/assignments', data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
  submit: (id, formData) => api.post(`/assignments/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getSubmissions: (id) => api.get(`/assignments/${id}/submissions`),
  grade: (submissionId, data) => api.put(`/assignments/submissions/${submissionId}/grade`, data),
  getMySubmissions: () => api.get('/assignments/my-submissions'),
};

// ─── Materials ────────────────────────────────────────────
export const materialsAPI = {
  getAll: () => api.get('/materials'),
  getByCourse: (courseId) => api.get(`/materials/course/${courseId}`),
  upload: (formData) => api.post('/materials', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/materials/${id}`),
};

// ─── Marks ───────────────────────────────────────────────
export const marksAPI = {
  getMyMarks: () => api.get('/marks/me'),
  getByStudent: (studentId) => api.get(`/marks/student/${studentId}`),
  getByCourse: (courseId) => api.get(`/marks/course/${courseId}`),
  upsert: (data) => api.post('/marks', data),
  delete: (id) => api.delete(`/marks/${id}`),
};
