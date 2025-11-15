import { useEffect, useState, useRef } from "react";
import { db } from "@/integrations/firebase/client";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Loader2, Star } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toLocalISOString } from "@/lib/date-utils";

interface DiaryEditorProps {
  userId: string;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const DiaryEditor = ({
  userId,
  selectedDate,
  onDateChange,
}: DiaryEditorProps) => {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [starred, setStarred] = useState(false);
  const quillRef = useRef<ReactQuill>(null);

  // Load entry for selected date
  useEffect(() => {
    loadEntry();
  }, [selectedDate, userId]);

  const loadEntry = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "users", userId, "diary_entries"),
        where("entryDate", "==", selectedDate)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const entryDoc = querySnapshot.docs[0];
        setContent(entryDoc.data().content);
        setEntryId(entryDoc.id);
        setStarred(entryDoc.data().starred || false);
      } else {
        setContent("");
        setEntryId(null);
        setStarred(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async () => {
    if (!content.trim()) {
      toast({
        title: "Empty entry",
        description: "Please write something before saving",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (entryId) {
        // Update existing entry
        const entryRef = doc(db, "users", userId, "diary_entries", entryId);
        await updateDoc(entryRef, {
          content,
          starred,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new entry
        const docRef = await addDoc(collection(db, "users", userId, "diary_entries"), {
          entryDate: selectedDate,
          content,
          starred,
          createdAt: serverTimestamp(),
        });
        setEntryId(docRef.id);
      }

      toast({
        title: "Saved!",
        description: "Your entry has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save entry",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleStar = async () => {
    if (!entryId) {
      toast({
        title: "Save first",
        description: "Please save your entry before starring it",
        variant: "destructive",
      });
      return;
    }

    const newStarred = !starred;
    setStarred(newStarred);

    try {
      const entryRef = doc(db, "users", userId, "diary_entries", entryId);
      await updateDoc(entryRef, { starred: newStarred });

      toast({
        title: newStarred ? "Starred!" : "Unstarred",
        description: newStarred
          ? "Entry added to your favorites"
          : "Entry removed from favorites",
      });
    } catch (error: any) {
      setStarred(!newStarred); // Revert on error
      toast({
        title: "Error",
        description: error.message || "Failed to update star status",
        variant: "destructive",
      });
    }
  };

  const handleDateChange = (date: Date) => {
    onDateChange(toLocalISOString(date));
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center gap-2">
            <DatePicker
              date={new Date(selectedDate + "T00:00:00")}
              onDateChange={handleDateChange}
            />
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleStar}
              disabled={!entryId}
              variant={starred ? "default" : "outline"}
              size="sm"
              className={`w-full sm:w-auto ${starred ? "bg-gradient-primary shadow-primary" : ""}`}>
              <Star className={`h-4 w-4 ${starred ? "fill-current" : ""}`} />
            </Button>
            <Button
              onClick={saveEntry}
              disabled={saving || loading}
              size="sm"
              className="w-full sm:w-auto bg-gradient-primary shadow-primary hover:opacity-90 transition-opacity"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="editor-container">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            placeholder="What's on your mind today?"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DiaryEditor;
