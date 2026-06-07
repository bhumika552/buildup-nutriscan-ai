import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API_AUTH_URL = 'http://localhost:5000/api/auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('buildup_token'))
  const [loading, setLoading] = useState(true)

  // Configure axios interceptor for auth headers
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    return () => {
      axios.interceptors.request.eject(requestInterceptor)
    }
  }, [token])

  // Fetch current user details on mount if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await axios.get(`${API_AUTH_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(response.data)
      } catch (err) {
        console.error('Failed to verify token:', err.message)
        // Token expired or invalid
        localStorage.removeItem('buildup_token')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [token])

  // Register user
  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_AUTH_URL}/register`, {
        username,
        email,
        password
      })
      const data = response.data
      localStorage.setItem('buildup_token', data.token)
      setToken(data.token)
      setUser({ _id: data._id, username: data.username, email: data.email })
      return { success: true }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Registration failed. Please try again.'
      return { success: false, error: errMsg }
    }
  }

  // Login user
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_AUTH_URL}/login`, {
        email,
        password
      })
      const data = response.data
      localStorage.setItem('buildup_token', data.token)
      setToken(data.token)
      setUser({ _id: data._id, username: data.username, email: data.email })
      return { success: true }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Login failed. Invalid credentials.'
      return { success: false, error: errMsg }
    }
  }

  // Logout user
  const logout = () => {
    localStorage.removeItem('buildup_token')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
