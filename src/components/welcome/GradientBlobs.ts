
import { interpolateColors, hexToRgb } from '@/utils/gradientUtils';

export interface GradientBlob {
  x: number;
  y: number;
  radius: number;
  initialRadius: number;
  xVelocity: number;
  yVelocity: number;
  color: string;
  pulseSpeed: number;
  pulseAmplitude: number;
  opacity: number;
}

export function createGradientBlobs(canvasWidth: number, canvasHeight: number, isMobile: boolean, palette: string[]): GradientBlob[] {
  // Create fewer blobs on mobile for better performance
  const blobs = Array(isMobile ? 3 : 5).fill(0).map(() => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    radius: Math.random() * 350 + 150,
    // Reduced velocity for smoother motion
    xVelocity: (Math.random() - 0.5) * 0.2,
    yVelocity: (Math.random() - 0.5) * 0.2,
    color: palette[Math.floor(Math.random() * palette.length)],
    // Enhanced 3D effect properties
    pulseSpeed: Math.random() * 0.008 + 0.004,
    pulseAmplitude: Math.random() * 0.08 + 0.04,
    initialRadius: 0,
    opacity: Math.random() * 0.07 + 0.1
  }));
  
  // Initialize blob initial radius values
  blobs.forEach(blob => {
    blob.initialRadius = blob.radius;
  });
  
  return blobs;
}

export function renderBlobs(
  ctx: CanvasRenderingContext2D, 
  blobs: GradientBlob[], 
  time: number, 
  currentPalette: string[]
) {
  // Using requestAnimationFrame delta for smoother animations
  blobs.forEach(blob => {
    // Move blobs with smoother motion
    blob.x += blob.xVelocity;
    blob.y += blob.yVelocity;
    
    // Enhanced edge bounce with higher dampening for smoother reversals
    if (blob.x < -100 || blob.x > ctx.canvas.width + 100) {
      blob.xVelocity *= -0.85;
      blob.x = Math.max(-100, Math.min(ctx.canvas.width + 100, blob.x));
    }
    
    if (blob.y < -100 || blob.y > ctx.canvas.height + 100) {
      blob.yVelocity *= -0.85;
      blob.y = Math.max(-100, Math.min(ctx.canvas.height + 100, blob.y));
    }
    
    // Enhanced 3D pulsing effect
    blob.radius = blob.initialRadius + Math.sin(time * blob.pulseSpeed) * blob.pulseAmplitude * blob.initialRadius;
    
    // Create multi-layered gradient for deeper 3D effect
    const outerRadius = blob.radius * 1.15;
    
    // Outer glow gradient (more transparent)
    const outerGradient = ctx.createRadialGradient(
      blob.x, blob.y, 0,
      blob.x, blob.y, outerRadius
    );
    
    // Enhanced color blending for smoother transitions
    const baseColor = blob.color;
    const paletteIndex = currentPalette.indexOf(baseColor);
    const nextColor = currentPalette[(paletteIndex + 1) % currentPalette.length];
    const blendedColor = interpolateColors(baseColor, nextColor, 0.35);
    
    outerGradient.addColorStop(0, `rgba(${hexToRgb(blendedColor)}, 0.04)`);
    outerGradient.addColorStop(0.7, `rgba(${hexToRgb(blendedColor)}, 0.02)`);
    outerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.arc(blob.x, blob.y, outerRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner gradient with enhanced depth
    const innerGradient = ctx.createRadialGradient(
      blob.x, blob.y, 0,
      blob.x, blob.y, blob.radius
    );
    
    innerGradient.addColorStop(0, `rgba(${hexToRgb(blob.color)}, ${blob.opacity * 1.2})`);
    innerGradient.addColorStop(0.6, `rgba(${hexToRgb(blob.color)}, ${blob.opacity * 0.6})`);
    innerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}
