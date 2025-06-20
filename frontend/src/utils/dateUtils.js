/**
 * Utility functions for formatting dates
 */

/**
 * Format a date string into a localized date format
 * @param {string|Date} dateString - The date to format
 * @param {object} options - Formatting options for toLocaleDateString
 * @returns {string} Formatted date string or fallback text
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'Unknown';
  
  try {
    const defaultOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      ...options
    };
    
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString(undefined, defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format a date string into a short date format (MM/DD/YYYY)
 * @param {string|Date} dateString - The date to format
 * @returns {string} Short formatted date string
 */
export const formatShortDate = (dateString) => {
  return formatDate(dateString, { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
};

/**
 * Format a date string into a relative time format (e.g., "2 days ago")
 * @param {string|Date} dateString - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
      }
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return formatDate(dateString);
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid Date';
  }
};
