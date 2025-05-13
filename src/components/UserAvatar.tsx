
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface UserAvatarProps {
  src?: string | null;
  fallback?: string;
  className?: string;
}

export function UserAvatar({ src, fallback, className = "" }: UserAvatarProps) {
  // Generate fallback text from the first letter of the fallback string
  const getFallbackText = () => {
    if (!fallback) return <User className="h-4 w-4" />;
    return fallback.charAt(0).toUpperCase();
  };

  return (
    <Avatar className={className}>
      <AvatarImage src={src || undefined} />
      <AvatarFallback className="bg-plant-mint text-plant-dark-green">
        {getFallbackText()}
      </AvatarFallback>
    </Avatar>
  );
}
