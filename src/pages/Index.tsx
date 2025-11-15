import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/integrations/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { BookOpen, Lock, Calendar, Shield, NotebookPen } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <NotebookPen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">MyDailyLog</span>
          </div>
          <Button onClick={() => navigate("/auth")} variant="outline" size="sm">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-16 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <BookOpen className="h-4 w-4" />
            Your Personal Journal
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
            Capture Your
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Daily Moments</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            A beautiful, secure space for your thoughts. Write, reflect, and revisit your journey with MyDailyLog.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button 
              onClick={() => navigate("/auth")} 
              size="lg" 
              className="bg-gradient-primary shadow-primary hover:opacity-90 transition-opacity"
            >
              Get Started Free
            </Button>
            <Button onClick={() => navigate("/auth")} variant="outline" size="lg">
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<BookOpen className="h-6 w-6" />}
            title="Rich Text Editor"
            description="Format your entries with bold, italics, lists, and more for expressive journaling."
          />
          <FeatureCard
            icon={<Calendar className="h-6 w-6" />}
            title="Date-Based Organization"
            description="Automatically organized by date. Find any entry quickly and easily."
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6" />}
            title="Secure & Private"
            description="Your entries are encrypted and only accessible by you. Complete privacy guaranteed."
          />
          <FeatureCard
            icon={<Lock className="h-6 w-6" />}
            title="Personal Space"
            description="Your own private sanctuary for thoughts, dreams, and daily reflections."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/50 py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2025 MyDailyLog. Your personal journaling companion.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="rounded-xl bg-card p-6 shadow-soft transition-all hover:shadow-primary">
    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary text-white">
      {icon}
    </div>
    <h3 className="mb-2 text-lg font-semibold">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Index;