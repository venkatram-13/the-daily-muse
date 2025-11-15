import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "@/integrations/firebase/client";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import DiaryEditor from "@/components/DiaryEditor";
import { Button } from "@/components/ui/button";
import { Star, Pencil, List } from "lucide-react";
import { toLocalISOString } from "@/lib/date-utils";
import { Label } from "@/components/ui/label";
import { TodoList } from "../components/TodoList";
import { Switch } from "@/components/ui/switch";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    searchParams.get("date") || toLocalISOString(new Date())
  );
  const [showTodoList, setShowTodoList] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      setSelectedDate(dateParam);
    }
  }, [searchParams]);

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

      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              {showTodoList ? (
                <>
                  <List className="mr-2 text-blue-500" />
                  Todo List
                </>
              ) : (
                <>
                  <Pencil className="mr-2 text-blue-500" />
                  Today's Entry
                </>
              )}
            </h2>
            <p className="text-sm text-muted-foreground">
              {showTodoList
                ? "Manage your tasks"
                : "Write your thoughts for today"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="view-toggle"
                checked={showTodoList}
                onCheckedChange={setShowTodoList}
              />
              <Label htmlFor="view-toggle">Show Todo List</Label>
            </div>
            <Button
              onClick={() => navigate("/starred")}
              variant="outline"
              className="gap-2"
            >
              <Star className="h-4 w-4" />
              Starred Entries
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-4xl">
          {showTodoList ? (
            <TodoList user={user} />
          ) : (
            <DiaryEditor
              userId={user.uid}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
