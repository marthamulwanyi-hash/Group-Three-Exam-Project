import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Save, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

const FACULTIES = [
  "Engineering, Design and Technology",
  "Business and Administration",
  "Law",
  "Education and Arts",
  "Science",
  "Social Sciences",
  "Health Sciences",
  "Theology",
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    program: "",
    year_of_study: "",
    faculty: "",
    bio: "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setForm({
        program: u.program || "",
        year_of_study: u.year_of_study?.toString() || "",
        faculty: u.faculty || "",
        bio: u.bio || "",
      });
      setLoading(false);
    });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    await base44.auth.updateMe({
      program: form.program,
      year_of_study: form.year_of_study ? parseInt(form.year_of_study) : undefined,
      faculty: form.faculty,
      bio: form.bio,
      profile_complete: !!(form.program && form.year_of_study && form.faculty),
    });
    toast.success("Profile updated successfully!");
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account information.</p>
      </div>

      {/* Profile card */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground">{user?.full_name}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">Role: {user?.role || "student"}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Program of Study</Label>
              <Input
                placeholder="e.g. BSc Computer Science"
                value={form.program}
                onChange={(e) => setForm((p) => ({ ...p, program: e.target.value }))}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Year of Study</Label>
              <Select value={form.year_of_study} onValueChange={(v) => setForm((p) => ({ ...p, year_of_study: v }))}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((y) => (
                    <SelectItem key={y} value={y.toString()}>Year {y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Faculty</Label>
            <Select value={form.faculty} onValueChange={(v) => setForm((p) => ({ ...p, faculty: v }))}>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Select faculty" />
              </SelectTrigger>
              <SelectContent>
                {FACULTIES.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              rows={3}
              placeholder="Tell others a bit about yourself..."
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              className="rounded-lg resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg gap-2 text-muted-foreground"
              onClick={() => base44.auth.logout()}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
            <Button type="submit" disabled={saving} className="rounded-lg gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}