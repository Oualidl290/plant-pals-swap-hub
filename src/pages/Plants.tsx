
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { PlantCard } from "@/components/PlantCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample data - will be replaced with actual data from Supabase
const plants = [
  {
    id: 1,
    name: "Monstera Deliciosa",
    species: "Monstera",
    image: "https://images.unsplash.com/photo-1637967886160-fd761519fb90?q=80&w=3540&auto=format&fit=crop",
    distance: "0.5 miles away",
    owner: {
      name: "Sarah",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=3540&auto=format&fit=crop"
    },
    sunlight: "Indirect",
    wateringFrequency: "Weekly",
    difficulty: "Easy"
  },
  {
    id: 2,
    name: "Snake Plant",
    species: "Sansevieria",
    image: "https://images.unsplash.com/photo-1593482892290-f54927ae2be2?q=80&w=3540&auto=format&fit=crop",
    distance: "1.2 miles away",
    owner: {
      name: "Michael",
      avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=3540&auto=format&fit=crop"
    },
    sunlight: "Low to bright",
    wateringFrequency: "Every 2-3 weeks",
    difficulty: "Very Easy"
  },
  {
    id: 3,
    name: "Fiddle Leaf Fig",
    species: "Ficus lyrata",
    image: "https://images.unsplash.com/photo-1597055181449-b9d2955f595c?q=80&w=3540&auto=format&fit=crop",
    distance: "3 miles away",
    owner: {
      name: "Emma",
      avatar: "https://images.unsplash.com/photo-1664575602554-2087b04935a5?q=80&w=3540&auto=format&fit=crop"
    },
    sunlight: "Bright indirect",
    wateringFrequency: "Weekly",
    difficulty: "Moderate"
  },
  {
    id: 4,
    name: "Aloe Vera",
    species: "Aloe barbadensis",
    image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?q=80&w=3540&auto=format&fit=crop",
    distance: "0.8 miles away",
    owner: {
      name: "David",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3540&auto=format&fit=crop"
    },
    sunlight: "Direct",
    wateringFrequency: "Bi-weekly",
    difficulty: "Easy"
  },
  {
    id: 5,
    name: "Peace Lily",
    species: "Spathiphyllum",
    image: "https://images.unsplash.com/photo-1602923668104-8f9e03e4f371?q=80&w=3540&auto=format&fit=crop",
    distance: "1.5 miles away",
    owner: {
      name: "Lisa",
      avatar: "https://images.unsplash.com/photo-1499887142886-791eca5918cd?q=80&w=3540&auto=format&fit=crop"
    },
    sunlight: "Low to medium",
    wateringFrequency: "Weekly",
    difficulty: "Easy"
  },
  {
    id: 6,
    name: "Pothos",
    species: "Epipremnum aureum",
    image: "https://images.unsplash.com/photo-1622550105129-02c04a1d04b4?q=80&w=3540&auto=format&fit=crop",
    distance: "2.1 miles away",
    owner: {
      name: "Carlos",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=3540&auto=format&fit=crop"
    },
    sunlight: "Low to bright",
    wateringFrequency: "Weekly",
    difficulty: "Very Easy"
  }
];

export default function Plants() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [plantType, setPlantType] = useState("all");
  const [sortBy, setSortBy] = useState("distance");
  
  // Filter plants based on search and filters
  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         plant.species.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = plantType === "all" || plantType === plant.difficulty.toLowerCase();
    
    return matchesSearch && matchesType;
  });
  
  // Sort plants
  const sortedPlants = [...filteredPlants].sort((a, b) => {
    if (sortBy === "distance") {
      return parseFloat(a.distance) - parseFloat(b.distance);
    } else if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-plant-cream/50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 md:py-10">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-serif font-bold text-plant-dark-green">Browse Plants</h1>
            <p className="text-plant-gray mt-1">Find plants available for swapping in your area</p>
          </div>
          
          {/* Search and filters */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-plant-gray h-4 w-4" />
                <Input 
                  placeholder="Search plants..." 
                  className="pl-9 border-plant-mint/30 focus:border-plant-dark-green"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className="border-plant-mint/30"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" className="border-plant-mint/30">
                <MapPin className="h-4 w-4" />
                <span className="sr-only md:not-sr-only md:ml-2">Near Me</span>
              </Button>
            </div>
            
            {/* Filters panel */}
            {showFilters && (
              <div className="p-4 bg-white rounded-lg border border-plant-mint/30 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-plant-dark mb-2 block">Plant Type</label>
                  <Select value={plantType} onValueChange={setPlantType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="easy">Easy care</SelectItem>
                      <SelectItem value="moderate">Moderate care</SelectItem>
                      <SelectItem value="difficult">Advanced care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-plant-dark mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Distance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distance">Nearest first</SelectItem>
                      <SelectItem value="name">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    className="bg-plant-dark-green hover:bg-plant-dark-green/90 w-full"
                    onClick={() => {
                      setSearchTerm("");
                      setPlantType("all");
                      setSortBy("distance");
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Plants grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
            
            {sortedPlants.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-plant-gray text-lg">No plants found matching your criteria</p>
                <Button 
                  variant="link" 
                  className="text-plant-dark-green mt-2"
                  onClick={() => {
                    setSearchTerm("");
                    setPlantType("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
