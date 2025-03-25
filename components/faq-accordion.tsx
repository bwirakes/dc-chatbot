"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"
import { cn } from "../lib/utils"

interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  items: FAQItem[]
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item, index) => (
        <AccordionItem 
          key={index} 
          value={`item-${index}`} 
          className="border border-muted rounded-lg mb-3 overflow-hidden transition-colors hover:border-muted-foreground/20"
        >
          <AccordionTrigger 
            className={cn(
              "text-base md:text-lg font-medium p-4 hover:no-underline",
              "data-[state=open]:bg-muted/50",
              "transition-all flex-1"
            )}
          >
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground text-sm md:text-base p-4 pt-2">
            <div className="prose prose-sm md:prose-base max-w-none leading-relaxed">
              {item.answer}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
} 