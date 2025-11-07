import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getSignals = async (limit: number = 50) => {
  const response = await api.get(`/signals?limit=${limit}`)
  return response.data
}

export const getStats = async () => {
  const response = await api.get('/api/stats')
  return response.data
}

export const getSymbols = async () => {
  const response = await api.get('/api/symbols')
  return response.data
}

export const getCalendar = async () => {
  const response = await api.get('/api/calendar')
  return response.data
}

export default api

