// Utility function to get the correct base URL for images
export const getImageUrl = (imagePath) => {
  if (!imagePath) return getPlaceholderImage();
  
  // Get the base URL from environment or fallback to localhost
  const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
  // If imagePath already starts with http/https, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If imagePath starts with /, combine with baseUrl
  if (imagePath.startsWith('/')) {
    return `${baseUrl}${imagePath}`;
  }
  
  // Otherwise, add / before imagePath
  return `${baseUrl}/${imagePath}`;
};

// Utility function to get placeholder image
export const getPlaceholderImage = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVMMTc1IDEyNUgxMDBMMTI1IDc1WiIgZmlsbD0iI0Q2REJERiIvPgo8Y2lyY2xlIGN4PSIxMjUiIGN5PSI3NSIgcj0iMTUiIGZpbGw9IiNENkRCREYiLz4KPHR5cGU+CjwvZz4KPC9zdmc+';
};

// Utility function to handle image loading errors
export const handleImageError = (event) => {
  event.target.src = getPlaceholderImage();
  event.target.onerror = null; // Prevent infinite loop
};
