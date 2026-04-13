import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

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

export default function CreateGroup() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    course_name: "",
    course_code: "",
    faculty: "",
    description: "",
    meeting_location: "",
    meeting_type: "physical",
    max_members: 20,
  });

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const group = await base44.entities.StudyGroup.create({
      ...form,
      leader_email: user.email,
      leader_name: user.full_name,
      member_count: 1,
      status: "active",
    });

    await base44.entities.GroupMembership.create({
      group_id: group.id,
      user_email: user.email,
      user_name: user.full_name,
      role: "leader",
      status: "active",
    });

    navigate(`/groups/${group.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/groups" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to groups
      </Link>

      <div className="bg-card rounded-xl border border-border p-6 lg:p-8">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-1">Create Study Group</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Set up a new group and invite your peers to study together.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Group Name *</Label>
              <Input
                required
                placeholder="e.g. Data Structures Study Crew"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Course Name *</Label>
              <Input
                required
                placeholder="e.g. Data Structures & Algorithms"
                value={form.course_name}
                onChange={(e) => handleChange("course_name", e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Course Code</Label>
              <Input
                placeholder="e.g. CSC 2100"
                value={form.course_code}
                onChange={(e) => handleChange("course_code", e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Faculty *</Label>
              <Select value={form.faculty} onValueChange={(v) => handleChange("faculty", v)}>
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
          </div>

          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea
              required
              rows={3}
              placeholder="What will this group focus on?"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="rounded-lg resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Meeting Type</Label>
              <Select value={form.meeting_type} onValueChange={(v) => handleChange("meeting_type", v)}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Physical</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Meeting Location</Label>
              <Input
                placeholder="e.g. Library Room 3"
                value={form.meeting_location}
                onChange={(e) => handleChange("meeting_location", e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Members</Label>
              <Input
                type="number"
                min={2}
                max={100}
                value={form.max_members}
                onChange={(e) => handleChange("max_members", parseInt(e.target.value))}
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link to="/groups">
              <Button type="button" variant="outline" className="rounded-lg">Cancel</Button>
            </Link>
            <Button type="submit" disabled={saving || !form.name || !form.course_name || !form.faculty || !form.description} className="rounded-lg gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Group
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}