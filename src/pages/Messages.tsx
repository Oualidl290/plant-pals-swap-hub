
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
  Paperclip
} from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Sample data - will be replaced with actual data from Supabase
const conversationsData = [
  {
    id: 1,
    person: {
      id: "user1",
      name: "Michael Chen",
      avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=3540&auto=format&fit=crop",
      online: true,
      lastSeen: null
    },
    lastMessage: {
      text: "Is your monstera still available for swap?",
      time: "10:45 AM",
      unread: true,
      fromMe: false
    }
  },
  {
    id: 2,
    person: {
      id: "user2",
      name: "Emma Wilson",
      avatar: "https://images.unsplash.com/photo-1664575602554-2087b04935a5?q=80&w=3540&auto=format&fit=crop",
      online: false,
      lastSeen: "2 hours ago"
    },
    lastMessage: {
      text: "Thanks for the plant care tips!",
      time: "Yesterday",
      unread: false,
      fromMe: true
    }
  },
  {
    id: 3,
    person: {
      id: "user3",
      name: "David Park",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3540&auto=format&fit=crop",
      online: true,
      lastSeen: null
    },
    lastMessage: {
      text: "Let's meet this weekend for the plant swap",
      time: "Wed",
      unread: false,
      fromMe: false
    }
  },
  {
    id: 4,
    person: {
      id: "user4",
      name: "Lisa Gomez",
      avatar: "https://images.unsplash.com/photo-1499887142886-791eca5918cd?q=80&w=3540&auto=format&fit=crop",
      online: false,
      lastSeen: "Yesterday"
    },
    lastMessage: {
      text: "I'll bring the pothos and philodendron.",
      time: "Mon",
      unread: false,
      fromMe: false
    }
  }
];

// Sample message data
const messageThreads = {
  1: [
    {
      id: 1,
      text: "Hi there! I noticed you have a monstera for swap.",
      time: "10:30 AM",
      sender: "user1",
      status: "read"
    },
    {
      id: 2,
      text: "Yes, I do! It's a healthy cutting with aerial roots.",
      time: "10:32 AM",
      sender: "me",
      status: "read"
    },
    {
      id: 3,
      text: "Is it still available for swap?",
      time: "10:45 AM",
      sender: "user1",
      status: "delivered"
    }
  ],
  2: [
    {
      id: 1,
      text: "Hey! How do I care for a snake plant?",
      time: "Yesterday 3:15 PM",
      sender: "user2",
      status: "read"
    },
    {
      id: 2,
      text: "Snake plants are super easy! They need very little water - once every 2-3 weeks. They can handle low light but prefer bright indirect light.",
      time: "Yesterday 3:20 PM",
      sender: "me",
      status: "read"
    },
    {
      id: 3,
      text: "Thanks for the plant care tips!",
      time: "Yesterday 3:45 PM",
      sender: "user2",
      status: "read"
    }
  ]
};

export default function Messages() {
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [conversations, setConversations] = useState(conversationsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [messageList, setMessageList] = useState<any[]>([]);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => 
    conv.person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Load messages when conversation changes
  useEffect(() => {
    if (activeConversation) {
      setMessageList(messageThreads[activeConversation as keyof typeof messageThreads] || []);
      
      // Mark conversation as read
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation 
            ? { ...conv, lastMessage: { ...conv.lastMessage, unread: false } }
            : conv
        )
      );
    }
  }, [activeConversation]);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);
  
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    const newMsg = {
      id: messageList.length + 1,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: "me",
      status: "sending"
    };
    
    // Add message to thread
    setMessageList(prev => [...prev, newMsg]);
    setNewMessage("");
    
    // Simulate sending message
    setTimeout(() => {
      // Update message status
      setMessageList(prev => 
        prev.map(msg => 
          msg.id === newMsg.id ? { ...msg, status: "sent" } : msg
        )
      );
      
      // Update conversation last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation 
            ? { 
                ...conv, 
                lastMessage: { 
                  text: newMessage, 
                  time: "Just now", 
                  unread: false, 
                  fromMe: true 
                } 
              }
            : conv
        )
      );
    }, 500);
    
    // Simulate received
    setTimeout(() => {
      setMessageList(prev => 
        prev.map(msg => 
          msg.id === newMsg.id ? { ...msg, status: "delivered" } : msg
        )
      );
    }, 1500);
  };
  
  // Get active person
  const activePerson = activeConversation 
    ? conversations.find(c => c.id === activeConversation)?.person
    : null;

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
                <div className="divide-y divide-plant-mint/30">
                  {filteredConversations.map(conversation => (
                    <button
                      key={conversation.id}
                      className={cn(
                        "w-full text-left hover:bg-plant-mint/5 p-4 transition-colors",
                        activeConversation === conversation.id && "bg-plant-mint/10"
                      )}
                      onClick={() => setActiveConversation(conversation.id)}
                    >
                      <div className="flex gap-3">
                        <div className="relative">
                          <UserAvatar 
                            src={conversation.person.avatar}
                            fallback={conversation.person.name}
                            className="h-12 w-12"
                          />
                          {conversation.person.online && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium truncate">{conversation.person.name}</h3>
                            <span className="text-xs text-plant-gray whitespace-nowrap">{conversation.lastMessage.time}</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p className={`text-sm truncate ${
                              conversation.lastMessage.unread && !conversation.lastMessage.fromMe
                                ? "text-plant-dark-green font-medium"
                                : "text-plant-gray"
                            }`}>
                              {conversation.lastMessage.fromMe && "You: "}
                              {conversation.lastMessage.text}
                            </p>
                            {conversation.lastMessage.unread && !conversation.lastMessage.fromMe && (
                              <span className="h-2 w-2 rounded-full bg-plant-dark-green"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {filteredConversations.length === 0 && (
                    <div className="p-6 text-center text-plant-gray">
                      No conversations found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            
            {/* Message thread */}
            <div className="md:col-span-2 flex flex-col h-full">
              {activeConversation ? (
                <>
                  {/* Chat header */}
                  <div className="p-3 border-b border-plant-mint/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar 
                        src={activePerson?.avatar}
                        fallback={activePerson?.name || ""}
                        className="h-10 w-10"
                      />
                      <div>
                        <h2 className="font-medium">{activePerson?.name}</h2>
                        <p className="text-xs text-plant-gray">
                          {activePerson?.online ? (
                            <span className="flex items-center">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></span>
                              Online
                            </span>
                          ) : (
                            `Last seen ${activePerson?.lastSeen}`
                          )}
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
                    <div className="space-y-4">
                      {messageList.map((message) => (
                        <div 
                          key={message.id} 
                          className={cn(
                            "flex",
                            message.sender === "me" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div className="flex flex-col max-w-[80%]">
                            <div 
                              className={cn(
                                "rounded-2xl px-4 py-2",
                                message.sender === "me" 
                                  ? "bg-plant-dark-green text-white rounded-br-sm" 
                                  : "bg-plant-mint/20 text-plant-dark rounded-bl-sm"
                              )}
                            >
                              {message.text}
                            </div>
                            <div 
                              className={cn(
                                "flex items-center text-xs mt-1 text-plant-gray",
                                message.sender === "me" ? "justify-end" : "justify-start"
                              )}
                            >
                              {message.time}
                              {message.sender === "me" && (
                                <span className="ml-1">
                                  {message.status === "sending" && "• Sending..."}
                                  {message.status === "sent" && "• Sent"}
                                  {message.status === "delivered" && "• Delivered"}
                                  {message.status === "read" && "• Read"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messageEndRef} />
                    </div>
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
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-5 w-5" />
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
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
