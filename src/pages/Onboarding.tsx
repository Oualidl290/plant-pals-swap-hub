
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Map, Sprout, Leaf, Check } from "lucide-react";
import { AuthSkeleton } from "@/components/auth/AuthSkeleton";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

// Plant types data
const plantTypes = [
  { id: "cacti", label: "Cacti" },
  { id: "succulents", label: "Succulents" },
  { id: "herbs", label: "Herbs" },
  { id: "flowering", label: "Flowering Plants" },
  { id: "tropical", label: "Tropical Plants" },
  { id: "hanging", label: "Hanging Plants" },
  { id: "bonsai", label: "Bonsai" },
  { id: "fruit", label: "Fruit Plants" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, status, updateProfile } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [selectedPlantTypes, setSelectedPlantTypes] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  
  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      navigate('/auth');
    }
  }, [status, navigate]);

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handlePlantTypeToggle = (type: string) => {
    setSelectedPlantTypes(current => 
      current.includes(type) 
        ? current.filter(t => t !== type) 
        : [...current, type]
    );
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      // Save onboarding data to user profile
      await updateProfile({
        location,
      });

      // You might want to store plant preferences in a separate table
      // For now, we'll just show a success toast
      toast({
        title: "Onboarding completed!",
        description: "Your profile is all set up.",
      });

      // Redirect to the dashboard or home page
      navigate('/');
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      toast({
        title: "Error saving profile",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (status === "loading") {
    return <AuthSkeleton />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F2FCE2]">
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Logo and App Name */}
          <div className="flex justify-center mb-6">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-plant-mint/30 flex items-center justify-center mb-2">
                <Leaf className="h-8 w-8 text-plant-dark-green" />
              </div>
              <span className="font-serif font-bold text-2xl text-plant-dark-green">PlantPals</span>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Complete Your Profile</CardTitle>
              <CardDescription>
                Let's get to know you better so we can help you connect with other plant lovers.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* Step Indicator */}
              <div className="flex justify-between mb-8">
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s}
                    className={`flex flex-col items-center ${s < step ? 'text-plant-dark-green' : s === step ? 'text-plant-dark-green' : 'text-gray-300'}`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center mb-1 ${
                      s < step ? 'bg-plant-dark-green text-white' : s === step ? 'border-2 border-plant-dark-green' : 'border-2 border-gray-300'
                    }`}>
                      {s < step ? <Check className="h-4 w-4" /> : s}
                    </div>
                    <span className="text-xs">
                      {s === 1 ? 'Location' : s === 2 ? 'Plant Interests' : 'First Plant'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Step 1: Location */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <Map className="h-12 w-12 text-plant-dark-green" />
                  </div>
                  <Label htmlFor="location">Where are you located?</Label>
                  <Input 
                    id="location" 
                    placeholder="Enter your city or zip code" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    We use your location to help you find plant swaps in your area.
                  </p>
                </div>
              )}
              
              {/* Step 2: Plant Interests */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <Sprout className="h-12 w-12 text-plant-dark-green" />
                  </div>
                  <Label className="block mb-3">What types of plants are you interested in?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {plantTypes.map((type) => (
                      <div 
                        key={type.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox 
                          id={`plant-${type.id}`}
                          checked={selectedPlantTypes.includes(type.id)}
                          onCheckedChange={() => handlePlantTypeToggle(type.id)}
                        />
                        <label 
                          htmlFor={`plant-${type.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <Label className="block mb-2">Your experience level:</Label>
                    <RadioGroup value={experienceLevel} onValueChange={setExperienceLevel} className="gap-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="beginner" id="beginner" />
                        <Label htmlFor="beginner">Beginner</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="intermediate" id="intermediate" />
                        <Label htmlFor="intermediate">Intermediate</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="advanced" id="advanced" />
                        <Label htmlFor="advanced">Advanced</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}
              
              {/* Step 3: Add First Plant or Explore */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <Leaf className="h-12 w-12 text-plant-dark-green" />
                  </div>
                  <h3 className="text-lg font-medium text-center mb-4">Ready to get started?</h3>
                  
                  <Tabs defaultValue="explore" className="w-full">
                    <TabsList className="grid grid-cols-2 mb-4">
                      <TabsTrigger value="explore">Explore First</TabsTrigger>
                      <TabsTrigger value="add">Add a Plant</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="explore" className="space-y-4">
                      <p className="text-center text-sm">
                        Start by exploring available plants in your area and get familiar with the platform.
                      </p>
                      <div className="flex justify-center">
                        <Button 
                          variant="default" 
                          className="bg-plant-dark-green hover:bg-plant-dark-green/90 w-full"
                          onClick={handleCompleteOnboarding}
                          disabled={loading}
                        >
                          {loading ? "Saving..." : "Start Exploring"}
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="add" className="space-y-4">
                      <p className="text-center text-sm">
                        You'll be able to add your first plant after completing your profile setup.
                      </p>
                      <div className="flex justify-center">
                        <Button 
                          variant="default" 
                          className="bg-plant-dark-green hover:bg-plant-dark-green/90 w-full"
                          onClick={handleCompleteOnboarding}
                          disabled={loading}
                        >
                          {loading ? "Saving..." : "Complete & Add Plant"}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              {step > 1 ? (
                <Button variant="outline" onClick={handlePreviousStep}>
                  Back
                </Button>
              ) : (
                <div></div>
              )}
              
              {step < 3 && (
                <Button 
                  onClick={handleNextStep} 
                  className="bg-plant-dark-green hover:bg-plant-dark-green/90"
                  disabled={(step === 1 && !location)}
                >
                  Continue
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
