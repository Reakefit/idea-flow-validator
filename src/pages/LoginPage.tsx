
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Checkbox } from "@/components/ui/checkbox";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-insight-dark flex flex-col justify-center items-center p-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-insight-blue opacity-20 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-insight-purple opacity-20 blur-[120px] rounded-full" />
      </div>
      
      <Link to="/" className="mb-8 flex items-center space-x-2">
        <span className="text-3xl font-bold text-gradient">InsightValidator</span>
      </Link>

      <GlassCard className="w-full max-w-md p-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your InsightValidator account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/5 border-white/10"
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="remember" />
            <label htmlFor="remember" className="text-sm">Remember me</label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full bg-gradient-primary hover:opacity-90">Sign in</Button>
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </GlassCard>
    </div>
  );
};

export default LoginPage;
