import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Save, Loader2 } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

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
      } else {
        setContent("");
        setEntryId(null);
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
          .update({ content, updated_at: new Date().toISOString() })
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {formatDate(selectedDate)}
          </CardTitle>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <Button
              onClick={saveEntry}
              disabled={saving || loading}
              size="sm"
              className="bg-gradient-warm shadow-warm hover:opacity-90 transition-opacity"
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
      <CardContent>
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="min-h-[400px]">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              placeholder="What's on your mind today?"
              className="h-96"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiaryEditor;
