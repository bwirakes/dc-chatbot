import type { Metadata } from "next"
import { FAQAccordion } from "../../../components/faq-accordion"
import { FAQHeader } from "../../../components/faq-header"

export const metadata: Metadata = {
  title: "FAQ - AI Chatbot",
  description: "Frequently Asked Questions about our AI Chatbot service",
}

export default function FAQPage() {
  return (
    <div className="flex flex-col min-w-0 min-h-dvh bg-background">
      <FAQHeader />
      
      <div className="mx-auto w-full px-4 py-8 md:py-12 md:max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center font-serif">
          Frequently Asked Questions
        </h1>

        <div className="space-y-6 md:space-y-8">
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 font-serif">Our AI Technology</h2>
            <FAQAccordion
              items={[
                {
                  question: "What kind of AI models do you use?",
                  answer:
                    "Our service uses tailored models for specific Large Language Models (LLMs). Each conversation is processed by AI models that have been fine-tuned to provide the most helpful and relevant responses for your specific situation.",
                },
              ]}
            />
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 font-serif">Data & Privacy</h2>
            <FAQAccordion
              items={[
                {
                  question: "How is my data used?",
                  answer:
                    "The data from your conversations might be used for training by our model providers such as Google, OpenAI, and Anthropic. This helps improve the quality of responses and the overall service we provide. We save conversations to help us make better decisions in the future, as this is currently a demo product.",
                },
                {
                  question: "Where are your AI models hosted?",
                  answer:
                    "We only use US-based models and providers for our LLMs. This ensures that all data processing occurs within US jurisdiction and follows applicable US regulations for data protection and privacy.",
                },
              ]}
            />
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 font-serif">Service Limitations</h2>
            <FAQAccordion
              items={[
                {
                  question: "Does this service provide legal advice?",
                  answer:
                    "No, we do not provide legal advice. Our service is designed only as an aid for people who are currently experiencing difficult times and need additional support. Any information provided should not be construed as legal advice, and users should consult with qualified legal professionals for specific legal concerns.",
                },
                {
                  question: "How do you use saved conversations?",
                  answer:
                    "As a demo product, we save conversations to help us improve our service and make better decisions in the future. This data helps us understand common questions, challenges users face, and how we can better assist people going through difficult situations. All saved data is handled according to our privacy policy and applicable data protection regulations.",
                },
              ]}
            />
          </section>
        </div>
      </div>
    </div>
  )
} 