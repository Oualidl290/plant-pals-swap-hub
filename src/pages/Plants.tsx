
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { PlantCard } from "@/components/PlantCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, MapPin, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlants } from "@/hooks/usePlants";
import { Link } from "react-router-dom";

export default function Plants() {
  const [showFilters, setShowFilters] = useState(false);
  
  const { 
    plants, 
    isLoading, 
    error, 
    searchTerm, 
    setSearchTerm,
    filterOptions,
    setFilterOptions,
    sortBy,
    setSortBy
  } = usePlants();
  
  if (error) {
    console.error("Error loading plants:", error);
  }

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
              <div className="p-4 bg-white rounded-lg border border-plant-mint/30 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-plant-dark mb-2 block">Care Difficulty</label>
                  <Select 
                    value={filterOptions.difficulty} 
                    onValueChange={(value) => setFilterOptions({...filterOptions, difficulty: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All difficulties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All difficulties</SelectItem>
                      <SelectItem value="easy">Easy care</SelectItem>
                      <SelectItem value="moderate">Moderate care</SelectItem>
                      <SelectItem value="difficult">Advanced care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-plant-dark mb-2 block">Sunlight Needs</label>
                  <Select 
                    value={filterOptions.sunlight} 
                    onValueChange={(value) => setFilterOptions({...filterOptions, sunlight: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All sunlight types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All sunlight types</SelectItem>
                      <SelectItem value="low">Low light</SelectItem>
                      <SelectItem value="indirect">Indirect light</SelectItem>
                      <SelectItem value="bright">Bright light</SelectItem>
                      <SelectItem value="direct">Direct sunlight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-plant-dark mb-2 block">Sort By</label>
                  <Select 
                    value={sortBy} 
                    onValueChange={setSortBy}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                      <SelectItem value="name">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    className="bg-plant-dark-green hover:bg-plant-dark-green/90 w-full"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterOptions({
                        difficulty: 'all',
                        sunlight: 'all',
                        size: 'all',
                        onlyAvailable: false
                      });
                      setSortBy("newest");
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
            {isLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-plant-dark-green" />
              </div>
            ) : plants && plants.length > 0 ? (
              plants.map((plant) => (
                <Link to={`/plants/${plant.id}`} key={plant.id}>
                  <PlantCard 
                    plant={{
                      id: plant.id,
                      name: plant.name,
                      species: plant.species || '',
                      image: plant.image_url || 'https://images.unsplash.com/photo-1637967886160-fd761519fb90?q=80&w=3540&auto=format&fit=crop',
                      distance: plant.profiles.location || 'Unknown location',
                      owner: {
                        name: plant.profiles.username || 'Unknown user',
                        avatar: plant.profiles.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3540&auto=format&fit=crop'
                      },
                      sunlight: plant.sunlight || 'Not specified',
                      wateringFrequency: plant.watering_frequency || 'Not specified',
                      difficulty: plant.difficulty || 'Moderate'
                    }} 
                  />
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-plant-gray text-lg">No plants found matching your criteria</p>
                <Button 
                  variant="link" 
                  className="text-plant-dark-green mt-2"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterOptions({
                      difficulty: 'all',
                      sunlight: 'all',
                      size: 'all',
                      onlyAvailable: false
                    });
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
