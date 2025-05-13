
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  MessageSquare, 
  Calendar, 
  MapPin,
  Star,
  PencilLine,
  Instagram,
  Twitter,
  AtSign
} from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { PlantCard } from "@/components/PlantCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

// Sample data - will be replaced with actual data from Supabase
const userData = {
  id: "user123",
  username: "plantlover",
  name: "Sarah Johnson",
  avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=3540&auto=format&fit=crop",
  bio: "Plant enthusiast and swap fanatic based in Portland. I love collecting aroids and helping new plant parents get started. Always looking to share plant joy and expand my collection!",
  location: "Portland, OR",
  memberSince: "Jan 2023",
  completedSwaps: 15,
  rating: 4.8,
  reviewCount: 12, // Changed from reviews to reviewCount to avoid duplicate
  social: {
    instagram: "plantlover_sarah",
    twitter: "sarahplants",
    email: "sarah@example.com"
  },
  plants: [
    {
      id: 1,
      name: "Monstera Deliciosa",
      species: "Monstera",
      image: "https://images.unsplash.com/photo-1637967886160-fd761519fb90?q=80&w=3540&auto=format&fit=crop",
      distance: "Your plant",
      owner: {
        name: "Sarah Johnson",
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
      distance: "Your plant",
      owner: {
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=3540&auto=format&fit=crop"
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
      distance: "Your plant",
      owner: {
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=3540&auto=format&fit=crop"
      },
      sunlight: "Bright indirect",
      wateringFrequency: "Weekly",
      difficulty: "Moderate"
    }
  ],
  reviews: [
    {
      id: 1,
      user: "Michael",
      avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=3540&auto=format&fit=crop",
      rating: 5,
      date: "2025-04-15",
      text: "Sarah is amazing! The plant was exactly as described and she provided helpful care tips. Would swap again in a heartbeat."
    },
    {
      id: 2,
      user: "Emma",
      avatar: "https://images.unsplash.com/photo-1664575602554-2087b04935a5?q=80&w=3540&auto=format&fit=crop",
      rating: 5,
      date: "2025-03-20",
      text: "Great experience swapping with Sarah. The plant was healthy and she was very knowledgeable."
    },
    {
      id: 3,
      user: "David",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3540&auto=format&fit=crop",
      rating: 4,
      date: "2025-02-10",
      text: "Smooth swap experience. Plant was in good condition, though a bit smaller than I expected."
    }
  ]
};

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  
  // Check if viewing own profile (we'd normally check user ID against profile ID)
  const isOwnProfile = user?.user_metadata?.username === username || username === 'me';
  
  // Use provided username or default to sample data
  const profile = userData; // In real app, would fetch based on username

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
                src={profile.avatar} 
                fallback={profile.name}
                className="h-24 w-24 md:h-32 md:w-32"
              />
            </div>
            
            {/* Profile info */}
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-plant-dark-green">{profile.name}</h1>
                  <p className="text-plant-gray">@{profile.username}</p>
                </div>
                
                <div className="mt-4 md:mt-0 space-x-3">
                  {isOwnProfile ? (
                    <Button 
                      variant="outline" 
                      className="border-plant-mint/50"
                      onClick={() => window.location.href = "/settings/profile"}
                    >
                      <PencilLine className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="outline"
                        className="border-plant-mint/50"
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                      <Button className="bg-plant-dark-green hover:bg-plant-dark-green/90">
                        Follow
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              <p className="mb-4">{profile.bio}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-plant-gray mr-2" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-plant-gray mr-2" />
                  <span>Member since {profile.memberSince}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-plant-gold mr-2" />
                  <span>{profile.rating} ({profile.reviews.length} reviews)</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 text-plant-gray mr-2" />
                  <span>{profile.completedSwaps} swaps completed</span>
                </div>
              </div>
              
              {/* Social links */}
              <div className="flex gap-4 mt-4 text-plant-gray">
                {profile.social.instagram && (
                  <a href={`https://instagram.com/${profile.social.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-plant-dark-green flex items-center">
                    <Instagram className="h-4 w-4 mr-1" />
                    <span className="text-sm">{profile.social.instagram}</span>
                  </a>
                )}
                {profile.social.twitter && (
                  <a href={`https://twitter.com/${profile.social.twitter}`} target="_blank" rel="noopener noreferrer" className="hover:text-plant-dark-green flex items-center">
                    <Twitter className="h-4 w-4 mr-1" />
                    <span className="text-sm">{profile.social.twitter}</span>
                  </a>
                )}
                {profile.social.email && (
                  <a href={`mailto:${profile.social.email}`} className="hover:text-plant-dark-green flex items-center">
                    <AtSign className="h-4 w-4 mr-1" />
                    <span className="text-sm">{profile.social.email}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs for plants and reviews */}
        <Tabs defaultValue="plants" className="w-full">
          <TabsList className="mb-6 bg-white border border-plant-mint/30">
            <TabsTrigger value="plants" className="flex-1">Available Plants ({profile.plants.length})</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">Reviews ({profile.reviews.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plants">
            {profile.plants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.plants.map(plant => (
                  <PlantCard key={plant.id} plant={plant} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-plant-mint/30">
                <p className="text-plant-gray text-lg">No plants available for swap yet</p>
                {isOwnProfile && (
                  <Button 
                    variant="link" 
                    className="text-plant-dark-green mt-2"
                    onClick={() => window.location.href = "/add-plant"}
                  >
                    Add your first plant
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reviews">
            {profile.reviews.length > 0 ? (
              <div className="space-y-4">
                {profile.reviews.map(review => (
                  <div key={review.id} className="bg-white rounded-lg border border-plant-mint/30 p-4">
                    <div className="flex justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar 
                          src={review.avatar}
                          fallback={review.user}
                          className="h-8 w-8"
                        />
                        <span className="font-medium">{review.user}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-plant-gold flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? "fill-current" : "stroke-current fill-transparent"}`} 
                            />
                          ))}
                        </span>
                        <span className="text-xs text-plant-gray ml-2">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p>{review.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-plant-mint/30">
                <p className="text-plant-gray text-lg">No reviews yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
