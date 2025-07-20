const API_BASE_URL = "http://localhost:5000/api"

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Network error" }))
    throw { response: { status: response.status, data: error } }
  }
  return response.json()
}

// Auth API
export const authAPI = {
  register: async (username, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    })
    return { data: await handleResponse(response) }
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    return { data: await handleResponse(response) }
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
    })
    return { data: await handleResponse(response) }
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    })
    return { data: await handleResponse(response) }
  },

  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/users`, {
      headers: getAuthHeaders(),
    })
    return { data: await handleResponse(response) }
  },
}

// Task API
export const taskAPI = {
  getTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      headers: getAuthHeaders(),
    })
    return { data: await handleResponse(response) }
  },

  createTask: async (taskData) => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    })
    return { data: await handleResponse(response) }
  },

  updateTask: async (taskId, taskData) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    })
    return { data: await handleResponse(response) }
  },

  deleteTask: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    return { data: await handleResponse(response) }
  },

  smartAssign: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/smart-assign`, {
      method: "POST",
      headers: getAuthHeaders(),
    })
    return { data: await handleResponse(response) }
  },

  startEdit: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/start-edit`, {
      method: "POST",
      headers: getAuthHeaders(),
    })
    return { data: await handleResponse(response) }
  },

  endEdit: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/end-edit`, {
      method: "POST",
      headers: getAuthHeaders(),
    })
    return { data: await handleResponse(response) }
  },

  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/users`, {
      headers: getAuthHeaders(),
    })
    return { data: await handleResponse(response) }
  },
}

// Action API
export const actionAPI = {
  getActions: async () => {
    const response = await fetch(`${API_BASE_URL}/actions`, {
      headers: getAuthHeaders(),
    })
    return { data: await handleResponse(response) }
  },
}

export default {
  auth: authAPI,
  tasks: taskAPI,
  actions: actionAPI,
}
