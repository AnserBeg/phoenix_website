import React from 'react';

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
  // For now, just use the original image until we have optimized versions
  // TODO: Re-enable optimization logic once we have optimized files
  
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      onError={onError}
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
  // For now, just use the original video until we have optimized versions
  // TODO: Re-enable optimization logic once we have optimized files
  
  return (
    <video
      className={className}
      style={style}
      preload={preload}
      {...props}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
