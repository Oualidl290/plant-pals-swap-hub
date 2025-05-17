
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, Edit, RefreshCw, Loader2, Heart, HeartOff } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { usePlants } from "@/hooks/usePlants";
import { formatDistanceToNow } from 'date-fns';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SwapRequestModal } from "@/components/SwapRequestModal";
import { useToast } from "@/hooks/use-toast";
import { PlantWithDetails } from "@/types/supabase";

export default function PlantDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getPlant, toggleFavorite, checkFavoriteStatus } = usePlants();
  
  const [plant, setPlant] = useState<PlantWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  useEffect(() => {
    const loadPlant = async () => {
      if (!id) {
        setIsError(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setIsError(false);
        
        const plantData = await getPlant(id);
        console.log("Loaded plant data:", plantData);
        
        if (!plantData) {
          setIsError(true);
          toast({
            title: "Plant not found",
            description: "The plant you're looking for doesn't exist or has been removed.",
            variant: "destructive"
          });
          return;
        }
        
        setPlant(plantData);
        setIsOwner(user?.id === plantData.owner_id);
        
        // Check if this plant is in user's favorites
        if (user) {
          const favorited = await checkFavoriteStatus(plantData.id);
          setIsFavorited(favorited);
        }
      } catch (error: any) {
        console.error("Failed to load plant:", error);
        setIsError(true);
        toast({
          title: "Error",
          description: "Failed to load plant details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPlant();
  }, [id, user, getPlant, toast, checkFavoriteStatus]);

  const handleToggleFavorite = async () => {
    if (!user || !plant) return;
    
    try {
      await toggleFavorite(plant.id);
      setIsFavorited(!isFavorited); // Optimistically update the UI
      
      toast({
        title: isFavorited ? "Removed from favorites" : "Added to favorites",
        description: isFavorited ? "Plant removed from your favorites" : "Plant added to your favorites",
      });
    } catch (error: any) {
      console.error("Failed to toggle favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderActionButton = () => {
    if (!user) {
      return (
        <Link to="/auth">
          <Button className="bg-plant-dark-green hover:bg-plant-dark-green/90">
            <LogIn className="mr-2 h-4 w-4" />
            Login to Request Swap
          </Button>
        </Link>
      );
    }
    
    if (isOwner) {
      return (
        <Link to={`/edit-plant/${id}`}>
          <Button className="bg-plant-dark-green hover:bg-plant-dark-green/90">
            <Edit className="mr-2 h-4 w-4" />
            Edit Plant
          </Button>
        </Link>
      );
    }
    
    return (
      <Button 
        className="bg-plant-dark-green hover:bg-plant-dark-green/90"
        onClick={() => setIsSwapModalOpen(true)}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Request Swap
      </Button>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-plant-cream/50">
        <Navbar />
        <main className="container mx-auto px-4 py-6 md:py-10">
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-plant-dark-green" />
          </div>
        </main>
      </div>
    );
  }

  if (isError || !plant) {
    return (
      <div className="min-h-screen bg-plant-cream/50">
        <Navbar />
        <main className="container mx-auto px-4 py-6 md:py-10">
          <div className="text-center py-12">
            <p className="text-lg text-plant-gray">Plant not found or error loading plant details.</p>
            <Link to="/plants">
              <Button variant="link" className="text-plant-dark-green mt-4">
                Browse available plants
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const ownerName = plant.profiles?.username || plant.owner?.username || 'Unknown';
  const ownerLocation = plant.profiles?.location || plant.owner?.location || 'Location not specified';
  const ownerAvatar = plant.profiles?.avatar_url || plant.owner?.avatar_url;
  const ownerId = plant.owner_id;

  return (
    <div className="min-h-screen bg-plant-cream/50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 md:py-10">
        <div className="mb-6">
          <Link to="/plants" className="text-plant-dark-green hover:underline flex items-center">
            <Button variant="link" className="pl-0">
              ← Back to Plants
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plant Image */}
          <Card className="md:order-1">
            <CardContent className="p-0">
              <AspectRatio ratio={16 / 9}>
                <img
                  src={plant.image_url || 'https://images.unsplash.com/photo-1637967886160-fd761519fb90?q=80&w=3540&auto=format&fit=crop'}
                  alt={plant.name}
                  className="object-cover rounded-md w-full h-full"
                />
              </AspectRatio>
            </CardContent>
          </Card>

          {/* Plant Details */}
          <Card className="md:order-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">{plant.name}</CardTitle>
                {user && (
                  <Button variant="ghost" size="icon" onClick={handleToggleFavorite}>
                    {isFavorited ? <Heart className="h-5 w-5 text-red-500 fill-current" /> : <Heart className="h-5 w-5" />}
                  </Button>
                )}
              </div>
              <CardDescription>{plant.species}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <h3 className="text-lg font-medium">Owner</h3>
                <Link to={`/profile/${ownerName}`} className="hover:opacity-80">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={ownerAvatar} />
                      <AvatarFallback>{ownerName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{ownerName}</p>
                      <p className="text-sm text-plant-gray">{ownerLocation}</p>
                    </div>
                  </div>
                </Link>
              </div>

              <Separator />

              <div className="grid gap-2">
                <h3 className="text-lg font-medium">Details</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-plant-gray">Difficulty:</p>
                    <Badge variant="secondary">{plant.difficulty || 'Not specified'}</Badge>
                  </div>
                  <div>
                    <p className="text-plant-gray">Sunlight:</p>
                    <Badge variant="secondary">{plant.sunlight || 'Not specified'}</Badge>
                  </div>
                  <div>
                    <p className="text-plant-gray">Watering:</p>
                    <Badge variant="secondary">{plant.watering_frequency || 'Not specified'}</Badge>
                  </div>
                  <div>
                    <p className="text-plant-gray">Size:</p>
                    <Badge variant="secondary">{plant.size || 'Not specified'}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-2">
                <h3 className="text-lg font-medium">Description</h3>
                <p className="text-plant-gray">{plant.description || 'No description provided.'}</p>
              </div>

              <Separator />

              <div className="grid gap-2">
                <h3 className="text-lg font-medium">Care Instructions</h3>
                <ScrollArea className="h-32">
                  <p className="text-plant-gray">{plant.care_instructions || 'No care instructions provided.'}</p>
                </ScrollArea>
              </div>

              <Separator />

              <div className="grid gap-2">
                {renderActionButton()}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {plant && (
        <SwapRequestModal 
          isOpen={isSwapModalOpen}
          onClose={() => setIsSwapModalOpen(false)}
          plantId={plant.id}
          plantName={plant.name}
          ownerId={ownerId}
        />
      )}
    </div>
  );
}
