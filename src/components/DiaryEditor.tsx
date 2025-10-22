import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
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

const DiaryEditor = ({ userId, selectedDate, onDateChange }: DiaryEditorProps) => {
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
      const { data, error } = await supabase
        .from("diary_entries")
        .select("*")
        .eq("user_id", userId)
        .eq("entry_date", selectedDate)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setContent(data.content);
        setEntryId(data.id);
        setStarred(data.starred || false);
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
        const { error } = await supabase
          .from("diary_entries")
          .update({ content, starred, updated_at: new Date().toISOString() })
          .eq("id", entryId);

        if (error) throw error;
      } else {
        // Create new entry
        const { data, error } = await supabase
          .from("diary_entries")
          .insert({
            user_id: userId,
            entry_date: selectedDate,
            content,
            starred,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setEntryId(data.id);
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
      const { error } = await supabase
        .from("diary_entries")
        .update({ starred: newStarred })
        .eq("id", entryId);

      if (error) throw error;

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
              className={starred ? "bg-gradient-primary shadow-primary" : ""}
            >
              <Star className={`h-4 w-4 ${starred ? "fill-current" : ""}`} />
            </Button>
            <Button
              onClick={saveEntry}
              disabled={saving || loading}
              size="sm"
              className="bg-gradient-primary shadow-primary hover:opacity-90 transition-opacity"
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
