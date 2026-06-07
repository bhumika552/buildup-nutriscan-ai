/**
 * Format a date to a readable string
 */
export function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format a number to a fixed decimal
 */
export function formatNumber(num, decimals = 1) {
  return Number(num).toFixed(decimals)
}

/**
 * Get color for confidence score
 */
export function getConfidenceColor(score) {
  if (score >= 0.9) return '#7AAF5A'
  if (score >= 0.75) return '#D4A04A'
  return '#D94530'
}

/**
 * Get confidence label
 */
export function getConfidenceLabel(score) {
  if (score >= 0.9) return 'High'
  if (score >= 0.75) return 'Medium'
  return 'Low'
}

/**
 * Validate that a file is an image
 */
export function isValidImageFile(file) {
  return file && file.type.startsWith('image/')
}

/**
 * Color-coded nutrition bars
 */
export const NUTRITION_COLORS = {
  calories: '#E07840',
  protein:  '#38bdf8',
  carbs:    '#f97316',
  fat:      '#f59e0b',
  fiber:    '#D4A04A',
}

/**
 * Daily recommended maximums for progress bars
 */
export const NUTRITION_MAX = {
  calories: 2000,
  protein:  50,
  carbs:    275,
  fat:      78,
  fiber:    28,
}

