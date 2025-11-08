import { LoginForm } from '@/components/auth/login-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Logo from '@/components/shared/logo';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center gap-6">
        <Logo />
        <Card className="w-full max-w-sm">
        <CardHeader>
            <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
            <CardDescription>Enter your email below to log in to your account.</CardDescription>
        </CardHeader>
        <CardContent>
            <LoginForm />
        </CardContent>
        </Card>
    </div>
  );
}
