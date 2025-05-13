
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Leaf } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onOpenChange, defaultMode }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultMode);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex items-center">
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-plant-mint/30 flex items-center justify-center">
            <Leaf className="h-6 w-6 text-plant-dark-green" />
          </div>
          <DialogTitle className="text-center font-serif text-xl">
            {activeTab === 'signin' ? 'Welcome Back' : 'Join PlantPals'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="hello@example.com" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a 
                  href="#" 
                  className="text-xs text-plant-dark-green hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <Input id="password" type="password" />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm">Remember me</Label>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-plant-dark-green hover:bg-plant-dark-green/90"
            >
              Sign In
            </Button>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email_signup">Email</Label>
              <Input id="email_signup" type="email" placeholder="hello@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_signup">Password</Label>
              <Input id="password_signup" type="password" />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <a href="#" className="text-plant-dark-green hover:underline">
                  terms of service
                </a>{" "}
                and{" "}
                <a href="#" className="text-plant-dark-green hover:underline">
                  privacy policy
                </a>
              </Label>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-plant-dark-green hover:bg-plant-dark-green/90"
            >
              Create Account
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
