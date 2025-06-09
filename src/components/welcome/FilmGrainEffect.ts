
/**
 * Adds a subtle film grain effect for texture with improved performance
 */
export function addFilmGrainEffect(
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number, 
  intensity: number, 
  isMobile: boolean
) {
  // Performance optimization for mobile devices
  const sampleSize = isMobile ? 80 : 100; 
  const skipPixels = isMobile ? 20 : 10; // Process fewer pixels on mobile
  
  // Only process a portion of the screen for performance
  let xOffset = Math.floor(Math.random() * (width - sampleSize));
  let yOffset = Math.floor(Math.random() * (height - sampleSize));
  
  // Ensure we don't go out of bounds
  xOffset = Math.max(0, Math.min(width - sampleSize, xOffset));
  yOffset = Math.max(0, Math.min(height - sampleSize, yOffset));
  
  const imageData = ctx.getImageData(xOffset, yOffset, sampleSize, sampleSize);
  const data = imageData.data;
  
  // Apply grain effect with performance optimizations
  for (let i = 0; i < data.length; i += skipPixels * 4) {
    const noise = (Math.random() - 0.5) * intensity * 255;
    
    // Optimize by applying the same noise value to R, G, B channels
    data[i] = Math.min(255, Math.max(0, data[i] + noise));     // R
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise)); // G
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise)); // B
  }
  
  // Put the image data back with the grain effect
  ctx.putImageData(imageData, xOffset, yOffset);
}
