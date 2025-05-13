
import { Leaf, Instagram, Twitter, Facebook } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-plant-dark-green text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and mission */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Leaf className="h-6 w-6" />
              <span className="font-serif font-bold text-xl">PlantPals</span>
            </div>
            <p className="text-plant-mint text-sm mb-4">
              Connecting plant lovers to share, swap, and grow together in local communities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-plant-mint transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-plant-mint transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-plant-mint transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-serif font-medium text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-plant-mint hover:text-white transition-colors">Browse Plants</a></li>
              <li><a href="#" className="text-plant-mint hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#" className="text-plant-mint hover:text-white transition-colors">Plant Care Tips</a></li>
              <li><a href="#" className="text-plant-mint hover:text-white transition-colors">Community Stories</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-serif font-medium text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-plant-mint hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-plant-mint hover:text-white transition-colors">Community Guidelines</a></li>
              <li><a href="#" className="text-plant-mint hover:text-white transition-colors">Safety Tips</a></li>
              <li><a href="#" className="text-plant-mint hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="font-serif font-medium text-lg mb-4">Join Our Newsletter</h3>
            <p className="text-plant-mint text-sm mb-3">
              Get plant care tips and community news delivered to your inbox.
            </p>
            <div className="flex space-x-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="bg-white/10 border-white/20 placeholder:text-white/50 text-white"
              />
              <Button className="bg-plant-gold hover:bg-plant-gold/90 text-plant-dark-green">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-6 text-center text-sm text-plant-mint">
          <p>&copy; {new Date().getFullYear()} PlantPals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
