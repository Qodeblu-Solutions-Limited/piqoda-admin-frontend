import Logo from "@/components/partials/auth/logo";
import LoginForm from "@/components/partials/auth/login-form";
import Social from "@/components/partials/auth/social";
import Copyright from "@/components/partials/auth/copyright";

interface SignInPageProps {
  params: {
    locale: string;
  };
}

export default function SignInPage({ params }: SignInPageProps) {
  return (
    <div className="min-h-screen bg-muted grid place-items-center px-4 py-10">
      <div className="w-full max-w-xl rounded-[32px] border border-border bg-background/95 p-8 shadow-[0_30px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Logo />
          <div>
            <h1 className="text-3xl font-semibold text-default-900">Sign in to PiQoda Admin</h1>
            <p className="mt-2 text-sm text-default-500">Access your dashboard and manage your workspace.</p>
          </div>
        </div>

        <LoginForm />

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-center gap-3 text-sm text-default-500">
            <span>Continue with social login</span>
          </div>
          <Social locale={params.locale} />
        </div>

        <div className="mt-10 text-center text-sm text-default-500">
          <Copyright />
        </div>
      </div>
    </div>
  );
}
