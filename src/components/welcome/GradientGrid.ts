
/**
 * Renders a subtle grid effect with perspective lines
 */
export function renderGrid(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, time: number) {
  // Refined perspective grid effect with improved opacity
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 0.4;
  
  const gridSize = 60; // Optimized grid size for better performance
  
  // Enhanced horizontal lines with refined wave effect
  for (let y = 0; y < canvasHeight; y += gridSize) {
    ctx.beginPath();
    
    // Optimized wave parameters
    const waveAmplitude = 1;
    const waveFrequency = 0.02;
    
    for (let x = 0; x < canvasWidth; x += 8) {
      const waveY = y + Math.sin(x * waveFrequency + time * 0.7) * waveAmplitude;
      ctx.lineTo(x, waveY);
    }
    
    ctx.stroke();
  }
  
  // Enhanced vertical lines with refined wave effect
  for (let x = 0; x < canvasWidth; x += gridSize) {
    ctx.beginPath();
    
    // Optimized wave parameters for vertical lines
    const waveAmplitude = 1;
    const waveFrequency = 0.02;
    
    for (let y = 0; y < canvasHeight; y += 8) {
      const waveX = x + Math.sin(y * waveFrequency + time * 0.5) * waveAmplitude;
      ctx.lineTo(waveX, y);
    }
    
    ctx.stroke();
  }
}
