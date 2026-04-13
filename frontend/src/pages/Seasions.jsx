import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar } from "lucide-react";
import SessionCard from "../components/SessionCard";
import EmptyState from "../components/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    const user = await base44.auth.me();
    const memberships = await base44.entities.GroupMembership.filter({ user_email: user.email, status: "active" });
    const groupIds = memberships.map((m) => m.group_id);

    if (groupIds.length > 0) {
      const allSessions = await base44.entities.StudySession.list("-date", 100);
      setSessions(allSessions.filter((s) => groupIds.includes(s.group_id)));
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

  const upcoming = sessions.filter((s) => s.status === "upcoming");
  const past = sessions.filter((s) => s.status !== "upcoming");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Study Sessions</h1>
        <p className="text-muted-foreground mt-1">All sessions from your study groups.</p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="rounded-lg">
          <TabsTrigger value="upcoming" className="rounded-md">
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="rounded-md">
            Past ({past.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          {upcoming.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {upcoming.map((session) => (
                <SessionCard key={session.id} session={session} showGroupName />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No upcoming sessions"
              description="Sessions will appear here when group leaders schedule them."
            />
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          {past.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {past.map((session) => (
                <SessionCard key={session.id} session={session} showGroupName />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">No past sessions.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}