import { useState, useCallback, useEffect } from 'react'

function getStorageValue(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key)
    return saved !== null ? JSON.parse(saved) : defaultValue
  } catch {
    return defaultValue
  }
}

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => getStorageValue(key, defaultValue))

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // quota exceeded or private mode
    }
  }, [key, value])

  const setStoredValue = useCallback((newValue) => {
    setValue(prev =>
      typeof newValue === 'function' ? newValue(prev) : newValue
    )
  }, [])

  return [value, setStoredValue]
}
