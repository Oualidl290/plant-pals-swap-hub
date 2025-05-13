
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Leaf, Menu, X, User } from "lucide-react";
import { AuthModal } from './AuthModal';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  const openSignIn = () => {
    setAuthMode('signin');
    setAuthModalOpen(true);
  };
  
  const openSignUp = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b border-plant-mint/30">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2 text-plant-dark-green">
            <Leaf className="h-6 w-6" />
            <span className="font-serif font-bold text-xl">PlantPals</span>
          </a>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#featured" className="text-plant-dark hover:text-plant-dark-green transition-colors">Browse Plants</a>
            <a href="#how-it-works" className="text-plant-dark hover:text-plant-dark-green transition-colors">How It Works</a>
            <a href="#about" className="text-plant-dark hover:text-plant-dark-green transition-colors">About Us</a>
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
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
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
            </div>
          </div>
        )}
      </header>
      
      <AuthModal 
        isOpen={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
        defaultMode={authMode}
      />
    </>
  );
}
