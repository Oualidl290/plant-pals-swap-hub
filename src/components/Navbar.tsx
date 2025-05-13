
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Leaf, 
  Menu, 
  X, 
  User,
  LogOut
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthModal } from './AuthModal';
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from './UserAvatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingScreen } from './auth/LoadingScreen';

export function Navbar() {
  const navigate = useNavigate();
  const { user, status, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  const openSignIn = () => {
    navigate('/auth');
  };
  
  const openSignUp = () => {
    setAuthMode('signup');
    navigate('/auth');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // If auth is still loading, don't render navbar yet
  if (status === "loading") {
    return <LoadingScreen />;
  }

  return (
    <>
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b border-plant-mint/30">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-plant-dark-green">
            <Leaf className="h-6 w-6" />
            <span className="font-serif font-bold text-xl">PlantPals</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#featured" className="text-plant-dark hover:text-plant-dark-green transition-colors">Browse Plants</a>
            <a href="#how-it-works" className="text-plant-dark hover:text-plant-dark-green transition-colors">How It Works</a>
            <a href="#about" className="text-plant-dark hover:text-plant-dark-green transition-colors">About Us</a>
            
            {status === "authenticated" && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-0 h-9 w-9">
                    <UserAvatar 
                      src={user?.user_metadata?.avatar_url} 
                      fallback={user?.user_metadata?.full_name || user?.email} 
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    {user.user_metadata?.full_name || user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-plants">My Plants</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messages">Messages</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  variant="outline"
                  className="text-plant-dark-green border-plant-dark-green hover:bg-plant-dark-green hover:text-white"
                  onClick={openSignIn}
                >
                  Sign In
                </Button>
                <Button 
                  className="bg-plant-dark-green hover:bg-plant-dark-green/90 text-white"
                  onClick={openSignUp}
                >
                  Join Now
                </Button>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {status === "authenticated" && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-0 h-9 w-9 mr-2">
                    <UserAvatar 
                      src={user?.user_metadata?.avatar_url} 
                      fallback={user?.user_metadata?.full_name || user?.email} 
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-plants">My Plants</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messages">Messages</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-plant-dark-green p-2"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-plant-mint/30 animate-fade-in">
            <div className="px-4 py-5 space-y-4">
              <a href="#featured" className="block text-plant-dark hover:text-plant-dark-green">Browse Plants</a>
              <a href="#how-it-works" className="block text-plant-dark hover:text-plant-dark-green">How It Works</a>
              <a href="#about" className="block text-plant-dark hover:text-plant-dark-green">About Us</a>
              {status !== "authenticated" && (
                <div className="pt-4 flex flex-col space-y-3">
                  <Button 
                    variant="outline"
                    className="w-full justify-center text-plant-dark-green border-plant-dark-green hover:bg-plant-dark-green hover:text-white"
                    onClick={openSignIn}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="w-full justify-center bg-plant-dark-green hover:bg-plant-dark-green/90 text-white"
                    onClick={openSignUp}
                  >
                    Join Now
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
