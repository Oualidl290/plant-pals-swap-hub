
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, RefreshCw, Check, X, Clock, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useSwapRequests, SwapRequestStatus } from "@/hooks/useSwapRequests";
import { format, formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SwapRequestWithDetails } from "@/types/supabase";
import { useToast } from "@/hooks/use-toast";

export default function SwapsPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const { sentRequests, receivedRequests, updateSwapRequest, isUpdating, isLoadingSent, isLoadingReceived } = useSwapRequests();
  const { toast } = useToast();
  
  // Filter requests based on active tab
  const filterRequests = (requests: SwapRequestWithDetails[] = [], status?: string) => {
    if (!status || status === "all") return requests;
    return requests.filter(request => request.status === status);
  };
  
  // Map status to badges
  const getStatusBadge = (status: SwapRequestStatus) => {
    switch(status) {
      case "pending":
        return <Badge variant="outline" className="flex items-center"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
      case "accepted":
        return <Badge className="bg-green-100 text-green-800 flex items-center"><Check className="mr-1 h-3 w-3" /> Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive" className="flex items-center"><X className="mr-1 h-3 w-3" /> Declined</Badge>;
      case "completed":
        return <Badge className="bg-plant-dark-green text-white flex items-center"><Check className="mr-1 h-3 w-3" /> Completed</Badge>;
      case "canceled":
        return <Badge variant="outline" className="flex items-center text-gray-500"><X className="mr-1 h-3 w-3" /> Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handle swap status update
  const handleUpdateSwapRequest = async (id: string, status: SwapRequestStatus) => {
    try {
      await updateSwapRequest({ id, status });
      
      const statusMessages = {
        accepted: 'Swap request accepted!',
        declined: 'Swap request declined.',
        completed: 'Swap has been marked as completed!',
        canceled: 'Swap request canceled.'
      };
      
      toast({
        title: "Status updated",
        description: statusMessages[status as keyof typeof statusMessages] || "Request status updated",
      });
    } catch (error) {
      console.error("Error updating swap request:", error);
      toast({
        title: "Error",
        description: "Failed to update swap request. Please try again.",
        variant: "destructive"
      });
    }
  }
  
  // Combine and sort all requests
  const allRequests = [
    ...(sentRequests?.map(req => ({ ...req, type: 'sent' as const })) || []),
    ...(receivedRequests?.map(req => ({ ...req, type: 'received' as const })) || [])
  ].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  
  // Filter based on active tab
  const filteredRequests = filterRequests(allRequests, activeTab);
  
  const isLoading = isLoadingSent || isLoadingReceived;
  
  return (
    <div className="min-h-screen bg-plant-cream/50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 md:py-10">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-plant-dark-green">Swap Requests</h1>
            <p className="text-plant-gray mt-1">Manage all your plant swap requests</p>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="declined">Declined/Canceled</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-plant-dark-green mx-auto" />
                    <p className="mt-2 text-plant-gray">Loading swap requests...</p>
                  </div>
                ) : filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <Card key={request.id} className="overflow-hidden">
                      <CardHeader className="bg-plant-mint/10 pb-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage 
                                src={request.type === 'sent' 
                                  ? request.plants?.profiles?.avatar_url || undefined
                                  : request.requester?.avatar_url || undefined
                                } 
                              />
                              <AvatarFallback>
                                {request.type === 'sent' 
                                  ? (request.plants?.profiles?.username?.charAt(0) || '?')
                                  : (request.requester?.username?.charAt(0) || '?')
                                }
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg font-medium">
                                {request.type === 'sent' 
                                  ? `To: ${request.plants?.profiles?.username || 'Unknown user'}`
                                  : `From: ${request.requester?.username || 'Unknown user'}`
                                }
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" /> 
                                {format(new Date(request.created_at), 'PPP')} 
                                ({formatDistanceToNow(new Date(request.created_at), { addSuffix: true })})
                              </CardDescription>
                            </div>
                          </div>
                          {getStatusBadge(request.status as SwapRequestStatus)}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-4">
                        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                          <div>
                            <Link to={`/plant/${request.plant_id}`} className="hover:underline text-plant-dark-green">
                              <h3 className="font-medium">Plant: {request.plants?.name || 'Unknown plant'}</h3>
                            </Link>
                            {request.message && (
                              <p className="text-sm text-plant-gray mt-2 italic">"{request.message}"</p>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            {request.status === 'pending' && request.type === 'received' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  className="border-red-200 hover:bg-red-50"
                                  onClick={() => handleUpdateSwapRequest(request.id, 'declined')}
                                  disabled={isUpdating}
                                >
                                  <X className="mr-1 h-4 w-4" />
                                  Decline
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="border-plant-mint hover:bg-plant-mint/10"
                                  onClick={() => handleUpdateSwapRequest(request.id, 'accepted')}
                                  disabled={isUpdating}
                                >
                                  <Check className="mr-1 h-4 w-4" />
                                  Accept
                                </Button>
                              </>
                            )}
                            
                            {request.status === 'pending' && request.type === 'sent' && (
                              <Button 
                                variant="outline" 
                                className="border-red-200 hover:bg-red-50"
                                onClick={() => handleUpdateSwapRequest(request.id, 'canceled')}
                                disabled={isUpdating}
                              >
                                <X className="mr-1 h-4 w-4" />
                                Cancel
                              </Button>
                            )}
                            
                            {request.status === 'accepted' && (
                              <Button 
                                variant="outline" 
                                className="border-plant-mint hover:bg-plant-mint/10"
                                onClick={() => handleUpdateSwapRequest(request.id, 'completed')}
                                disabled={isUpdating}
                              >
                                <Check className="mr-1 h-4 w-4" />
                                Mark Completed
                              </Button>
                            )}
                            
                            <Link to={`/messages?swap=${request.id}`}>
                              <Button className="bg-plant-dark-green hover:bg-plant-dark-green/90">
                                <MessageSquare className="mr-1 h-4 w-4" />
                                Message
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-plant-gray">No swap requests found</p>
                    <Link to="/plants">
                      <Button variant="link" className="text-plant-dark-green mt-2">
                        Browse plants
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
