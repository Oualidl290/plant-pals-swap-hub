
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Leaf } from "lucide-react";
import { AuthSkeleton } from "@/components/auth/AuthSkeleton";
import { useEffect } from "react";

// Form schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

const magicLinkSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
type MagicLinkFormValues = z.infer<typeof magicLinkSchema>;

export default function Auth() {
  const navigate = useNavigate();
  const { status, user, signUp, signIn, signInWithMagicLink, signInWithGoogle, resetPassword } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Form setup
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });
  
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", firstName: "", lastName: "" }
  });
  
  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" }
  });
  
  const magicLinkForm = useForm<MagicLinkFormValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" }
  });

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && user) {
      navigate('/onboarding');
    }
  }, [status, user, navigate]);

  // Handle forms submission
  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { success, error } = await signIn(values.email, values.password);
      if (success) {
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      const { success } = await signUp(values.email, values.password, {
        first_name: values.firstName,
        last_name: values.lastName
      });
      
      if (success) {
        toast({
          title: "Account created",
          description: "Please check your email for a verification link."
        });
        setActiveTab("login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await resetPassword(values.email);
      forgotPasswordForm.reset();
      setActiveTab("login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (values: MagicLinkFormValues) => {
    setIsLoading(true);
    try {
      await signInWithMagicLink(values.email);
      magicLinkForm.reset();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google signin error:", error);
      setIsLoading(false);
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
            <a href="/" className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-plant-mint/30 flex items-center justify-center mb-2">
                <Leaf className="h-8 w-8 text-plant-dark-green" />
              </div>
              <span className="font-serif font-bold text-2xl text-plant-dark-green">PlantPals</span>
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="hello@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Password</FormLabel>
                            <button 
                              type="button" 
                              onClick={() => setActiveTab("forgot-password")}
                              className="text-xs text-plant-dark-green hover:underline"
                            >
                              Forgot password?
                            </button>
                          </div>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-plant-dark-green hover:bg-plant-dark-green/90"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab("magic-link")}
                    disabled={isLoading}
                  >
                    Magic Link
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4 mr-2" />
                    Google
                  </Button>
                </div>
              </TabsContent>
              
              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={signupForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="hello@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-plant-dark-green hover:bg-plant-dark-green/90"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              {/* Forgot Password Tab */}
              <TabsContent value="forgot-password" className="space-y-4">
                <div className="mb-4 text-center">
                  <h3 className="font-serif text-lg font-medium">Reset Your Password</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your email and we'll send you a link to reset your password
                  </p>
                </div>
                <Form {...forgotPasswordForm}>
                  <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                    <FormField
                      control={forgotPasswordForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="hello@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setActiveTab("login")} 
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 bg-plant-dark-green hover:bg-plant-dark-green/90"
                        disabled={isLoading}
                      >
                        {isLoading ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              
              {/* Magic Link Tab */}
              <TabsContent value="magic-link" className="space-y-4">
                <div className="mb-4 text-center">
                  <h3 className="font-serif text-lg font-medium">Email Magic Link</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your email and we'll send you a magic link to sign in
                  </p>
                </div>
                <Form {...magicLinkForm}>
                  <form onSubmit={magicLinkForm.handleSubmit(handleMagicLink)} className="space-y-4">
                    <FormField
                      control={magicLinkForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="hello@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setActiveTab("login")} 
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 bg-plant-dark-green hover:bg-plant-dark-green/90"
                        disabled={isLoading}
                      >
                        {isLoading ? "Sending..." : "Send Magic Link"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
