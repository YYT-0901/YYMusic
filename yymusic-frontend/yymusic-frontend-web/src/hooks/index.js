import { useState, useEffect, useCallback } from 'react'

/**
 * useState hook 的异步版本
 * @param {any} initialState - 初始状态
 * @returns {[state, setState, loading]}
 */
export function useAsyncState(initialState) {
  const [state, setState] = useState(initialState)
  const [loading, setLoading] = useState(false)

  const setAsyncState = useCallback(async value => {
    setLoading(true)
    try {
      const result = typeof value === 'function' ? await value(state) : await value
      setState(result)
      return result
    } finally {
      setLoading(false)
    }
  }, [state])

  return [state, setAsyncState, loading]
}

/**
 * useLocalStorage hook
 * @param {string} key - 键名
 * @param {any} initialValue - 初始值
 * @returns {[value, setValue, removeValue]}
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error('Error reading localStorage:', error)
      return initialValue
    }
  })

  const setValue = useCallback(value => {
    try {
      const valueToStore = typeof value === 'function' ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error('Error setting localStorage:', error)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error('Error removing localStorage:', error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

/**
 * useDebounce hook
 * @param {any} value - 需要防抖的值
 * @param {number} delay - 延迟时间(ms)
 * @returns {any}
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * useClickOutside hook
 * @param {React.RefObject} ref - 引用对象
 * @param {Function} handler - 点击外部时的回调
 */
export function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = event => {
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }
      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

/**
 * useWindowSize hook
 * @returns {{ width: number, height: number }}
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

/**
 * useMediaQuery hook
 * @param {string} query - 媒体查询字符串
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(window.matchMedia(query).matches)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handler = event => setMatches(event.matches)

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}
