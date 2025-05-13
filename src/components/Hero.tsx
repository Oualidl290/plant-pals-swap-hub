
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background pattern/gradient */}
      <div className="absolute inset-0 plant-gradient -z-10"></div>
      
      {/* Decorative leaf elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-plant-sage/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-plant-mint/30 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col md:flex-row items-center">
        {/* Left column - Text content */}
        <div className="md:w-1/2 space-y-6 md:pr-8 animate-fade-in">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-plant-dark-green leading-tight">
            Swap Plants,<br />Grow Together
          </h1>
          <p className="text-lg text-plant-gray max-w-lg">
            Connect with local plant enthusiasts to trade cuttings, share tips, 
            and build a greener community — all for free.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button 
              size="lg"
              className="bg-plant-dark-green hover:bg-plant-dark-green/90 text-white rounded-full px-8"
            >
              Browse Plants
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-plant-dark-green text-plant-dark-green hover:bg-plant-dark-green/10 rounded-full px-8"
            >
              Join Now
            </Button>
          </div>
          <div className="pt-6 flex items-center space-x-4 text-sm text-plant-gray">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white bg-plant-mint flex items-center justify-center text-xs font-medium"
                >
                  {i}
                </div>
              ))}
            </div>
            <span>Joined by 1,200+ plant lovers in your area</span>
          </div>
        </div>
        
        {/* Right column - Image */}
        <div className="md:w-1/2 mt-12 md:mt-0 animate-grow">
          <div className="relative">
            <div className="absolute -inset-4 bg-white/50 backdrop-blur-sm rounded-3xl -z-10 shadow-xl"></div>
            <img 
              src="https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07" 
              alt="Various houseplants" 
              className="rounded-2xl shadow-lg w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
