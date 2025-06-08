import React, { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  lowResSrc?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  lazyLoad?: boolean;
  placeholderColor?: string;
  onLoad?: () => void;
}

/**
 * OptimizedImage component for better mobile image loading
 * - Supports progressive loading with low-resolution placeholder
 * - Lazy loads images that are not in the viewport
 * - Provides loading state indicators
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  lowResSrc,
  alt,
  className = '',
  width,
  height,
  lazyLoad = true,
  placeholderColor = '#f3f4f6',
  onLoad
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isHighResLoaded, setIsHighResLoaded] = useState(false);

  // Create a placeholder SVG with specified dimensions and color
  const placeholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width || 100} ${height || 100}'%3E%3Crect width='100%25' height='100%25' fill='${placeholderColor.replace('#', '%23')}'/%3E%3C/svg%3E`;
  // Check network connection quality
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [isDataSaverEnabled, setIsDataSaverEnabled] = useState(false);

  useEffect(() => {
    // Check if the device has slow connection
    if ('connection' in navigator) {
      // @ts-ignore - Navigator connection API is not in TypeScript defs yet
      const connection = navigator.connection;
      
      // Check for slow connection types
      if (connection) {
        const updateConnectionStatus = () => {
          // @ts-ignore
          const { effectiveType, saveData, downlink } = connection;
          
          // Update data saver mode
          setIsDataSaverEnabled(!!saveData);
          
          // Check for slow connection
          const slow = effectiveType === 'slow-2g' || 
                      effectiveType === '2g' || 
                      effectiveType === '3g' || 
                      saveData || 
                      (downlink && downlink < 1.0);
          
          setIsSlowConnection(slow);
        };
        
        // Initial check
        updateConnectionStatus();
        
        // Listen for connection changes
        if ('addEventListener' in connection) {
          // @ts-ignore
          connection.addEventListener('change', updateConnectionStatus);
          return () => {
            // @ts-ignore
            connection.removeEventListener('change', updateConnectionStatus);
          };
        }
      }
    }
  }, []);

  // Handle image loading success
  const handleLoad = () => {
    setLoaded(true);
    if (onLoad) onLoad();
  };

  // Handle image loading error
  const handleError = () => {
    setError(true);
    console.error(`Failed to load image: ${src}`);
  };

  // Handle high-resolution image load
  const handleHighResLoad = () => {
    setIsHighResLoaded(true);
  };

  // Determine what source to use
  let imageSrc = src;
  
  // If slow connection and we have a low-res version, use that instead
  if (isSlowConnection && lowResSrc) {
    imageSrc = lowResSrc;
  }
  // For progressive loading with low-res placeholder
  // Skip progressive loading if data saver is enabled
  if (lowResSrc && !isSlowConnection && !isDataSaverEnabled) {
    return (
      <div className={`relative ${className}`} style={{ width, height }}>
        {/* Low resolution placeholder */}
        <img 
          src={lowResSrc}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity ${isHighResLoaded ? 'opacity-0' : 'opacity-100'}`}
          width={width}
          height={height}
          onError={handleError}
        />
        
        {/* High resolution main image */}
        {!error && (
          <img 
            src={isDataSaverEnabled ? lowResSrc : src} // Use low-res on data saver mode
            alt={alt}
            className={`w-full h-full object-cover transition-opacity ${isHighResLoaded ? 'opacity-100' : 'opacity-0'}`}
            width={width}
            height={height}
            loading={lazyLoad ? "lazy" : "eager"}
            onLoad={handleHighResLoad}
            onError={handleError}
          />
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600">
            <span className="text-sm">Failed to load image</span>
          </div>
        )}
      </div>
    );
  }

  // Simple lazy-loaded image for normal cases
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Placeholder while loading */}
      {!loaded && !error && (
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: `url(${placeholderSvg})`,
            backgroundSize: 'cover',
          }}
        />
      )}
      
      {/* Actual image */}
      {!error && (
        <img 
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          width={width}
          height={height}
          loading={lazyLoad ? "lazy" : "eager"}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600">
          <span className="text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
};
