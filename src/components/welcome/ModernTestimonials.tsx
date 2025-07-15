import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

// Testimonial data
const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Small Business Owner',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    quote: "I use this service to pay my international suppliers, and it's saved me thousands in fees. The transfers are fast and the platform is incredibly easy to use.",
    rating: 5
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Software Engineer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    quote: "As someone who regularly sends money to family overseas, this platform has been life-changing. The process is seamless, the rates are competitive, and I always feel secure.",
    rating: 5
  },
  {
    id: 3,
    name: 'Maria Rodriguez',
    role: 'International Student',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    quote: "The best platform for students studying abroad! I use it to receive money from my parents and the exchange rates are much better than what my bank offers. The app is super intuitive too.",
    rating: 4
  },
  {
    id: 4,
    name: 'David Wilson',
    role: 'Digital Nomad',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    quote: "Working remotely across different countries used to be a financial headache until I found this service. Now I can receive payments in multiple currencies without the stress.",
    rating: 5
  },
  {
    id: 5,
    name: 'Emma Taylor',
    role: 'Freelance Designer',
    image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    quote: "I have clients all over the world, and this platform makes it so easy to get paid. The transaction fees are minimal, and the money arrives quickly every time.",
    rating: 5
  }
];

export const ModernTestimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };
  
  return (
    <section className="bg-white dark:bg-gray-900 py-20 sm:py-28 overflow-hidden">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Trusted by <span className="text-primary dark:text-primary-light">Thousands</span> Worldwide
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            See what our customers have to say about their experience with our global payment platform.
          </motion.p>
        </div>
        
        <div className="relative">
          {/* Navigation buttons */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 z-10">
            <button 
              onClick={prevTestimonial}
              className="bg-white dark:bg-gray-800 shadow-md rounded-full p-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary-light/50"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 z-10">
            <button 
              onClick={nextTestimonial}
              className="bg-white dark:bg-gray-800 shadow-md rounded-full p-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary-light/50"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          
          {/* Testimonial slider - improved centering */}
          <div className="overflow-hidden px-12">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <motion.div 
                  key={testimonial.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full flex-shrink-0 px-4 flex justify-center"
                >
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 sm:p-10 shadow-sm w-full max-w-4xl mx-auto">
                    <div className="flex flex-col sm:flex-row gap-6 items-center text-center sm:text-left">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mx-auto sm:mx-0 flex-shrink-0">
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex justify-center sm:justify-start mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i}
                              className={`w-5 h-5 ${
                                i < testimonial.rating 
                                  ? 'text-yellow-400 fill-yellow-400' 
                                  : 'text-gray-300 dark:text-gray-600'
                              }`} 
                            />
                          ))}
                        </div>
                        
                        <blockquote className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 italic mb-4 leading-relaxed">
                          "{testimonial.quote}"
                        </blockquote>
                        
                        <div className="mt-auto">
                          <cite className="font-semibold text-gray-900 dark:text-white not-italic text-lg">
                            {testimonial.name}
                          </cite>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Dots indicator */}
          <div className="flex justify-center mt-8 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  index === activeIndex 
                    ? 'bg-primary dark:bg-primary-light' 
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
