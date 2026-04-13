import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import GroupCard from "../components/GroupCard";
import EmptyState from "../components/EmptyState";

const FACULTIES = [
  "All Faculties",
  "Engineering, Design and Technology",
  "Business and Administration",
  "Law",
  "Education and Arts",
  "Science",
  "Social Sciences",
  "Health Sciences",
  "Theology",
];

export default function BrowseGroups() {
  const [groups, setGroups] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [faculty, setFaculty] = useState("All Faculties");

  useEffect(() => {
    base44.entities.StudyGroup.filter({ status: "active" }, "-created_date", 100).then((data) => {
      setGroups(data);
      setFiltered(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = groups;
    if (faculty !== "All Faculties") {
      result = result.filter((g) => g.faculty === faculty);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.name?.toLowerCase().includes(q) ||
          g.course_name?.toLowerCase().includes(q) ||
          g.course_code?.toLowerCase().includes(q) ||
          g.description?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, faculty, groups]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Browse Study Groups</h1>
          <p className="text-muted-foreground mt-1">
            Discover and join groups that match your academic interests.
          </p>
        </div>
        <Link to="/groups/create">
          <Button className="rounded-lg gap-2">
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, course, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-lg"
          />
        </div>
        <Select value={faculty} onValueChange={setFaculty}>
          <SelectTrigger className="w-full sm:w-[280px] rounded-lg">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FACULTIES.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} group{filtered.length !== 1 && "s"} found
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No groups found"
          description={search || faculty !== "All Faculties" ? "Try adjusting your search or filters." : "Be the first to create a study group!"}
          actionLabel="Create Group"
          actionPath="/groups/create"
        />
      )}
    </div>
  );
}