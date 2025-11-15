import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/integrations/firebase/client";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Calendar, ArrowLeft } from "lucide-react";

interface StarredEntry {
  id: string;
  entryDate: string;
  content: string;
}

const StarredEntries = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<StarredEntry[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        loadStarredEntries(user.uid);
      } else {
        navigate("/auth");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadStarredEntries = async (userId: string) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "users", userId, "diary_entries"),
        where("starred", "==", true)
      );
      const querySnapshot = await getDocs(q);
      const starredEntries = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<StarredEntry, 'id'>),
      }));
      
      // Sort entries by date on the client-side
      starredEntries.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());

      setEntries(starredEntries);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load starred entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed out",
        description: "Come back soon!",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPreview = (content: string) => {
    const div = document.createElement("div");
    div.innerHTML = content;
    const text = div.textContent || div.innerText || "";
    return text.slice(0, 200) + (text.length > 200 ? "..." : "");
  };

  const viewEntry = (date: string) => {
    navigate(`/dashboard?date=${date}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Header user={user} onSignOut={handleSignOut} />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          {/* <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button> */}
          
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-primary">
              <Star className="h-6 w-6 fill-current" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Starred Entries</h1>
              <p className="text-muted-foreground">Your favorite moments</p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl">
          {entries.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="py-16 text-center">
                <Star className="mx-auto h-16 w-16 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No starred entries yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Star your favorite entries to find them easily here
                </p>
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="mt-6 bg-gradient-primary shadow-primary hover:opacity-90 transition-opacity"
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <Card
                  key={entry.id}
                  className="shadow-soft transition-all hover:shadow-primary cursor-pointer"
                  onClick={() => viewEntry(entry.entryDate)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span>{formatDate(entry.entryDate)}</span>
                      </div>
                      <Star className="h-5 w-5 fill-primary text-primary" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {getPreview(entry.content)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StarredEntries;
