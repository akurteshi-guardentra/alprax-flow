
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and bank transfers. For Business plans, we also support wire transfers and corporate billing."
  },
  {
    question: "Can I change my plan later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
  },
  {
    question: "Is there a minimum contract period?",
    answer: "No, all our plans are month-to-month with no long-term commitment required. You can cancel anytime."
  },
  {
    question: "Do you offer custom enterprise solutions?",
    answer: "Yes, we offer tailored enterprise solutions. Contact our sales team for a custom quote based on your specific needs."
  },
  {
    question: "What happens after my free trial ends?",
    answer: "After your trial ends, you'll be automatically switched to our Basic plan unless you choose to upgrade. We'll notify you before the trial expires."
  }
];

export function PricingFAQ() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="max-w-3xl mx-auto mt-16 px-4"
    >
      <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AccordionItem value={`item-${index}`} className="bg-white/10 rounded-lg border-none">
              <AccordionTrigger className="text-white px-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-white/80 px-4 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </motion.div>
  );
}
