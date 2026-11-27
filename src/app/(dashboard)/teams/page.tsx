import { redirect } from "next/navigation";
import { getCurrentUser, requirePermission } from "@/server/auth/guards";
import { teamRepository } from "@/server/repositories/teamRepository";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  requirePermission(user, "analytics:team_view");

  const teams = await teamRepository.listByDepartment();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Teams"
        description="Operational teams and member assignments loaded from the database."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>{team.name}</CardTitle>
                <Badge variant="indigo">{team.memberships.length} Members</Badge>
              </div>
              {team.description && <CardDescription>{team.description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {team.memberships.length === 0 ? (
                <p className="text-[#64748B]">No members assigned.</p>
              ) : (
                <ul className="divide-y divide-[#E5E7EB]">
                  {team.memberships.map((m) => (
                    <li key={m.id} className="py-2 flex justify-between">
                      <span className="font-medium text-[#202638]">{m.user.fullName}</span>
                      <span className="text-[#64748B]">{m.teamRole}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
