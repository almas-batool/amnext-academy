// src/app/(auth)/forgot-password/page.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({ email: z.string().email() });
type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(data: Values) {
    const res  = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) { toast({ title: "Error", description: json.error, variant: "destructive" }); }
    else { setSent(true); }
  }

  if (sent) return (
    <Card className="text-center"><CardContent className="pt-10 pb-8 space-y-4">
      <Mail className="w-16 h-16 text-primary mx-auto" />
      <h2 className="text-xl font-bold">Check your email</h2>
      <p className="text-muted-foreground text-sm">If that email exists, a reset link has been sent.</p>
      <Button asChild variant="outline"><Link href="/login">Back to Login</Link></Button>
    </CardContent></Card>
  );

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Forgot password?</CardTitle>
        <CardDescription>Enter your email and we'll send a reset link</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Send reset link
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm"><Link href="/login" className="text-primary hover:underline">Back to login</Link></CardFooter>
    </Card>
  );
}

