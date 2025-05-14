
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin } from "lucide-react";

interface Owner {
  name: string;
  avatar: string;
}

interface Plant {
  id: string | number;  // Updated to accept both string and number
  name: string;
  species: string;
  image: string;
  distance: string;
  owner: Owner;
  sunlight: string;
  wateringFrequency: string;
  difficulty: string;
}

interface PlantCardProps {
  plant: Plant;
}

export function PlantCard({ plant }: PlantCardProps) {
  return (
    <Card className="overflow-hidden card-hover transition-transform border-plant-mint/30">
      <div className="relative">
        <img 
          src={plant.image} 
          alt={plant.name}
          className="h-48 w-full object-cover"
        />
        <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
          <Heart className="h-4 w-4 text-plant-gray hover:text-red-500 transition-colors" />
        </button>
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-white/80 backdrop-blur-sm text-plant-dark-green hover:bg-white">
            {plant.difficulty}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-lg">{plant.name}</h3>
            <p className="text-sm text-plant-gray italic">{plant.species}</p>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-plant-gray mb-3">
          <MapPin className="h-3 w-3 mr-1" />
          <span>{plant.distance} away</span>
        </div>
        
        <div className="pt-2 border-t border-plant-mint/30">
          <div className="flex items-center mt-2">
            <img 
              src={plant.owner.avatar} 
              alt={plant.owner.name} 
              className="w-6 h-6 rounded-full mr-2 border border-plant-mint/50" 
            />
            <span className="text-sm">{plant.owner.name}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
