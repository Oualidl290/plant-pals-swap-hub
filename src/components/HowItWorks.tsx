
import { Search, MessageSquare, ArrowRightLeft } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse & Discover",
    description: "Find plant cuttings, seeds, and fully grown plants in your local area."
  },
  {
    icon: MessageSquare,
    title: "Connect & Chat",
    description: "Message plant owners directly to arrange swaps and share plant care tips."
  },
  {
    icon: ArrowRightLeft,
    title: "Swap & Grow",
    description: "Meet up locally to exchange plants, expanding your collection for free."
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-plant-dark-green mb-3">
            How PlantPals Works
          </h2>
          <p className="text-plant-gray max-w-2xl mx-auto">
            Build your plant collection through community swaps in three easy steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="w-16 h-16 rounded-full bg-plant-mint/30 flex items-center justify-center mb-6">
                <step.icon className="h-7 w-7 text-plant-dark-green" />
              </div>
              <h3 className="font-serif text-xl font-bold text-plant-dark-green mb-3">
                {step.title}
              </h3>
              <p className="text-plant-gray">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Decorative elements */}
        <div className="hidden md:block relative h-10 mt-8">
          <div className="absolute top-3 left-[30%] right-[30%] h-0.5 bg-plant-mint/60"></div>
          <div className="absolute top-[6px] left-[30%] w-3 h-3 rounded-full bg-plant-sage"></div>
          <div className="absolute top-[6px] left-[50%] transform -translate-x-1/2 w-3 h-3 rounded-full bg-plant-sage"></div>
          <div className="absolute top-[6px] right-[30%] w-3 h-3 rounded-full bg-plant-sage"></div>
        </div>
      </div>
    </section>
  );
}
