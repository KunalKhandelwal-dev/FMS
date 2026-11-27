export interface RoleDeliverableItem {
  id: string;
  jobId: string;
  jobTitle: string;
  jobCategory: string | null;
  jobVenue: string | null;
  jobOwnerName: string;
  teamCode: string | null;
  title: string;
  deliverableType: string;
  workflowType: string | null;
  workflowState: string;
  deliveryStatus: string;
  approvalStatus: string;
  proofreadStatus: string;
  targetDate: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  shootAssignedToId: string | null;
  shootAssignedToName: string | null;
  shootScheduledDate: string | null;
  shootActualDate: string | null;
  shootStatus: string;
  rawFootageUrl: string | null;
  editorAssignedToId: string | null;
  editorAssignedToName: string | null;
  editScheduledDate: string | null;
  editActualDate: string | null;
  editStatus: string;
  approvedVideoUrl: string | null;
  postAssignedToId: string | null;
  postAssignedToName: string | null;
  postScheduledDate: string | null;
  postActualDate: string | null;
  postStatus: string;
  socialPlatform: string | null;
  livePostUrl: string | null;
  fitterAssignedToId: string | null;
  fitterAssignedToName: string | null;
  installScheduledDate: string | null;
  installActualDate: string | null;
  installStatus: string;
  installProofUrl: string | null;
  googleDriveUrl: string | null;
  latestRating: number | null;
  latestSubmission: {
    id: string;
    version: number;
    submittedByName: string;
    submittedAt: string;
    submissionUrl: string | null;
    notes: string | null;
  } | null;
  latestReview: {
    status: string;
    reviewerName: string;
    reviewerRole: string;
    publicFeedback: string | null;
    reviewedAt: string;
  } | null;
  stageAssignedByMap: Record<string, string>;
}

export interface StaffOption {
  id: string;
  fullName: string;
  designation: string | null;
}
