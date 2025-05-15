
import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send,
  Search,
  Phone,
  MoreHorizontal,
  Image,
  Smile,
  Paperclip,
  MessageSquare,
  Loader2
} from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useMessages } from "@/hooks/useMessages";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { SwapRequestWithDetails } from "@/types/supabase";
import { Skeleton } from "@/components/ui/skeleton";

export default function Messages() {
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { 
    conversations, 
    messages, 
    isLoading, 
    isLoadingConversations, 
    sendMessage,
    isSending
  } = useMessages(activeConversation);
  
  // Filter conversations based on search term
  const filteredConversations = (conversations || [])
    .filter(conv => {
      const otherUsername = conv.otherUser?.username || '';
      return otherUsername.toLowerCase().includes(searchTerm.toLowerCase());
    });
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    sendMessage({
      content: newMessage,
      swapRequestId: activeConversation
    });
    
    setNewMessage("");
  };
  
  // Format date helper function
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return format(date, "h:mm a");
    } else if (date.getFullYear() === today.getFullYear()) {
      return format(date, "MMM d, h:mm a");
    } else {
      return format(date, "MMM d, yyyy");
    }
  };
  
  // Get active conversation details
  const activeConversationDetails = activeConversation 
    ? conversations?.find(c => c.id === activeConversation)
    : null;
    
  // Get the other user in the conversation
  const otherUser = activeConversationDetails?.otherUser;

  // Get the plant involved in the swap
  const plant = activeConversationDetails?.plants;

  return (
    <div className="min-h-screen bg-plant-cream/50">
      <Navbar />
      
      <main className="container mx-auto px-0 md:px-4 py-6 md:py-10">
        <div className="bg-white rounded-lg border border-plant-mint/30 shadow-sm overflow-hidden h-[calc(100vh-13rem)]">
          <div className="grid md:grid-cols-3 h-full">
            {/* Conversation list */}
            <div className="md:col-span-1 border-r border-plant-mint/30 flex flex-col h-full">
              <div className="p-4 border-b border-plant-mint/30">
                <h1 className="text-xl font-serif font-bold text-plant-dark-green mb-4">Messages</h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-plant-gray h-4 w-4" />
                  <Input 
                    placeholder="Search conversations..." 
                    className="pl-9 border-plant-mint/30 focus:border-plant-dark-green"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <ScrollArea className="flex-1 h-full">
                {isLoadingConversations ? (
                  <div className="divide-y divide-plant-mint/30">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-4">
                        <div className="flex gap-3">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-28 mb-2" />
                            <Skeleton className="h-3 w-40" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-plant-mint/30">
                    {filteredConversations.length > 0 ? filteredConversations.map(conversation => {
                      const isActive = activeConversation === conversation.id;
                      const hasUnread = conversation.lastMessage && 
                        conversation.lastMessage.sender_id !== user?.id && 
                        conversation.lastMessage.read === false;
                      
                      return (
                        <button
                          key={conversation.id}
                          className={cn(
                            "w-full text-left hover:bg-plant-mint/5 p-4 transition-colors",
                            isActive && "bg-plant-mint/10"
                          )}
                          onClick={() => setActiveConversation(conversation.id)}
                        >
                          <div className="flex gap-3">
                            <div className="relative">
                              <UserAvatar 
                                src={conversation.otherUser?.avatar_url || undefined}
                                fallback={conversation.otherUser?.username || "User"}
                                className="h-12 w-12"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <h3 className="font-medium truncate">{conversation.otherUser?.username || "User"}</h3>
                                <span className="text-xs text-plant-gray whitespace-nowrap">
                                  {conversation.lastMessage ? formatMessageDate(conversation.lastMessage.sent_at) : formatMessageDate(conversation.updated_at)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <p className={`text-sm truncate ${
                                  hasUnread ? "text-plant-dark-green font-medium" : "text-plant-gray"
                                }`}>
                                  {conversation.lastMessage ? (
                                    <>
                                      {conversation.lastMessage.sender_id === user?.id && "You: "}
                                      {conversation.lastMessage.content}
                                    </>
                                  ) : (
                                    <>Plant: {conversation.plants.name}</>
                                  )}
                                </p>
                                {hasUnread && (
                                  <span className="h-2 w-2 rounded-full bg-plant-dark-green"></span>
                                )}
                              </div>
                              <p className="text-xs text-plant-gray mt-1 truncate">
                                Plant: {conversation.plants.name} | Status: {conversation.status}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    }) : (
                      <div className="p-6 text-center text-plant-gray">
                        {searchTerm ? 'No conversations found' : 'No conversations yet'}
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>
            
            {/* Message thread */}
            <div className="md:col-span-2 flex flex-col h-full">
              {activeConversation && otherUser ? (
                <>
                  {/* Chat header */}
                  <div className="p-3 border-b border-plant-mint/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar 
                        src={otherUser?.avatar_url || undefined}
                        fallback={otherUser?.username || ""}
                        className="h-10 w-10"
                      />
                      <div>
                        <h2 className="font-medium">{otherUser?.username}</h2>
                        <p className="text-xs text-plant-gray">
                          About: {plant?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="text-plant-gray">
                        <Phone className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-plant-gray">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Messages area */}
                  <ScrollArea className="flex-1 p-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-plant-dark-green" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages && messages.length > 0 ? (
                          messages.map((message) => (
                            <div 
                              key={message.id} 
                              className={cn(
                                "flex",
                                message.sender_id === user?.id ? "justify-end" : "justify-start"
                              )}
                            >
                              <div className="flex flex-col max-w-[80%]">
                                <div 
                                  className={cn(
                                    "rounded-2xl px-4 py-2",
                                    message.sender_id === user?.id 
                                      ? "bg-plant-dark-green text-white rounded-br-sm" 
                                      : "bg-plant-mint/20 text-plant-dark rounded-bl-sm"
                                  )}
                                >
                                  {message.content}
                                </div>
                                <div 
                                  className={cn(
                                    "flex items-center text-xs mt-1 text-plant-gray",
                                    message.sender_id === user?.id ? "justify-end" : "justify-start"
                                  )}
                                >
                                  {formatMessageDate(message.sent_at)}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-plant-gray py-8">
                            Start a conversation about {plant?.name}
                          </div>
                        )}
                        <div ref={messageEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                  
                  {/* Message input */}
                  <div className="p-3 border-t border-plant-mint/30">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="text-plant-gray rounded-full">
                        <Smile className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-plant-gray rounded-full">
                        <Paperclip className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-plant-gray rounded-full">
                        <Image className="h-5 w-5" />
                      </Button>
                      <Input 
                        placeholder="Type a message..." 
                        className="border-plant-mint/30 focus:border-plant-dark-green"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button 
                        className="bg-plant-dark-green hover:bg-plant-dark-green/90 rounded-full h-10 w-10 p-0"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSending}
                      >
                        {isSending ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="bg-plant-mint/20 p-6 rounded-full mb-4">
                    <MessageSquare className="h-10 w-10 text-plant-dark-green" />
                  </div>
                  <h2 className="text-xl font-medium mb-2">Your Messages</h2>
                  <p className="text-plant-gray mb-6">
                    Select a conversation from the list to view messages
                  </p>
                  {!isLoadingConversations && filteredConversations.length === 0 && (
                    <p className="text-plant-gray">
                      You don't have any conversations yet. <br />
                      Browse plants and request a swap to start chatting!
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
