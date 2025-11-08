import { SignupForm } from '@/components/auth/signup-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Logo from '@/components/shared/logo';

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center gap-6">
        <Logo />
        <Card className="w-full max-w-sm">
        <CardHeader>
            <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
            <CardDescription>Enter your details to get started with OptiStock.</CardDescription>
        </CardHeader>
        <CardContent>
            <SignupForm />
        </CardContent>
        </Card>
    </div>
  );
}
