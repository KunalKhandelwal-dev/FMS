import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/guards";
import { getRoleDashboardData } from "@/server/services/dashboardService";
import { calculateDeliveryStatus } from "@/lib/dates";
import type { RoleDeliverableItem } from "@/features/dashboard/roles/DashboardTypes";
import {
  DeepakDashboardView,
  NavneetDashboardView,
  RuhiDashboardView,
  YashpreetDashboardView,
} from "@/features/dashboard/roles/ManagerRoleDashboards";
import {
  CinematographerDashboard,
  DesignerDashboard,
  FitterDashboard,
  MandeepProofreaderDashboard,
  PhotographerDashboard,
  SocialMediaDashboard,
  VideoEditorDashboard,
} from "@/features/dashboard/roles/SpecialistRoleDashboards";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const firstName = user.fullName.split(" ")[0] || user.fullName;
  const data = await getRoleDashboardData(user);

  const items: RoleDeliverableItem[] = data.deliverables.map((d) => {
    const stageAssignedByMap: Record<string, string> = {};
    for (const s of d.stages) {
      if (s.stageKey && s.assignedBy?.fullName) {
        stageAssignedByMap[s.stageKey] = s.assignedBy.fullName;
      }
      if (s.stageKey && s.assignedById && !stageAssignedByMap[`${s.stageKey}_ID`]) {
        stageAssignedByMap[`${s.stageKey}_ID`] = s.assignedById;
      }
    }

    const latestSub = d.submissions[0];
    const latestRev = d.reviews[0];

    return {
      id: d.id,
      jobId: d.job.id,
      jobTitle: d.job.title,
      jobCategory: d.job.category,
      jobVenue: d.job.venue,
      jobOwnerName: d.job.owner?.fullName || "Unassigned",
      teamCode: d.job.team?.code ?? null,
      title: d.title,
      deliverableType: d.deliverableType,
      workflowType: d.workflowType,
      workflowState: d.workflowState,
      deliveryStatus: calculateDeliveryStatus({
        targetDate: d.targetDate,
        firstSubmittedAt: d.firstSubmittedAt,
        isCancelled: d.workflowState === "CANCELLED",
      }),
      approvalStatus: d.approvalStatus,
      proofreadStatus: d.proofreadStatus,
      targetDate: d.targetDate ? d.targetDate.toISOString() : null,
      assignedToId: d.assignedToId,
      assignedToName: d.assignedTo?.fullName ?? null,
      shootAssignedToId: d.shootAssignedToId,
      shootAssignedToName: d.shootAssignedTo?.fullName ?? null,
      shootScheduledDate: d.shootScheduledDate ? d.shootScheduledDate.toISOString() : null,
      shootActualDate: d.shootActualDate ? d.shootActualDate.toISOString() : null,
      shootStatus: d.shootStatus,
      rawFootageUrl: d.rawFootageUrl,
      editorAssignedToId: d.editorAssignedToId,
      editorAssignedToName: d.editorAssignedTo?.fullName ?? null,
      editScheduledDate: d.editScheduledDate ? d.editScheduledDate.toISOString() : null,
      editActualDate: d.editActualDate ? d.editActualDate.toISOString() : null,
      editStatus: d.editStatus,
      approvedVideoUrl: d.approvedVideoUrl,
      postAssignedToId: d.postAssignedToId,
      postAssignedToName: d.postAssignedTo?.fullName ?? null,
      postScheduledDate: d.postScheduledDate ? d.postScheduledDate.toISOString() : null,
      postActualDate: d.postActualDate ? d.postActualDate.toISOString() : null,
      postStatus: d.postStatus,
      socialPlatform: d.socialPlatform,
      livePostUrl: d.livePostUrl,
      fitterAssignedToId: d.fitterAssignedToId,
      fitterAssignedToName: d.fitterAssignedTo?.fullName ?? null,
      installScheduledDate: d.installScheduledDate ? d.installScheduledDate.toISOString() : null,
      installActualDate: d.installActualDate ? d.installActualDate.toISOString() : null,
      installStatus: d.installStatus,
      installProofUrl: d.installProofUrl,
      googleDriveUrl: d.googleDriveUrl,
      latestRating: d.ratings[0]?.stars ?? null,
      latestSubmission: latestSub
        ? {
            id: latestSub.id,
            version: latestSub.version,
            submittedByName: latestSub.submittedBy.fullName,
            submittedAt: latestSub.submittedAt.toISOString(),
            submissionUrl: latestSub.submissionUrl,
            notes: latestSub.notes,
          }
        : null,
      latestReview: latestRev
        ? {
            status: latestRev.status,
            reviewerName: latestRev.reviewer.fullName,
            reviewerRole: latestRev.reviewer.role,
            publicFeedback: latestRev.publicFeedback,
            reviewedAt: latestRev.reviewedAt.toISOString(),
          }
        : null,
      stageAssignedByMap,
    };
  });

  switch (data.persona) {
    case "DEEPAK":
      return (
        <DeepakDashboardView
          firstName={firstName}
          deliverables={items}
          recentLogs={(data.recentLogs || []).map((l) => ({
            id: l.id,
            action: l.action,
            entityType: l.entityType,
            actorName: l.user?.fullName || "System",
            jobTitle: l.job?.title ?? null,
            createdAt: l.createdAt.toISOString(),
          }))}
          staff={(data.activeStaff || []).map((s) => ({
            id: s.id,
            fullName: s.fullName,
            designation: s.designation,
            role: s.role,
            teamNames: s.teamMemberships.map((m) => m.team.name),
          }))}
        />
      );
    case "NAVNEET":
      return (
        <NavneetDashboardView
          firstName={firstName}
          deliverables={items}
          teamMembers={data.teamMembers || []}
        />
      );
    case "YASHPREET":
      return (
        <YashpreetDashboardView
          firstName={firstName}
          userId={user.id}
          deliverables={items}
          teamMembers={data.teamMembers || []}
        />
      );
    case "RUHI":
      return (
        <RuhiDashboardView
          firstName={firstName}
          userId={user.id}
          deliverables={items}
          teamMembers={data.teamMembers || []}
        />
      );
    case "MANDEEP":
      return <MandeepProofreaderDashboard firstName={firstName} deliverables={items} />;
    case "DESIGNER":
      return <DesignerDashboard firstName={firstName} deliverables={items} />;
    case "FITTER":
      return <FitterDashboard firstName={firstName} deliverables={items} />;
    case "PHOTOGRAPHER":
      return <PhotographerDashboard firstName={firstName} deliverables={items} />;
    case "CINEMATOGRAPHER":
      return <CinematographerDashboard firstName={firstName} deliverables={items} />;
    case "VIDEO_EDITOR":
      return <VideoEditorDashboard firstName={firstName} deliverables={items} />;
    case "SOCIAL_MEDIA":
      return <SocialMediaDashboard firstName={firstName} deliverables={items} />;
  }
}
