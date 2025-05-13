
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  MessageSquare, 
  RefreshCw, 
  Heart, 
  Share2, 
  Droplet, 
  Sun, 
  Ruler,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/UserAvatar";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useToast } from "@/hooks/use-toast";

// Sample data - will be replaced with actual data from Supabase
const plantData = {
  id: 1,
  name: "Monstera Deliciosa",
  species: "Monstera Deliciosa",
  description: "A beautiful, healthy Monstera with fenestrated leaves. Great for bringing a tropical feel to your space. I've had this plant for about 2 years and it's been thriving. Looking to swap for something different to add variety to my collection.",
  image: "https://images.unsplash.com/photo-1637967886160-fd761519fb90?q=80&w=3540&auto=format&fit=crop",
  gallery: [
    "https://images.unsplash.com/photo-1637967886160-fd761519fb90?q=80&w=3540&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1682695794816-7b9da18ed470?q=80&w=3540&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1682695794816-7b9da18ed470?q=80&w=3540&auto=format&fit=crop"
  ],
  owner: {
    id: "abc123",
    name: "Sarah Johnson",
    location: "Portland, OR",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=3540&auto=format&fit=crop",
    joined: "2023-01-15",
    rating: 4.8,
    reviews: 12
  },
  care: {
    difficulty: "Moderate",
    sunlight: "Bright indirect light",
    watering: "Once a week, allow to dry between waterings",
    size: "Medium, 2-3 feet tall"
  },
  distance: "0.7 miles away",
  posted: "2025-05-01",
  swapPreferences: "Looking for: Pothos, Philodendron, or other trailing plants"
};

export default function PlantDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState(plantData.gallery[0]);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite ? "Plant removed from your saved items" : "Plant added to your saved items",
    });
  };
  
  const handleRequestSwap = () => {
    toast({
      title: "Swap request sent!",
      description: "We've notified the plant owner. They'll respond shortly.",
    });
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Share this plant with your friends",
    });
  };

  return (
    <div className="min-h-screen bg-plant-cream/50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 md:py-10">
        <div className="mb-6">
          <Link to="/plants" className="text-plant-dark-green hover:underline flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to plants
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plant images and info - left side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main image */}
            <div className="rounded-lg overflow-hidden border border-plant-mint/30 bg-white">
              <AspectRatio ratio={4/3} className="bg-plant-mint/10">
                <img 
                  src={selectedImage} 
                  alt={plantData.name} 
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
            </div>
            
            {/* Thumbnail gallery */}
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {plantData.gallery.map((img, index) => (
                <button 
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`rounded-lg overflow-hidden border ${
                    selectedImage === img 
                      ? "border-plant-dark-green" 
                      : "border-plant-mint/30"
                  } h-16 w-16 flex-shrink-0`}
                >
                  <img 
                    src={img} 
                    alt={`${plantData.name} view ${index + 1}`} 
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
            
            {/* Plant details */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-serif font-bold text-plant-dark-green">{plantData.name}</h1>
                    <p className="text-plant-gray italic">{plantData.species}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      className={`rounded-full ${
                        isFavorite 
                          ? "bg-red-50 border-red-200 text-red-500" 
                          : "border-plant-mint/30"
                      }`}
                      onClick={handleFavorite}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                      <span className="sr-only">Favorite</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="rounded-full border-plant-mint/30"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="sr-only">Share</span>
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className="bg-plant-mint/20 text-plant-dark-green border-plant-mint hover:bg-plant-mint/30">
                    {plantData.care.difficulty}
                  </Badge>
                  <span className="text-sm text-plant-gray">{plantData.distance}</span>
                  <span className="text-sm text-plant-gray">• Posted {new Date(plantData.posted).toLocaleDateString()}</span>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <h2 className="text-xl font-medium mb-2">About this plant</h2>
                <p className="text-plant-dark">{plantData.description}</p>
              </div>
              
              {/* Care info */}
              <div>
                <h2 className="text-xl font-medium mb-3">Care information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="bg-white border-plant-mint/30">
                    <CardContent className="p-4 flex items-center">
                      <Sun className="h-5 w-5 text-plant-gold mr-3" />
                      <div>
                        <p className="font-medium">Light</p>
                        <p className="text-sm text-plant-gray">{plantData.care.sunlight}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white border-plant-mint/30">
                    <CardContent className="p-4 flex items-center">
                      <Droplet className="h-5 w-5 text-plant-dark-green mr-3" />
                      <div>
                        <p className="font-medium">Water</p>
                        <p className="text-sm text-plant-gray">{plantData.care.watering}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white border-plant-mint/30">
                    <CardContent className="p-4 flex items-center">
                      <Ruler className="h-5 w-5 text-plant-brown mr-3" />
                      <div>
                        <p className="font-medium">Size</p>
                        <p className="text-sm text-plant-gray">{plantData.care.size}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white border-plant-mint/30">
                    <CardContent className="p-4 flex items-center">
                      <Info className="h-5 w-5 text-plant-sage mr-3" />
                      <div>
                        <p className="font-medium">Swap Preference</p>
                        <p className="text-sm text-plant-gray">{plantData.swapPreferences}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
          
          {/* Owner info and actions - right sidebar */}
          <div className="space-y-6">
            {/* Plant owner */}
            <Card className="bg-white border-plant-mint/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <UserAvatar 
                    src={plantData.owner.avatar}
                    fallback={plantData.owner.name}
                    className="h-12 w-12"
                  />
                  <div>
                    <h3 className="font-medium">{plantData.owner.name}</h3>
                    <p className="text-sm text-plant-gray">{plantData.owner.location}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-plant-gray">Member since</p>
                    <p className="font-medium">{new Date(plantData.owner.joined).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-plant-gray">Rating</p>
                    <p className="font-medium flex items-center">
                      {plantData.owner.rating}
                      <span className="text-xs text-plant-gray ml-1">({plantData.owner.reviews})</span>
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-plant-dark-green hover:bg-plant-dark-green/90"
                    onClick={handleRequestSwap}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Request Swap
                  </Button>
                  <Button variant="outline" className="w-full border-plant-mint/50">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Safety tips */}
            <Card className="bg-plant-mint/10 border-plant-mint/30">
              <CardContent className="p-6">
                <h3 className="font-medium mb-3">Safety Tips</h3>
                <ul className="text-sm space-y-2 text-plant-dark">
                  <li className="flex items-start">
                    <span className="bg-plant-mint rounded-full h-1.5 w-1.5 mt-1.5 mr-2"></span>
                    Meet in a public place for plant swaps
                  </li>
                  <li className="flex items-start">
                    <span className="bg-plant-mint rounded-full h-1.5 w-1.5 mt-1.5 mr-2"></span>
                    Check for pests before accepting plants
                  </li>
                  <li className="flex items-start">
                    <span className="bg-plant-mint rounded-full h-1.5 w-1.5 mt-1.5 mr-2"></span>
                    Use in-app messaging for communication
                  </li>
                  <li className="flex items-start">
                    <span className="bg-plant-mint rounded-full h-1.5 w-1.5 mt-1.5 mr-2"></span>
                    Report any concerns to PlantPals
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Similar plants teaser */}
            <div>
              <h3 className="font-medium mb-3">Similar Plants Nearby</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg overflow-hidden border border-plant-mint/30">
                  <img 
                    src="https://images.unsplash.com/photo-1682695794816-7b9da18ed470?q=80&w=3540&auto=format&fit=crop" 
                    alt="Similar plant" 
                    className="h-24 w-full object-cover"
                  />
                  <div className="p-2">
                    <p className="font-medium text-sm truncate">Monstera Adansonii</p>
                    <p className="text-xs text-plant-gray">0.9 miles away</p>
                  </div>
                </div>
                <div className="rounded-lg overflow-hidden border border-plant-mint/30">
                  <img 
                    src="https://images.unsplash.com/photo-1620803366004-c95d0037b4e9?q=80&w=3542&auto=format&fit=crop" 
                    alt="Similar plant" 
                    className="h-24 w-full object-cover"
                  />
                  <div className="p-2">
                    <p className="font-medium text-sm truncate">Philodendron Brasil</p>
                    <p className="text-xs text-plant-gray">1.2 miles away</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
