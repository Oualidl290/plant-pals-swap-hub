
import { Navbar } from "@/components/Navbar";
import { PlantForm } from "@/components/PlantForm";
import { usePlants } from "@/hooks/usePlants";
import { useNavigate } from "react-router-dom";

export default function AddPlant() {
  const { createPlant, isCreating } = usePlants();
  const navigate = useNavigate();
  
  const handleSubmit = (data: any) => {
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
