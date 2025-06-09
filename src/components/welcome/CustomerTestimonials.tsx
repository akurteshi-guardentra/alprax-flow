
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Sarah J.",
    role: "Small Business Owner",
    content: "The premium features have transformed how I manage international payments. The cashback rewards are incredible!",
    rating: 5
  },
  {
    name: "Michael R.",
    role: "Freelancer",
    content: "I've saved thousands in fees using their service. The real-time exchange rates and instant transfers are game-changing.",
    rating: 5
  },
  {
    name: "Elena M.",
    role: "Tech Professional",
    content: "The business tier offers amazing value. The advanced analytics and dedicated support are worth every penny.",
    rating: 5
  }
];

export function CustomerTestimonials() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="max-w-6xl mx-auto mt-16 px-4"
    >
      <h2 className="text-2xl font-bold text-white mb-8 text-center">What Our Customers Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            whileHover={{ scale: 1.03 }}
            className="h-full"
          >
            <Card className="h-full bg-white/10 border-none backdrop-blur-sm">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-kosovo-yellow text-kosovo-yellow" />
                  ))}
                </div>
                <p className="text-white/90 mb-4 flex-grow">{testimonial.content}</p>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-white/70">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
