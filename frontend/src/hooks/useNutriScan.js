import { useState, useCallback } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api/analyze'

// Mock data for demo mode when backend is offline
const MOCK_RESULTS = [
  {
    food_name: 'Grilled Chicken Salad',
    confidence: 0.94,
    nutrition: { calories: 320, protein: 28, carbs: 12, fat: 18, fiber: 4 },
  },
  {
    food_name: 'Margherita Pizza',
    confidence: 0.88,
    nutrition: { calories: 560, protein: 22, carbs: 68, fat: 24, fiber: 3 },
  },
  {
    food_name: 'Avocado Toast',
    confidence: 0.91,
    nutrition: { calories: 290, protein: 9, carbs: 30, fat: 16, fiber: 8 },
  },
  {
    food_name: 'Berry Smoothie Bowl',
    confidence: 0.87,
    nutrition: { calories: 380, protein: 12, carbs: 62, fat: 8, fiber: 10 },
  },
]

export function useNutriScan() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [demoMode, setDemoMode] = useState(false)

  const analyze = useCallback(async (file) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setDemoMode(false)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 15000,
      })
      setResult(response.data)
    } catch (err) {
      const isOffline =
        err.code === 'ERR_NETWORK' ||
        err.code === 'ECONNREFUSED' ||
        err.message?.includes('Network Error') ||
        err.code === 'ECONNABORTED'

      if (isOffline) {
        // Demo mode: return mock result
        const mock = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)]
        setResult(mock)
        setDemoMode(true)
      } else {
        setError(err.response?.data?.message || 'Failed to analyze image. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setDemoMode(false)
  }, [])

  return { result, loading, error, demoMode, analyze, reset }
}
