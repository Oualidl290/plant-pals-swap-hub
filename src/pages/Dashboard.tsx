
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { PlantCard } from "@/components/PlantCard";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  MessageSquare, 
  RefreshCw, 
  Sprout,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { usePlants } from "@/hooks/usePlants";
import { useSwapRequests } from "@/hooks/useSwapRequests";
import { useMessages } from "@/hooks/useMessages";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SwapRequestWithDetails } from "@/types/supabase";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("plants");

  const { userPlants, isLoadingUserPlants } = usePlants();
  const { sentRequests, receivedRequests, isLoadingSent, isLoadingReceived, updateSwapRequest } = useSwapRequests();
  const { conversations, isLoadingConversations } = useMessages();
  
  // Count unread messages - in a real app, you would track this in the database
  const unreadCount = conversations?.filter(conv => 
    conv.lastMessage && 
    conv.lastMessage.sender_id !== user?.id && 
    new Date(conv.lastMessage.sent_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length || 0;
  
  // Combine sent and received requests with type annotation
  const allRequests = [
    ...(sentRequests || []).map(req => ({ ...req, type: 'sent' } as SwapRequestWithDetails)),
    ...(receivedRequests || []).map(req => ({ ...req, type: 'received' } as SwapRequestWithDetails))
  ].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  
  const isLoading = isLoadingUserPlants || isLoadingSent || isLoadingReceived || isLoadingConversations;
  
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
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-plant-dark-green" />
            </div>
          ) : (
            <>
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
                    <p className="text-3xl font-bold">{userPlants?.length || 0}</p>
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
                    <p className="text-3xl font-bold">{allRequests.length}</p>
                    <p className="text-sm text-plant-gray">Active swap requests</p>
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
                    <p className="text-3xl font-bold">{unreadCount}</p>
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
                    Swap Requests
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
                    {userPlants && userPlants.length > 0 ? (
                      userPlants.map((plant) => (
                        <Link to={`/plants/${plant.id}`} key={plant.id}>
                          <PlantCard 
                            plant={{
                              id: plant.id,
                              name: plant.name,
                              species: plant.species || '',
                              image: plant.image_url || 'https://images.unsplash.com/photo-1637967886160-fd761519fb90?q=80&w=3540&auto=format&fit=crop',
                              distance: 'Your plant',
                              owner: {
                                name: 'You',
                                avatar: user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3540&auto=format&fit=crop'
                              },
                              sunlight: plant.sunlight || 'Not specified',
                              wateringFrequency: plant.watering_frequency || 'Not specified',
                              difficulty: plant.difficulty || 'Moderate'
                            }}
                          />
                        </Link>
                      ))
                    ) : null}
                    
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
                    {allRequests.length > 0 ? (
                      allRequests.map((request) => (
                        <div key={request.id} className="p-4 rounded-lg border border-plant-mint/30 bg-white">
                          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-md overflow-hidden">
                                <img 
                                  src={request.plants?.image_url || 'https://images.unsplash.com/photo-1637967886160-fd761519fb90?q=80&w=3540&auto=format&fit=crop'} 
                                  alt={request.plants?.name || 'Plant'} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{request.plants?.name || 'Unknown plant'}</h3>
                                  <Badge variant={
                                    request.status === 'pending' ? 'outline' :
                                    request.status === 'accepted' ? 'default' :
                                    request.status === 'completed' ? 'default' :
                                    'destructive'
                                  }>
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                  </Badge>
                                </div>
                                
                                {request.type === 'sent' ? (
                                  <p className="text-sm text-plant-gray">
                                    You requested from {request.plants.profiles?.username || 'Unknown user'} • {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                                  </p>
                                ) : (
                                  <p className="text-sm text-plant-gray">
                                    Requested by {request.requester?.username || 'Unknown user'} • {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              {request.status === 'pending' && request.type === 'received' && (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-red-200 hover:bg-red-50"
                                    onClick={() => updateSwapRequest({ id: request.id, status: 'declined' })}
                                  >
                                    Decline
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-plant-mint hover:bg-plant-mint/10"
                                    onClick={() => updateSwapRequest({ id: request.id, status: 'accepted' })}
                                  >
                                    Accept
                                  </Button>
                                </>
                              )}
                              
                              {request.status === 'pending' && request.type === 'sent' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-red-200 hover:bg-red-50"
                                  onClick={() => updateSwapRequest({ id: request.id, status: 'canceled' })}
                                >
                                  Cancel
                                </Button>
                              )}
                              
                              {request.status === 'accepted' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-plant-mint hover:bg-plant-mint/10"
                                  onClick={() => updateSwapRequest({ id: request.id, status: 'completed' })}
                                >
                                  Mark Completed
                                </Button>
                              )}
                              
                              <Link to={`/messages?swap=${request.id}`}>
                                <Button variant="default" size="sm" className="bg-plant-dark-green hover:bg-plant-dark-green/90">
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Message
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-plant-gray">
                        <p>No active swap requests</p>
                        <Link to="/plants">
                          <Button variant="link" className="text-plant-dark-green">
                            Browse available plants
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === "messages" && (
                  <div className="space-y-4">
                    {conversations && conversations.length > 0 ? (
                      conversations.map((conversation) => (
                        <Link key={conversation.id} to={`/messages?swap=${conversation.id}`}>
                          <div className={`p-4 rounded-lg border flex justify-between items-center ${
                            conversation.lastMessage && 
                            conversation.lastMessage.sender_id !== user?.id && 
                            new Date(conversation.lastMessage.sent_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                              ? "bg-plant-mint/10 border-plant-mint/50" 
                              : "bg-white border-plant-mint/30"
                          }`}>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={conversation.otherUser?.avatar_url || undefined} />
                                <AvatarFallback>{conversation.otherUser?.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium flex items-center">
                                  {conversation.otherUser?.username || 'Unknown user'}
                                  {conversation.lastMessage && 
                                   conversation.lastMessage.sender_id !== user?.id && 
                                   new Date(conversation.lastMessage.sent_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                                    <span className="ml-2 w-2 h-2 bg-plant-dark-green rounded-full"></span>
                                  )}
                                </h3>
                                <div className="flex items-center gap-1">
                                  <p className="text-sm text-plant-gray truncate max-w-[220px]">
                                    {conversation.lastMessage ? (
                                      conversation.lastMessage.sender_id === user?.id ? 
                                        `You: ${conversation.lastMessage.content}` : 
                                        conversation.lastMessage.content
                                    ) : (
                                      'No messages yet'
                                    )}
                                  </p>
                                  <Badge variant="outline" className="text-xs ml-1">
                                    {conversation.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-plant-gray">
                              {conversation.lastMessage ? 
                                formatDistanceToNow(new Date(conversation.lastMessage.sent_at), { addSuffix: true }) : 
                                formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center py-10 text-plant-gray">
                        <p>No conversations yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
