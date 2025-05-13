
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { PlantCard } from "@/components/PlantCard";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  MessageSquare, 
  RefreshCw, 
  Sprout 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Sample data - will be replaced with actual data from Supabase
const myPlants = [
  {
    id: 1,
    name: "Monstera Deliciosa",
    species: "Monstera",
    image: "https://images.unsplash.com/photo-1637967886160-fd761519fb90?q=80&w=3540&auto=format&fit=crop",
    distance: "Your plant",
    owner: {
      name: "You",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3540&auto=format&fit=crop"
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
      name: "You",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3540&auto=format&fit=crop"
    },
    sunlight: "Low to bright",
    wateringFrequency: "Every 2-3 weeks",
    difficulty: "Very Easy"
  }
];

const recentSwaps = [
  {
    id: 1,
    plant: "Fiddle Leaf Fig",
    with: "Alex",
    date: "2025-05-10",
    status: "Completed"
  },
  {
    id: 2,
    plant: "Pothos",
    with: "Maria",
    date: "2025-05-08",
    status: "Pending"
  }
];

const recentMessages = [
  {
    id: 1,
    from: "Sarah",
    message: "Is your philodendron still available?",
    time: "10:45 AM",
    unread: true
  },
  {
    id: 2,
    from: "Miguel",
    message: "Thanks for the plant care tips!",
    time: "Yesterday",
    unread: false
  }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("plants");
  
  return (
    <div className="min-h-screen bg-plant-cream/50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 md:py-10">
        <div className="flex flex-col gap-6">
          {/* Welcome section */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-serif font-bold text-plant-dark-green">Welcome, {user?.user_metadata?.full_name || 'Plant Friend'}</h1>
              <p className="text-plant-gray mt-1">Your plant dashboard</p>
            </div>
            
            <Link to="/add-plant">
              <Button className="bg-plant-dark-green hover:bg-plant-dark-green/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Plant
              </Button>
            </Link>
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-plant-mint/20 border-plant-mint">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Sprout className="mr-2 h-5 w-5 text-plant-dark-green" />
                  My Plants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{myPlants.length}</p>
                <p className="text-sm text-plant-gray">Plants in your collection</p>
              </CardContent>
            </Card>
            
            <Card className="bg-plant-gold/10 border-plant-gold/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <RefreshCw className="mr-2 h-5 w-5 text-plant-brown" />
                  Swaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{recentSwaps.length}</p>
                <p className="text-sm text-plant-gray">Recent plant swaps</p>
              </CardContent>
            </Card>
            
            <Card className="bg-plant-sage/10 border-plant-sage/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-plant-sage" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{recentMessages.filter(m => m.unread).length}</p>
                <p className="text-sm text-plant-gray">Unread messages</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Tab navigation */}
          <div className="border-b border-plant-mint/30">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("plants")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "plants"
                    ? "border-plant-dark-green text-plant-dark-green"
                    : "border-transparent text-plant-gray hover:text-plant-dark-green hover:border-plant-mint"
                }`}
              >
                My Plants
              </button>
              <button
                onClick={() => setActiveTab("swaps")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "swaps"
                    ? "border-plant-dark-green text-plant-dark-green"
                    : "border-transparent text-plant-gray hover:text-plant-dark-green hover:border-plant-mint"
                }`}
              >
                Recent Swaps
              </button>
              <button
                onClick={() => setActiveTab("messages")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "messages"
                    ? "border-plant-dark-green text-plant-dark-green"
                    : "border-transparent text-plant-gray hover:text-plant-dark-green hover:border-plant-mint"
                }`}
              >
                Messages
              </button>
            </nav>
          </div>
          
          {/* Tab content */}
          <div className="py-4">
            {activeTab === "plants" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myPlants.map((plant) => (
                  <PlantCard key={plant.id} plant={plant} />
                ))}
                <Link to="/add-plant" className="flex items-center justify-center h-full min-h-48 rounded-lg border-2 border-dashed border-plant-mint hover:border-plant-dark-green hover:bg-plant-mint/10 transition-colors">
                  <div className="flex flex-col items-center text-plant-gray">
                    <Plus className="h-10 w-10 mb-2" />
                    <span className="font-medium">Add New Plant</span>
                  </div>
                </Link>
              </div>
            )}
            
            {activeTab === "swaps" && (
              <div className="space-y-4">
                {recentSwaps.map((swap) => (
                  <div key={swap.id} className="p-4 rounded-lg border border-plant-mint/30 bg-white flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{swap.plant}</h3>
                      <p className="text-sm text-plant-gray">Swap with {swap.with} • {new Date(swap.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        swap.status === "Completed" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {swap.status}
                      </span>
                    </div>
                  </div>
                ))}
                {recentSwaps.length === 0 && (
                  <div className="text-center py-10 text-plant-gray">
                    <p>No recent swaps</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === "messages" && (
              <div className="space-y-4">
                {recentMessages.map((msg) => (
                  <Link key={msg.id} to={`/messages/${msg.id}`}>
                    <div className={`p-4 rounded-lg border flex justify-between items-center ${
                      msg.unread 
                        ? "bg-plant-mint/10 border-plant-mint/50" 
                        : "bg-white border-plant-mint/30"
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-plant-sage flex items-center justify-center text-white">
                          {msg.from.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium flex items-center">
                            {msg.from}
                            {msg.unread && <span className="ml-2 w-2 h-2 bg-plant-dark-green rounded-full"></span>}
                          </h3>
                          <p className="text-sm text-plant-gray truncate">{msg.message}</p>
                        </div>
                      </div>
                      <div className="text-xs text-plant-gray">{msg.time}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
