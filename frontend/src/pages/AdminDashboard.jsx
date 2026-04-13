import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, BookOpen, Calendar, TrendingUp, Shield } from "lucide-react";
import StatsCard from "../components/StatsCard";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, groups: 0, sessions: 0, posts: 0 });
  const [topCourses, setTopCourses] = useState([]);
  const [recentGroups, setRecentGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadAdmin();
  }, []);

  async function loadAdmin() {
    const user = await base44.auth.me();
    if (user.role !== "admin") {
      navigate("/");
      return;
    }

    const [users, groups, sessions, posts] = await Promise.all([
      base44.entities.User.list("-created_date", 500),
      base44.entities.StudyGroup.list("-created_date", 500),
      base44.entities.StudySession.list("-created_date", 500),
      base44.entities.GroupPost.list("-created_date", 100),
    ]);

    setStats({
      users: users.length,
      groups: groups.length,
      sessions: sessions.length,
      posts: posts.length,
    });

    // Top courses by group count
    const courseMap = {};
    groups.forEach((g) => {
      const key = g.course_name || "Unknown";
      courseMap[key] = (courseMap[key] || 0) + 1;
    });
    const sorted = Object.entries(courseMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    setTopCourses(sorted);
    setRecentGroups(groups.slice(0, 10));
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
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Platform overview and activity monitoring.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Users} label="Total Users" value={stats.users} color="primary" />
        <StatsCard icon={BookOpen} label="Study Groups" value={stats.groups} color="secondary" />
        <StatsCard icon={Calendar} label="Sessions" value={stats.sessions} color="chart4" />
        <StatsCard icon={TrendingUp} label="Posts" value={stats.posts} color="chart5" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Most Active Courses */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Most Active Courses</h2>
          {topCourses.length > 0 ? (
            <div className="space-y-3">
              {topCourses.map(([course, count], i) => (
                <div key={course} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{course}</p>
                    <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(count / topCourses[0][1]) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{count} group{count !== 1 && "s"}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          )}
        </div>

        {/* Recent Groups */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Recent Groups</h2>
          {recentGroups.length > 0 ? (
            <div className="space-y-2">
              {recentGroups.map((group) => (
                <div key={group.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{group.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{group.course_name} • {group.leader_name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-3">{group.member_count || 1} members</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No groups yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}