import axios from 'axios'
import { supabase } from './supabase'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers['Authorization'] = `Bearer ${session.access_token}`
  }
  return config
})

export const itemsApi = {
  getAll: (params) => api.get('/items/', { params }),
  getOne: (id) => api.get(`/items/${id}`),
  create: (data) => api.post('/items/', data),
  update: (id, data) => api.patch(`/items/${id}`, data),
  delete: (id) => api.delete(`/items/${id}`),
  uploadImage: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/items/upload-image', form)
  },
}

export const movementsApi = {
  getByItem: (itemId) => api.get('/movements/', { params: { item_id: itemId } }),
}

export const aiApi = {
  identify: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/ai/identify', form)
  },
}

export const authApi = {
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
  updateRole: (userId, role) => api.patch(`/auth/users/${userId}/role`, { role }),
  updateFamilia: (userId, familia) => api.patch(`/auth/users/${userId}/familia`, { familia }),
}

export const wardrobeApi = {
  list: (params) => api.get('/wardrobe/', { params }),
  get: (id) => api.get(`/wardrobe/${id}`),
  create: (formData) => api.post('/wardrobe/', formData),
  update: (id, formData) => api.patch(`/wardrobe/${id}`, formData),
  delete: (id) => api.delete(`/wardrobe/${id}`),
}

export default api