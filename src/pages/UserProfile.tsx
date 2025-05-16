
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  MessageSquare, 
  Calendar, 
  MapPin,
  Star,
  PencilLine,
  Instagram,
  Twitter,
  AtSign,
  Loader2
} from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { PlantCard } from "@/components/PlantCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { usePlants } from "@/hooks/usePlants";
import { formatDistanceToNow } from 'date-fns';

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const { getProfile, profile, isLoadingProfile } = useProfile();
  const { plants: userPlants, isLoadingUserPlants } = usePlants();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if viewing own profile
  const isOwnProfile = user?.id === profile?.id || username === 'me';
  
  // Fetch profile data
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      if (username === 'me' && user) {
        await getProfile(user.user_metadata?.username || '');
      } else if (username) {
        await getProfile(username);
      }
      setIsLoading(false);
    };
    
    loadProfile();
  }, [username, user, getProfile]);
  
  // Filter plants to show only those belonging to the current profile
  const filteredPlants = userPlants?.filter(plant => 
    plant.owner_id === profile?.id
  ) || [];

  // Render loading state
  if (isLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-plant-cream/50">
        <Navbar />
        <main className="container mx-auto px-4 py-6 md:py-10 flex justify-center items-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-plant-dark-green mx-auto" />
            <p className="mt-2 text-plant-gray">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }
  
  // Render not found state
  if (!profile) {
    return (
      <div className="min-h-screen bg-plant-cream/50">
        <Navbar />
        <main className="container mx-auto px-4 py-6 md:py-10">
          <div className="mb-6">
            <Link to="/" className="text-plant-dark-green hover:underline flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to home
            </Link>
          </div>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
            <p className="text-plant-gray">The user profile you're looking for doesn't exist or has been removed.</p>
            <Link to="/">
              <Button variant="link" className="text-plant-dark-green mt-4">Return to home</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-plant-cream/50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 md:py-10">
        <div className="mb-6">
          <Link to="/" className="text-plant-dark-green hover:underline flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
        </div>
        
        {/* Profile header */}
        <div className="bg-white rounded-lg border border-plant-mint/30 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="shrink-0">
              <UserAvatar 
                src={profile?.avatar_url} 
                fallback={profile?.username || 'User'}
                className="h-24 w-24 md:h-32 md:w-32"
              />
            </div>
            
            {/* Profile info */}
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-plant-dark-green">{profile?.username}</h1>
                  <p className="text-plant-gray">@{profile?.username}</p>
                </div>
                
                <div className="mt-4 md:mt-0 space-x-3">
                  {isOwnProfile ? (
                    <Link to="/onboarding">
                      <Button 
                        variant="outline" 
                        className="border-plant-mint/50"
                      >
                        <PencilLine className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link to={`/messages?user=${profile.id}`}>
                        <Button 
                          variant="outline"
                          className="border-plant-mint/50"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Message
                        </Button>
                      </Link>
                      <Button className="bg-plant-dark-green hover:bg-plant-dark-green/90">
                        Follow
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              <p className="mb-4">{profile?.bio || "No bio available."}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {profile?.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-plant-gray mr-2" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-plant-gray mr-2" />
                  <span>Member since {formatDistanceToNow(new Date(profile?.created_at || new Date()), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 text-plant-gray mr-2" />
                  <span>{filteredPlants.length || 0} plants available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs for plants and reviews */}
        <Tabs defaultValue="plants" className="w-full">
          <TabsList className="mb-6 bg-white border border-plant-mint/30">
            <TabsTrigger value="plants" className="flex-1">Available Plants ({filteredPlants.length || 0})</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">Reviews ({reviews?.length || 0})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plants">
            {isLoadingUserPlants ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-plant-dark-green mx-auto" />
                <p className="mt-2 text-plant-gray">Loading plants...</p>
              </div>
            ) : filteredPlants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlants.map(plant => (
                  <Link to={`/plant/${plant.id}`} key={plant.id}>
                    <PlantCard 
                      plant={{
                        id: plant.id,
                        name: plant.name,
                        species: plant.species || '',
                        image: plant.image_url || 'https://images.unsplash.com/photo-1637967886160-fd761519fb90?q=80&w=3540&auto=format&fit=crop',
                        distance: profile?.location || 'Unknown location',
                        owner: {
                          name: profile?.username || 'Unknown user',
                          avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3540&auto=format&fit=crop'
                        },
                        sunlight: plant.sunlight || 'Not specified',
                        wateringFrequency: plant.watering_frequency || 'Not specified',
                        difficulty: plant.difficulty || 'Moderate'
                      }} 
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-plant-mint/30">
                <p className="text-plant-gray text-lg">No plants available for swap yet</p>
                {isOwnProfile && (
                  <Link to="/add-plant">
                    <Button variant="link" className="text-plant-dark-green mt-2">
                      Add your first plant
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reviews">
            <div className="text-center py-12 bg-white rounded-lg border border-plant-mint/30">
              <p className="text-plant-gray text-lg">No reviews yet</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
