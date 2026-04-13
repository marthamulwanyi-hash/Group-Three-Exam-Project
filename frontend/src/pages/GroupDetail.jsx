import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, MapPin, BookOpen, Calendar, Plus, Send, UserMinus, Crown, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SessionCard from "../components/SessionCard";
import CreateSessionDialog from "../components/CreateSessionDialog";
import GroupPostSection from "../components/GroupPostSection";

export default function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [isLeader, setIsLeader] = useState(false);
  const [joining, setJoining] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateSession, setShowCreateSession] = useState(false);

  useEffect(() => {
    loadGroup();
  }, [id]);

  async function loadGroup() {
    const [currentUser, groupData] = await Promise.all([
      base44.auth.me(),
      base44.entities.StudyGroup.filter({ id }),
    ]);
    
    setUser(currentUser);
    const g = groupData[0];
    setGroup(g);

    const [memberData, sessionData] = await Promise.all([
      base44.entities.GroupMembership.filter({ group_id: id, status: "active" }),
      base44.entities.StudySession.filter({ group_id: id }, "-date", 20),
    ]);

    setMembers(memberData);
    setSessions(sessionData);
    setIsMember(memberData.some((m) => m.user_email === currentUser.email));
    setIsLeader(g?.leader_email === currentUser.email);
    setLoading(false);
  }

  async function handleJoin() {
    setJoining(true);
    await base44.entities.GroupMembership.create({
      group_id: id,
      user_email: user.email,
      user_name: user.full_name,
      role: "member",
      status: "active",
    });
    await base44.entities.StudyGroup.update(id, { member_count: (group.member_count || 1) + 1 });
    await loadGroup();
    setJoining(false);
  }

  async function handleRemoveMember(membershipId, memberEmail) {
    await base44.entities.GroupMembership.update(membershipId, { status: "removed" });
    await base44.entities.StudyGroup.update(id, { member_count: Math.max(1, (group.member_count || 1) - 1) });
    await loadGroup();
  }

  async function handleSessionCreated() {
    setShowCreateSession(false);
    const sessionData = await base44.entities.StudySession.filter({ group_id: id }, "-date", 20);
    setSessions(sessionData);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Group not found</p>
        <Link to="/groups" className="text-primary hover:underline text-sm mt-2 inline-block">
          Back to groups
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/groups" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to groups
      </Link>

      {/* Header */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-heading text-2xl font-bold text-foreground">{group.name}</h1>
              <Badge variant="outline" className="text-xs">{group.status}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>{group.course_name}</span>
                {group.course_code && <span className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{group.course_code}</span>}
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{group.member_count || 1} / {group.max_members || 20} members</span>
              </div>
              {group.meeting_location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{group.meeting_location}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{group.description}</p>
            <div className="mt-3 text-xs text-muted-foreground">
              <span className="font-medium">Faculty:</span> {group.faculty} •{" "}
              <span className="font-medium">Leader:</span> {group.leader_name}
            </div>
          </div>

          <div className="flex gap-2">
            {!isMember && (
              <Button onClick={handleJoin} disabled={joining} className="rounded-lg gap-2">
                {joining ? "Joining..." : "Join Group"}
              </Button>
            )}
            {isLeader && (
              <Button variant="outline" onClick={() => setShowCreateSession(true)} className="rounded-lg gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Session
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sessions">
        <TabsList className="rounded-lg">
          <TabsTrigger value="sessions" className="rounded-md gap-2">
            <Calendar className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="members" className="rounded-md gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="discussion" className="rounded-md gap-2">
            <MessageSquare className="h-4 w-4" />
            Discussion
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-4">
          {sessions.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No sessions scheduled yet</p>
              {isLeader && (
                <Button size="sm" variant="outline" className="mt-3 rounded-lg gap-2" onClick={() => setShowCreateSession(true)}>
                  <Plus className="h-3.5 w-3.5" />
                  Schedule first session
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-foreground">
                    {member.user_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{member.user_name}</span>
                      {member.role === "leader" && (
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <Crown className="h-2.5 w-2.5" />
                          Leader
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{member.user_email}</p>
                  </div>
                </div>
                {isLeader && member.role !== "leader" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg gap-1.5"
                    onClick={() => handleRemoveMember(member.id, member.user_email)}
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="discussion" className="mt-4">
          {isMember ? (
            <GroupPostSection groupId={id} user={user} />
          ) : (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Join the group to participate in discussions</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {showCreateSession && (
        <CreateSessionDialog
          groupId={id}
          groupName={group.name}
          userEmail={user.email}
          onClose={() => setShowCreateSession(false)}
          onCreated={handleSessionCreated}
        />
      )}
    </div>
  );
}