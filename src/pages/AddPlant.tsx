
import { Navbar } from "@/components/Navbar";
import { PlantForm } from "@/components/PlantForm";
import { usePlants } from "@/hooks/usePlants";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function AddPlant() {
  const { createPlant, isCreating } = usePlants();
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
    
    createPlant(data, {
      onSuccess: () => {
        navigate('/dashboard');
      }
    });
  };

  return (
    <div className="min-h-screen bg-plant-cream/50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 md:py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-plant-dark-green mb-6">Add New Plant</h1>
          
          <div className="bg-white rounded-lg border border-plant-mint/30 p-6">
            <PlantForm onSubmit={handleSubmit} isSubmitting={isCreating} />
          </div>
        </div>
      </main>
    </div>
  );
}
