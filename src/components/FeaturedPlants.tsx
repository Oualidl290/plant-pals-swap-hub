
import { Card, CardContent } from "@/components/ui/card";
import { PlantCard } from "./PlantCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Sample plant data
const featuredPlants = [
  {
    id: 1,
    name: "Monstera Cutting",
    species: "Monstera Deliciosa",
    image: "https://images.unsplash.com/photo-1632207691143-21b945c61615?q=80&w=1000",
    distance: "1.2 mi",
    owner: {
      name: "Sarah K.",
      avatar: "https://i.pravatar.cc/150?img=32",
    },
    sunlight: "Indirect",
    wateringFrequency: "Weekly",
    difficulty: "Easy"
  },
  {
    id: 2,
    name: "Snake Plant",
    species: "Sansevieria Trifasciata",
    image: "https://images.unsplash.com/photo-1593482892290-f54927ae2bb2?q=80&w=1000",
    distance: "0.8 mi",
    owner: {
      name: "Michael R.",
      avatar: "https://i.pravatar.cc/150?img=11",
    },
    sunlight: "Low to Bright",
    wateringFrequency: "Monthly",
    difficulty: "Very Easy"
  },
  {
    id: 3,
    name: "Fiddle Leaf Fig",
    species: "Ficus Lyrata",
    image: "https://images.unsplash.com/photo-1616243849361-9033ad685383?q=80&w=1000",
    distance: "2.5 mi",
    owner: {
      name: "Emma L.",
      avatar: "https://i.pravatar.cc/150?img=23",
    },
    sunlight: "Bright",
    wateringFrequency: "Weekly",
    difficulty: "Moderate"
  },
  {
    id: 4,
    name: "String of Pearls",
    species: "Senecio Rowleyanus",
    image: "https://images.unsplash.com/photo-1632318904521-84ab26d52257?q=80&w=1000",
    distance: "3.1 mi",
    owner: {
      name: "David C.",
      avatar: "https://i.pravatar.cc/150?img=53",
    },
    sunlight: "Bright",
    wateringFrequency: "Bi-weekly",
    difficulty: "Moderate"
  },
];

export function FeaturedPlants() {
  return (
    <section id="featured" className="py-16 bg-plant-cream/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-plant-dark-green mb-3">
            Featured Plants Nearby
          </h2>
          <p className="text-plant-gray max-w-2xl mx-auto">
            Browse cuttings, seeds, and mature plants available for swap in your area
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredPlants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link to="/plants">
            <Button className="bg-plant-dark-green hover:bg-plant-dark-green/90 inline-flex items-center">
              View All Plants
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
