
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button3D } from './Button3D';
import { useIsMobile } from '@/hooks/use-mobile';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  image?: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoplaySpeed?: number;
}

export function TestimonialCarousel({
  testimonials,
  autoplaySpeed = 5000
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isMobile = useIsMobile();
  
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1));
  }, [testimonials.length]);
  
  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1));
  }, [testimonials.length]);
  
  // Autoplay functionality
  useEffect(() => {
    if (!isPaused && autoplaySpeed > 0) {
      const interval = setInterval(() => {
        nextSlide();
      }, autoplaySpeed);
      
      return () => clearInterval(interval);
    }
  }, [nextSlide, isPaused, autoplaySpeed]);
  
  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    })
  };
  
  const [slideDirection, setSlideDirection] = useState(1);
  
  const handleNext = () => {
    setSlideDirection(1);
    nextSlide();
  };
  
  const handlePrev = () => {
    setSlideDirection(-1);
    prevSlide();
  };
  
  const currentTestimonial = testimonials[currentIndex];
  
  return (
    <div 
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Testimonial Card */}
        <AnimatePresence initial={false} custom={slideDirection} mode="wait">
          <motion.div
            key={currentIndex}
            custom={slideDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/10 shadow-2xl"
          >
            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500/50">
                    <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-violet-500 flex items-center justify-center text-2xl text-white font-bold">
                      {currentTestimonial.image ? (
                        <img 
                          src={currentTestimonial.image} 
                          alt={currentTestimonial.name} 
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        currentTestimonial.name.charAt(0)
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full p-1 border border-white/10">
                    <div className="bg-indigo-500 rounded-full p-1">
                      <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 space-y-4">
                <div className="flex mb-2">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-white/90 text-lg italic">
                  "{currentTestimonial.content}"
                </p>
                
                <div className="pt-2">
                  <p className="font-semibold text-white text-lg">{currentTestimonial.name}</p>
                  <p className="text-sm text-white/70">{currentTestimonial.role}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation controls */}
        <div className="flex justify-center mt-6 gap-4">
          <Button3D
            variant="secondary"
            size="sm"
            onClick={handlePrev}
            icon={<ChevronLeft className="w-4 h-4" />}
            iconPosition="left"
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
          >
            <span className="sr-only">Previous</span>
          </Button3D>
          
          {/* Pagination indicators */}
          <div className="hidden md:flex items-center gap-2 px-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setSlideDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index 
                    ? 'bg-white w-6' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          
          <Button3D
            variant="secondary"
            size="sm"
            onClick={handleNext}
            icon={<ChevronRight className="w-4 h-4" />}
            iconPosition="right"
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
          >
            <span className="sr-only">Next</span>
          </Button3D>
        </div>
      </div>
    </div>
  );
}
