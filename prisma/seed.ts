import {
  PrismaClient,
  UserRole,
  UserStatus,
  TeamRole,
  JobType,
  DeliverableType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface DemoStaffSeed {
  email: string;
  fullName: string;
  designation: string;
  role: UserRole;
  code: string;
  primaryTeamCode: "TEAM-BRANDING" | "TEAM-ONLINE" | "TEAM-CONTENT";
  teamRole: TeamRole;
  membershipType?: "PRIMARY" | "SHARED" | "REVIEWER";
  isPrimaryTeam?: boolean;
  secondaryTeamCode?: "TEAM-BRANDING" | "TEAM-ONLINE" | "TEAM-CONTENT";
  reportsToEmail?: string;
  secondaryReportsToEmail?: string;
}

async function main() {
  console.log("Starting FMS Database Seeding...");

  // 1. Ensure Default Department exists
  const brandingDept = await prisma.department.upsert({
    where: { code: "GU-BRANDING" },
    update: {},
    create: {
      name: "Branding Department",
      code: "GU-BRANDING",
      description: "Central Branding and Media Production Department",
      isActive: true,
    },
  });
  console.log(`Verified Department: ${brandingDept.name} (${brandingDept.code})`);

  // 2. Create Initial Main Manager Account if configured in environment
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  const adminName = process.env.INITIAL_ADMIN_NAME || "Deepak Juneja";

  let mainManagerId: string | null = null;

  if (adminEmail && adminPassword) {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: {
        fullName: adminName,
        role: UserRole.MAIN_MANAGER,
        status: UserStatus.ACTIVE,
        departmentId: brandingDept.id,
        designation: "Main Manager",
      },
      create: {
        email: adminEmail.toLowerCase(),
        fullName: adminName,
        designation: "Main Manager",
        passwordHash,
        role: UserRole.MAIN_MANAGER,
        status: UserStatus.ACTIVE,
        departmentId: brandingDept.id,
        employeeCode: "FMS-MGR-01",
      },
    });
    mainManagerId = adminUser.id;
    console.log(`Verified Initial Main Manager: ${adminUser.fullName} (${adminUser.email})`);
  } else {
    console.log(
      "Notice: INITIAL_ADMIN_EMAIL or INITIAL_ADMIN_PASSWORD not set. Skipping admin user creation."
    );
  }

  // 3. Seed Standard Workflow Templates
  await prisma.workflowTemplate.upsert({
    where: { id: "tpl-content-creation-default" },
    update: {},
    create: {
      id: "tpl-content-creation-default",
      name: "Standard Content Creation Workflow",
      jobType: JobType.CONTENT_CREATION,
      description: "Default pipeline for shoot, video edit, review, and social publishing",
      isActive: true,
      stages: {
        create: [
          {
            name: "Shoot / Raw Footage",
            stageOrder: 1,
            defaultTargetDays: 1,
            description: "Cinematographer shoot scheduled and raw footage uploaded",
            requiresApproval: false,
          },
          {
            name: "Video Editing",
            stageOrder: 2,
            defaultTargetDays: 2,
            description: "Video editor draft creation and submission",
            requiresApproval: true,
          },
          {
            name: "Approval & Review",
            stageOrder: 3,
            defaultTargetDays: 1,
            description: "Team Lead and Main Manager review and quality sign-off",
            requiresApproval: true,
          },
          {
            name: "Social Media Publishing",
            stageOrder: 4,
            defaultTargetDays: 1,
            description: "Post published to social channels and live link recorded",
            requiresApproval: false,
          },
        ],
      },
    },
  });

  await prisma.workflowTemplate.upsert({
    where: { id: "tpl-branding-production-default" },
    update: {},
    create: {
      id: "tpl-branding-production-default",
      name: "Standard Branding & Production Workflow",
      jobType: JobType.BRANDING_PRODUCTION,
      description:
        "5-stage pipeline for event mockups, Mandeep proofreading, Navneet & Deepak approvals, and venue installation",
      isActive: true,
      stages: {
        create: [
          {
            name: "Content / Mockup",
            stageOrder: 1,
            defaultTargetDays: 1,
            description: "Initial design mockup creation by Designer",
            requiresApproval: true,
          },
          {
            name: "Content Proofreading",
            stageOrder: 2,
            defaultTargetDays: 1,
            description: "Independent proofreading and correction check by Mandeep",
            requiresApproval: true,
          },
          {
            name: "Approved Design",
            stageOrder: 3,
            defaultTargetDays: 2,
            description: "Navneet and Deepak final design sign-off",
            requiresApproval: true,
          },
          {
            name: "Print Orders, Mailing Design, DBMS",
            stageOrder: 4,
            defaultTargetDays: 3,
            description: "Print vendor coordination and database dispatch",
            requiresApproval: false,
          },
          {
            name: "Supply & Install",
            stageOrder: 5,
            defaultTargetDays: 4,
            description: "On-site delivery and physical installation at venue by Fitter",
            requiresApproval: false,
          },
        ],
      },
    },
  });

  // 4. Baseline Credit Rule Placeholders
  const defaultCreditRules = [
    {
      name: "Photo Post Baseline",
      deliverableType: DeliverableType.PHOTO_POST,
      baseCredits: 10,
      weight: 1.0,
      description: "Default placeholder credit rule for Photo Post deliverables",
    },
    {
      name: "Standard Reel Baseline",
      deliverableType: DeliverableType.STANDARD_REEL,
      baseCredits: 25,
      weight: 1.0,
      description: "Default placeholder credit rule for Standard Reel deliverables",
    },
    {
      name: "Scripted Cinematic Reel Baseline",
      deliverableType: DeliverableType.SCRIPTED_CINEMATIC_REEL_VIDEO,
      baseCredits: 50,
      weight: 1.5,
      description: "Default placeholder credit rule for Scripted Cinematic Reel deliverables",
    },
    {
      name: "Event Pack-up Baseline",
      deliverableType: DeliverableType.PACK_UPS,
      baseCredits: 20,
      weight: 1.0,
      description: "Default placeholder credit rule for Event Pack-ups",
    },
  ];

  for (const rule of defaultCreditRules) {
    const existing = await prisma.creditRule.findFirst({
      where: { deliverableType: rule.deliverableType, isActive: true },
    });
    if (!existing) {
      await prisma.creditRule.create({ data: rule });
    }
  }

  // 5. Development-Only Organizational Data (Explicit opt-in via SEED_DEMO_DATA=true, never in production)
  if (process.env.NODE_ENV !== "production" && process.env.SEED_DEMO_DATA === "true") {
    const demoPassword = process.env.DEV_DEMO_PASSWORD;
    if (!demoPassword) {
      console.log(
        "Notice: DEV_DEMO_PASSWORD is not set. Skipping new demo staff password creation."
      );
      return;
    }

    const demoHash = await bcrypt.hash(demoPassword, 12);

    const brandingTeam = await prisma.team.upsert({
      where: { code: "TEAM-BRANDING" },
      update: {
        name: "Offline Branding and Production Team",
        description: "Offline design, proofreading coordination, print, and venue installation",
        isActive: true,
      },
      create: {
        name: "Offline Branding and Production Team",
        code: "TEAM-BRANDING",
        description: "Offline design, proofreading coordination, print, and venue installation",
        departmentId: brandingDept.id,
      },
    });

    const onlineTeam = await prisma.team.upsert({
      where: { code: "TEAM-ONLINE" },
      update: {
        name: "Online Production Team",
        description: "Online video editing, social media publishing, and photography",
        isActive: true,
      },
      create: {
        name: "Online Production Team",
        code: "TEAM-ONLINE",
        description: "Online video editing, social media publishing, and photography",
        departmentId: brandingDept.id,
      },
    });

    const contentTeam = await prisma.team.upsert({
      where: { code: "TEAM-CONTENT" },
      update: {
        name: "Content Strategy and Video Team",
        description: "Content strategy, anchoring, cinematography, and video editing",
        isActive: true,
      },
      create: {
        name: "Content Strategy and Video Team",
        code: "TEAM-CONTENT",
        description: "Content strategy, anchoring, cinematography, and video editing",
        departmentId: brandingDept.id,
      },
    });

    const teamByCode = {
      "TEAM-BRANDING": brandingTeam.id,
      "TEAM-ONLINE": onlineTeam.id,
      "TEAM-CONTENT": contentTeam.id,
    } as const;

    // Ordered so supervisors are upserted before their direct reports
    const staffList: DemoStaffSeed[] = [
      {
        email: "navneet.demo@fms.local",
        fullName: "Navneet",
        designation: "Offline Branding Team Head",
        role: UserRole.DEPUTY_MANAGER,
        code: "DEV-EMP-05",
        primaryTeamCode: "TEAM-BRANDING",
        teamRole: TeamRole.LEAD,
      },
      {
        email: "yash.demo@fms.local",
        fullName: "Yashpreet",
        designation: "Deputy Branding Manager — Online Production",
        role: UserRole.DEPUTY_MANAGER,
        code: "DEV-EMP-01",
        primaryTeamCode: "TEAM-ONLINE",
        teamRole: TeamRole.LEAD,
      },
      {
        email: "ruhi.demo@fms.local",
        fullName: "Ruhi",
        designation: "Anchor and Content Strategist",
        role: UserRole.TEAM_LEAD,
        code: "DEV-EMP-02",
        primaryTeamCode: "TEAM-CONTENT",
        teamRole: TeamRole.LEAD,
      },
      {
        email: "mandeep.demo@fms.local",
        fullName: "Mandeep",
        designation: "Content Writer and Proofreader",
        role: UserRole.EMPLOYEE,
        code: "DEV-EMP-08",
        primaryTeamCode: "TEAM-BRANDING",
        teamRole: TeamRole.SPECIALIST,
        membershipType: "REVIEWER",
        isPrimaryTeam: false,
      },
      {
        email: "vishal.demo@fms.local",
        fullName: "Vishal Tavni",
        designation: "Designer",
        role: UserRole.EMPLOYEE,
        code: "DEV-EMP-06",
        primaryTeamCode: "TEAM-BRANDING",
        teamRole: TeamRole.SPECIALIST,
        reportsToEmail: "navneet.demo@fms.local",
      },
      {
        email: "rajesh.demo@fms.local",
        fullName: "Rajesh",
        designation: "Designer",
        role: UserRole.EMPLOYEE,
        code: "DEV-EMP-07",
        primaryTeamCode: "TEAM-BRANDING",
        teamRole: TeamRole.SPECIALIST,
        reportsToEmail: "navneet.demo@fms.local",
      },
      {
        email: "ankit.demo@fms.local",
        fullName: "Ankit",
        designation: "Fitter",
        role: UserRole.EMPLOYEE,
        code: "DEV-EMP-10",
        primaryTeamCode: "TEAM-BRANDING",
        teamRole: TeamRole.MEMBER,
        reportsToEmail: "navneet.demo@fms.local",
      },
      {
        email: "anup.demo@fms.local",
        fullName: "Anup",
        designation: "Fitter",
        role: UserRole.EMPLOYEE,
        code: "DEV-EMP-11",
        primaryTeamCode: "TEAM-BRANDING",
        teamRole: TeamRole.MEMBER,
        reportsToEmail: "navneet.demo@fms.local",
      },
      {
        email: "kajal.demo@fms.local",
        fullName: "Kajal",
        designation: "Social Media Executive",
        role: UserRole.EMPLOYEE,
        code: "DEV-EMP-09",
        primaryTeamCode: "TEAM-ONLINE",
        teamRole: TeamRole.SPECIALIST,
        reportsToEmail: "yash.demo@fms.local",
      },
      {
        email: "aashish.demo@fms.local",
        fullName: "Aashish",
        designation: "Video Editor",
        role: UserRole.EMPLOYEE,
        code: "DEV-EMP-12",
        primaryTeamCode: "TEAM-ONLINE",
        teamRole: TeamRole.SPECIALIST,
        reportsToEmail: "yash.demo@fms.local",
      },
      {
        email: "hardik.demo@fms.local",
        fullName: "Hardik",
        designation: "Photographer",
        role: UserRole.EMPLOYEE,
        code: "DEV-EMP-13",
        primaryTeamCode: "TEAM-ONLINE",
        teamRole: TeamRole.SPECIALIST,
        membershipType: "PRIMARY",
        isPrimaryTeam: true,
        secondaryTeamCode: "TEAM-CONTENT",
        reportsToEmail: "yash.demo@fms.local",
        secondaryReportsToEmail: "ruhi.demo@fms.local",
      },
      {
        email: "sarvjeet.demo@fms.local",
        fullName: "Sarvjeet",
        designation: "Cinematographer",
        role: UserRole.EMPLOYEE,
        code: "DEV-EMP-14",
        primaryTeamCode: "TEAM-CONTENT",
        teamRole: TeamRole.SPECIALIST,
        reportsToEmail: "ruhi.demo@fms.local",
      },
      {
        email: "vishaltyagi.demo@fms.local",
        fullName: "Vishal Tyagi",
        designation: "Video Editor",
        role: UserRole.EMPLOYEE,
        code: "DEV-EMP-15",
        primaryTeamCode: "TEAM-CONTENT",
        teamRole: TeamRole.SPECIALIST,
        reportsToEmail: "ruhi.demo@fms.local",
      },
    ];

    const seededIdsByEmail = new Map<string, string>();

    for (const emp of staffList) {
      const resolvedManagerId =
        (emp.reportsToEmail ? seededIdsByEmail.get(emp.reportsToEmail) : undefined) ??
        mainManagerId;
      const resolvedSecondaryManagerId = emp.secondaryReportsToEmail
        ? seededIdsByEmail.get(emp.secondaryReportsToEmail) ?? null
        : null;

      // Never overwrite passwordHash on existing users
      const user = await prisma.user.upsert({
        where: { email: emp.email },
        update: {
          fullName: emp.fullName,
          designation: emp.designation,
          role: emp.role,
          status: UserStatus.ACTIVE,
          managerId: resolvedManagerId,
          secondaryManagerId: resolvedSecondaryManagerId,
          departmentId: brandingDept.id,
        },
        create: {
          email: emp.email,
          fullName: emp.fullName,
          designation: emp.designation,
          passwordHash: demoHash,
          role: emp.role,
          status: UserStatus.ACTIVE,
          employeeCode: emp.code,
          managerId: resolvedManagerId,
          secondaryManagerId: resolvedSecondaryManagerId,
          departmentId: brandingDept.id,
        },
      });

      seededIdsByEmail.set(emp.email, user.id);

      const primaryTeamId = teamByCode[emp.primaryTeamCode];
      await prisma.teamMembership.upsert({
        where: { userId_teamId: { userId: user.id, teamId: primaryTeamId } },
        update: {
          teamRole: emp.teamRole,
          membershipType: emp.membershipType ?? "PRIMARY",
          isPrimary: emp.isPrimaryTeam ?? true,
          status: "ACTIVE",
        },
        create: {
          userId: user.id,
          teamId: primaryTeamId,
          teamRole: emp.teamRole,
          membershipType: emp.membershipType ?? "PRIMARY",
          isPrimary: emp.isPrimaryTeam ?? true,
          status: "ACTIVE",
        },
      });

      if (emp.secondaryTeamCode) {
        const secondaryTeamId = teamByCode[emp.secondaryTeamCode];
        await prisma.teamMembership.upsert({
          where: { userId_teamId: { userId: user.id, teamId: secondaryTeamId } },
          update: {
            teamRole: TeamRole.SPECIALIST,
            membershipType: "SHARED",
            isPrimary: false,
            status: "ACTIVE",
          },
          create: {
            userId: user.id,
            teamId: secondaryTeamId,
            teamRole: TeamRole.SPECIALIST,
            membershipType: "SHARED",
            isPrimary: false,
            status: "ACTIVE",
          },
        });
      }
    }

    // Set team heads on the 3 teams
    await prisma.team.update({
      where: { id: brandingTeam.id },
      data: { leadId: seededIdsByEmail.get("navneet.demo@fms.local") ?? null },
    });
    await prisma.team.update({
      where: { id: onlineTeam.id },
      data: { leadId: seededIdsByEmail.get("yash.demo@fms.local") ?? null },
    });
    await prisma.team.update({
      where: { id: contentTeam.id },
      data: { leadId: seededIdsByEmail.get("ruhi.demo@fms.local") ?? null },
    });

    // Deactivate dummy accounts (Arjun & Rohit) while preserving historical job/submission FKs
    const dummyUsers = await prisma.user.findMany({
      where: { email: { in: ["arjun.demo@fms.local", "rohit.demo@fms.local"] } },
      select: { id: true },
    });
    if (dummyUsers.length > 0) {
      const dummyIds = dummyUsers.map((u) => u.id);
      await prisma.user.updateMany({
        where: { id: { in: dummyIds } },
        data: { status: UserStatus.INACTIVE },
      });
      await prisma.teamMembership.updateMany({
        where: { userId: { in: dummyIds } },
        data: { status: "INACTIVE", leftAt: new Date() },
      });
    }

    console.log("Seeded Phase 3 organizational teams and staff accounts.");
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
