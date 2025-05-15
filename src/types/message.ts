
export interface Message {
  id: string;
  content: string;
  sender_id: string;
  swap_request_id: string;
  sent_at: string;
  read?: boolean;
  sender?: {
    username: string;
    avatar_url: string | null;
  };
}

export interface Conversation {
  id: string;
  plants: any;
  status: string;
  message: string | null;
  created_at: string;
  updated_at: string;
  otherUser: {
    username: string | null;
    avatar_url: string | null;
  };
  lastMessage?: Message;
}
