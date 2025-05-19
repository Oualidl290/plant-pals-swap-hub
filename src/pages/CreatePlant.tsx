
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { PlantForm } from "@/components/PlantForm";
import { usePlants } from "@/hooks/usePlants";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function CreatePlant() {
  const { id } = useParams<{ id: string }>();
  const { createPlant, updatePlant, getPlant, isCreating, isUpdating } = usePlants();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(!!id);
  
  // If we have an ID, fetch the plant data for editing
  useEffect(() => {
    async function fetchPlantData() {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const plantData = await getPlant(id);
        setInitialData(plantData);
      } catch (error) {
        console.error("Failed to load plant for editing:", error);
        toast({
          title: "Error",
          description: "Could not load plant data for editing. Please try again.",
          variant: "destructive"
        });
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPlantData();
  }, [id, getPlant, toast, navigate]);
  
  const handleSubmit = (data: any) => {
    // Ensure at least one image is provided
    if (!data.image_url && (!data.image_urls || data.image_urls.length === 0)) {
      toast({
        title: "Image required",
        description: "Please upload at least one image of your plant.",
        variant: "destructive"
      });
      return;
    }
    
    // If we only have image_url but no image_urls array, convert it
    if (data.image_url && (!data.image_urls || data.image_urls.length === 0)) {
      data.image_urls = [data.image_url];
    }
    
    if (id) {
      // Update existing plant
      updatePlant({ id, data }, {
        onSuccess: () => {
          navigate('/dashboard');
        }
      });
    } else {
      // Create new plant
      createPlant(data, {
        onSuccess: () => {
          navigate('/dashboard');
        }
      });
    }
  };
  
  const isSubmitting = isCreating || isUpdating;
  const pageTitle = id ? "Edit Plant" : "Add New Plant";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-plant-cream/50">
        <Navbar />
        <main className="container mx-auto px-4 py-6 md:py-10">
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-plant-dark-green" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-plant-cream/50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 md:py-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex items-center">
            <Button 
              variant="ghost" 
              className="flex items-center text-plant-dark-green hover:text-plant-dark-green/90 p-0 mr-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h1 className="text-2xl font-serif font-semibold text-plant-dark-green ml-2">{pageTitle}</h1>
          </div>
          
          <Card className="border-plant-mint/30 p-6">
            <PlantForm 
              initialData={initialData} 
              onSubmit={handleSubmit} 
              isSubmitting={isSubmitting} 
            />
          </Card>
        </div>
      </main>
    </div>
  );
}
