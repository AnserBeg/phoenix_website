import React, { useState } from 'react';

/**
 * OptimizedImage component that automatically uses optimized versions when available
 * Falls back to original images if optimized versions don't exist
 */
export function OptimizedImage({ 
  src, 
  alt, 
  className = "", 
  style = {}, 
  loading = "lazy",
  onError,
  ...props 
}) {
  const [useOptimized, setUseOptimized] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Convert original path to optimized path
  const getOptimizedPath = (originalSrc) => {
    if (!originalSrc) return originalSrc;
    
    // Check if it's already an optimized path
    if (originalSrc.includes('/optimized/')) {
      return originalSrc;
    }
    
    // Extract filename and extension
    const url = new URL(originalSrc);
    const pathParts = url.pathname.split('/');
    const filename = pathParts[pathParts.length - 1];
    
    // Remove extension and add _optimized.jpg
    const nameWithoutExt = filename.split('.')[0];
    const optimizedFilename = `${nameWithoutExt}_optimized.jpg`;
    
    // Replace filename in path
    pathParts[pathParts.length - 1] = optimizedFilename;
    
    // Insert 'optimized' directory before 'uploads'
    const uploadsIndex = pathParts.findIndex(part => part === 'uploads');
    if (uploadsIndex !== -1) {
      pathParts.splice(uploadsIndex + 1, 0, 'optimized');
    }
    
    return `${url.origin}${pathParts.join('/')}`;
  };

  const optimizedSrc = getOptimizedPath(src);
  const displaySrc = useOptimized ? optimizedSrc : src;

  const handleError = (e) => {
    if (useOptimized) {
      // Try original image if optimized fails
      setUseOptimized(false);
      setImageError(false);
    } else {
      // Both failed, show error state
      setImageError(true);
      if (onError) {
        onError(e);
      }
    }
  };

  if (imageError) {
    return (
      <div 
        className={className}
        style={{
          ...style,
          background: '#f3f4f6',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: '14px'
        }}
      >
        Image failed to load
      </div>
    );
  }

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      onError={handleError}
      {...props}
    />
  );
}

/**
 * OptimizedVideo component with performance optimizations
 */
export function OptimizedVideo({ 
  src, 
  poster, 
  className = "", 
  style = {}, 
  preload = "metadata",
  ...props 
}) {
  // Convert video path to optimized versions
  const getOptimizedVideoPaths = (originalSrc) => {
    if (!originalSrc) return { webm: originalSrc, mp4: originalSrc };
    
    const url = new URL(originalSrc);
    const pathParts = url.pathname.split('/');
    const filename = pathParts[pathParts.length - 1];
    const nameWithoutExt = filename.split('.')[0];
    
    // Create optimized paths
    const webmPath = `${url.origin}${pathParts.slice(0, -1).join('/')}/optimized/${nameWithoutExt}.webm`;
    const mp4Path = `${url.origin}${pathParts.slice(0, -1).join('/')}/optimized/${nameWithoutExt}_optimized.mp4`;
    
    return { webm: webmPath, mp4: mp4Path };
  };

  const { webm, mp4 } = getOptimizedVideoPaths(src);

  return (
    <video
      className={className}
      style={style}
      preload={preload}
      {...props}
    >
      <source src={webm} type="video/webm" />
      <source src={mp4} type="video/mp4" />
      <source src={src} type="video/mp4" /> {/* Fallback to original */}
      Your browser does not support the video tag.
    </video>
  );
}
