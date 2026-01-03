import axios from 'axios';

// Check for port in environment or default to 5001
// If backend is running on different port, update VITE_API_URL in .env file
// IMPORTANT: VITE_API_URL must include /api at the end!
let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Ensure API_URL ends with /api
if (!API_URL.endsWith('/api')) {
  console.warn('⚠️ API_URL should end with /api. Fixing...');
  API_URL = API_URL.endsWith('/') ? API_URL + 'api' : API_URL + '/api';
}

// Debug: Log the API URL being used
if (import.meta.env.DEV) {
  console.log('🔧 API Base URL:', API_URL);
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Debug logging
    if (import.meta.env.DEV) {
      const fullURL = config.baseURL + (config.url?.startsWith('/') ? config.url : '/' + config.url);
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${fullURL}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', {
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown',
        status: error.response?.status,
        statusText: error.response?.statusText
      });
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const login = (email, password) => {
  // Ensure the path starts with /api if baseURL doesn't include it
  const loginPath = '/users/login';
  return api.post(loginPath, { email, password });
};

// User API (Admin)
export const createUser = (userData) => 
  api.post('/users/create', userData);

export const getAllUsers = () => 
  api.get('/users/all');

export const getUserById = (userId) => 
  api.get(`/users/${userId}`);

export const updateUser = (userId, userData) => 
  api.put(`/users/${userId}`, userData);

export const deleteUser = (userId) => 
  api.delete(`/users/${userId}`);

export const getUserAnalytics = (userId, period = 'overall') => 
  api.get(`/users/${userId}/analytics?period=${period}`);

export const getCurrentUser = () => 
  api.get('/users/me');

// Task API
export const createTask = (taskData) => 
  api.post('/tasks', taskData);

export const getTasks = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/tasks?${queryString}`);
};

export const getTodayTasks = () => 
  api.get('/tasks/today');

export const updateTask = (id, taskData) => 
  api.put(`/tasks/${id}`, taskData);

export const deleteTask = (id, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.delete(`/tasks/${id}${queryString ? '?' + queryString : ''}`);
};

export const getTaskAnalytics = (period = 'overall') => 
  api.get(`/tasks/analytics?period=${period}`);

export const getWeeklyCheckbook = (weekStart, weeksCount = 2) => {
  const params = new URLSearchParams();
  if (weekStart) params.append('weekStart', weekStart);
  if (weeksCount) params.append('weeksCount', weeksCount);
  return api.get(`/tasks/weekly-checkbook?${params.toString()}`);
};

// Notification API
export const getNotifications = (read) => {
  const params = read !== undefined ? `?read=${read}` : '';
  return api.get(`/notifications${params}`);
};

export const markNotificationAsRead = (id) => 
  api.put(`/notifications/${id}/read`);

export const markAllNotificationsAsRead = () => 
  api.put('/notifications/read-all');

export const getUnreadCount = () => 
  api.get('/notifications/unread-count');

// Subtask API
export const getSubtasks = (taskId) => 
  api.get(`/subtasks/task/${taskId}`);

export const createSubtask = (taskId, subtaskData) => 
  api.post(`/subtasks/task/${taskId}`, subtaskData);

export const updateSubtask = (id, subtaskData) => 
  api.put(`/subtasks/${id}`, subtaskData);

export const deleteSubtask = (id) => 
  api.delete(`/subtasks/${id}`);

export const getTaskProgress = (taskId) => 
  api.get(`/subtasks/task/${taskId}/progress`);

// Time Entry API
export const startTimer = (taskId) => 
  api.post(`/time-entries/task/${taskId}/start`);

export const stopTimer = (taskId, notes) => 
  api.post(`/time-entries/task/${taskId}/stop`, { notes });

export const getRunningTimer = (taskId) => 
  api.get(`/time-entries/task/${taskId}/running`);

export const getTimeEntries = (taskId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/time-entries/task/${taskId}?${queryString}`);
};

export const getTimeStats = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/time-entries/stats?${queryString}`);
};

export const deleteTimeEntry = (id) => 
  api.delete(`/time-entries/${id}`);

// Habit API
export const getHabits = () => 
  api.get('/habits');

export const createHabit = (habitData) => 
  api.post('/habits', habitData);

export const updateHabit = (id, habitData) => 
  api.put(`/habits/${id}`, habitData);

export const deleteHabit = (id) => 
  api.delete(`/habits/${id}`);

export const completeHabit = (id, notes) => 
  api.post(`/habits/${id}/complete`, { notes });

export const getHabitCompletions = (id, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/habits/${id}/completions?${queryString}`);
};

// Template API
export const getTemplates = () => 
  api.get('/templates');

export const createTemplate = (templateData) => 
  api.post('/templates', templateData);

export const updateTemplate = (id, templateData) => 
  api.put(`/templates/${id}`, templateData);

export const deleteTemplate = (id) => 
  api.delete(`/templates/${id}`);

export const useTemplate = (id) => 
  api.post(`/templates/${id}/use`);

// Category API
export const getCategories = () => 
  api.get('/categories');

export const createCategory = (categoryData) => 
  api.post('/categories', categoryData);

export const updateCategory = (id, categoryData) => 
  api.put(`/categories/${id}`, categoryData);

export const deleteCategory = (id) => 
  api.delete(`/categories/${id}`);

export default api;

