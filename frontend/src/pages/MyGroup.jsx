import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GroupCard from "../components/GroupCard";
import EmptyState from "../components/EmptyState";

export default function MyGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyGroups();
  }, []);

  async function loadMyGroups() {
    const user = await base44.auth.me();
    const memberships = await base44.entities.GroupMembership.filter({ user_email: user.email, status: "active" });

    if (memberships.length > 0) {
      const allGroups = await base44.entities.StudyGroup.list("-created_date", 100);
      const myGroupIds = memberships.map((m) => m.group_id);
      setGroups(allGroups.filter((g) => myGroupIds.includes(g.id)));
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">My Study Groups</h1>
          <p className="text-muted-foreground mt-1">Groups you've joined or created.</p>
        </div>
        <Link to="/groups/create">
          <Button className="rounded-lg gap-2">
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
        </Link>
      </div>

      {groups.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No groups yet"
          description="You haven't joined any study groups. Browse available groups or create your own."
          actionLabel="Browse Groups"
          actionPath="/groups"
        />
      )}
    </div>
  );
}