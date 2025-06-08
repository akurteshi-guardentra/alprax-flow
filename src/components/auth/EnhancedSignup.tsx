// Enhanced Signup Component with Automatic Stellar Account Setup
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { completeUserOnboarding, resetPassword } from "@/lib/auth-enhanced";
import { FaLock, FaUser, FaEnvelope } from "react-icons/fa";
import { CgSpinner } from "react-icons/cg";

export function EnhancedSignup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }
    
    try {
      setIsLoading(true);
      // This will create user auth + Stellar account + fund with XLM in one step
      await completeUserOnboarding(email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      setError(error instanceof Error ? error.message : "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email first");
      return;
    }
    
    try {
      setIsLoading(true);
      await resetPassword(email);
      // Success message shown by the resetPassword function via toast
    } catch (error) {
      console.error("Password reset error:", error);
      setError(error instanceof Error ? error.message : "Failed to send password reset");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md border-none bg-white/10 backdrop-blur-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-center text-white">
            Create Account
          </CardTitle>
          <p className="text-center text-sm text-white/70">
            Sign up to start sending and receiving payments instantly
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-200 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">
                Confirm Password
              </Label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                className="data-[state=checked]:bg-blue-500"
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none text-white/70 cursor-pointer"
              >
                I agree to the terms and privacy policy
              </label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-500 hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <CgSpinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FaUser className="mr-2 h-4 w-4" />
              )}
              Sign Up
            </Button>
            
            <div className="flex items-center justify-between pt-2">
              <Button 
                type="button" 
                variant="link" 
                className="text-sm text-white/70 hover:text-white p-0"
                onClick={() => navigate("/login")}
              >
                Already have an account?
              </Button>
              
              <Button 
                type="button" 
                variant="link" 
                className="text-sm text-white/70 hover:text-white p-0"
                onClick={handleForgotPassword}
                disabled={isLoading}
              >
                Forgot password?
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
