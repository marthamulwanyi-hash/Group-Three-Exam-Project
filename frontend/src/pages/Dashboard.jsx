import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Users, Calendar, BookOpen, Plus, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import GroupCard from "../components/GroupCard";
import SessionCard from "../components/SessionCard";
import StatsCard from "../components/StatsCard";
import EmptyState from "../components/EmptyState";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [myMemberships, setMyMemberships] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentGroups, setRecentGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const currentUser = await base44.auth.me();
    setUser(currentUser);

    const [memberships, recent, sessions] = await Promise.all([
      base44.entities.GroupMembership.filter({ user_email: currentUser.email, status: "active" }),
      base44.entities.StudyGroup.list("-created_date", 6),
      base44.entities.StudySession.filter({ status: "upcoming" }, "-date", 5),
    ]);

    setMyMemberships(memberships);
    setRecentGroups(recent);
    setUpcomingSessions(sessions);

    if (memberships.length > 0) {
      const groupIds = memberships.map((m) => m.group_id);
      const allGroups = await base44.entities.StudyGroup.list("-created_date", 100);
      setMyGroups(allGroups.filter((g) => groupIds.includes(g.id)));
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

  const needsProfile = !user?.program || !user?.year_of_study;

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Welcome back, {user?.full_name?.split(" ")[0] || "Student"} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {needsProfile
              ? "Complete your profile to get personalized recommendations."
              : `${user?.program || ""} • Year ${user?.year_of_study || ""}`}
          </p>
        </div>
        <Link to="/groups/create">
          <Button className="rounded-lg gap-2">
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
        </Link>
      </div>

      {needsProfile && (
        <Link
          to="/profile"
          className="block bg-accent border border-secondary/20 rounded-xl p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-secondary" />
            <div>
              <p className="font-medium text-foreground text-sm">Complete your profile</p>
              <p className="text-xs text-muted-foreground">
                Add your program and year of study to discover relevant groups.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </div>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Users} label="My Groups" value={myGroups.length} color="primary" />
        <StatsCard icon={Calendar} label="Upcoming Sessions" value={upcomingSessions.length} color="secondary" />
        <StatsCard icon={BookOpen} label="Available Groups" value={recentGroups.length} color="chart4" />
        <StatsCard
          icon={Users}
          label="Memberships"
          value={myMemberships.length}
          color="chart5"
        />
      </div>

      {/* My Groups */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-semibold text-foreground">My Study Groups</h2>
          <Link to="/my-groups" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {myGroups.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myGroups.slice(0, 3).map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No groups yet"
            description="Join or create a study group to start collaborating with your peers."
            actionLabel="Browse Groups"
            actionPath="/groups"
          />
        )}
      </section>

      {/* Upcoming Sessions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-semibold text-foreground">Upcoming Sessions</h2>
          <Link to="/sessions" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {upcomingSessions.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {upcomingSessions.slice(0, 4).map((session) => (
              <SessionCard key={session.id} session={session} showGroupName />
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming sessions</p>
          </div>
        )}
      </section>

      {/* Recently Created Groups */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-semibold text-foreground">Recently Created</h2>
          <Link to="/groups" className="text-sm text-primary hover:underline flex items-center gap-1">
            Browse all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentGroups.slice(0, 6).map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      </section>
    </div>
  );
}