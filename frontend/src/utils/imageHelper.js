// Image URL Helper to format local, relative, and fallback images in production
const API_URL = import.meta.env.VITE_API_URL || 'https://lucass-6.onrender.com/api';
const backendBase = API_URL.replace('/api', '');

export const getImageUrl = (url, name) => {
  if (!url) {
    if (!name) return 'https://placehold.co/400x600?text=Ayurveda';
    const n = name.toUpperCase();
    if (n.includes('AMALA')) {
      return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop';
    }
    if (n.includes('AVARAM')) {
      return 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=500&auto=format&fit=crop';
    }
    if (n.includes('SLIM') || n.includes('TEA')) {
      return 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop';
    }
    return `https://placehold.co/400x600?text=${encodeURIComponent(name)}`;
  }

  // If the database has local testing URLs, rewrite them to the production backend
  if (url.startsWith('http://localhost:5000')) {
    return url.replace('http://localhost:5000', backendBase);
  }

  // Prepend backend base URL to relative upload paths
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    const cleanUrl = url.startsWith('/') ? url : '/' + url;
    return `${backendBase}${cleanUrl}`;
  }

  return url;
};
