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
            description: "Cameraman shoot scheduled and raw footage uploaded",
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
            description: "Manager/Deputy review and quality sign-off",
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
        "5-stage pipeline for event mockups, approved designs, print orders, supply & install, and pack-ups",
      isActive: true,
      stages: {
        create: [
          {
            name: "Content / Mockup",
            stageOrder: 1,
            defaultTargetDays: 1,
            description: "Initial content and design mockup creation",
            requiresApproval: true,
          },
          {
            name: "Approved Design",
            stageOrder: 2,
            defaultTargetDays: 2,
            description: "Final design sign-off by job owner",
            requiresApproval: true,
          },
          {
            name: "Print Orders, Mailing Design, DBMS",
            stageOrder: 3,
            defaultTargetDays: 3,
            description: "Print vendor coordination and database dispatch",
            requiresApproval: false,
          },
          {
            name: "Supply & Install",
            stageOrder: 4,
            defaultTargetDays: 4,
            description: "On-site delivery and physical installation at venue",
            requiresApproval: false,
          },
          {
            name: "Pack-ups",
            stageOrder: 5,
            defaultTargetDays: 4,
            description: "Post-event packup, inventory return, and credit allocation",
            requiresApproval: true,
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

  // 5. Development-Only Demo Data (Explicit opt-in via SEED_DEMO_DATA=true, never in production)
  if (process.env.NODE_ENV !== "production" && process.env.SEED_DEMO_DATA === "true") {
    const demoPassword = process.env.DEV_DEMO_PASSWORD || "DemoPass123!";
    const demoHash = await bcrypt.hash(demoPassword, 10);

    const contentTeam = await prisma.team.upsert({
      where: { code: "TEAM-CONTENT" },
      update: {},
      create: {
        name: "Content Creation Team",
        code: "TEAM-CONTENT",
        description: "Development demo team for shoot, video edit, and social content",
        departmentId: brandingDept.id,
      },
    });

    const brandingTeam = await prisma.team.upsert({
      where: { code: "TEAM-BRANDING" },
      update: {},
      create: {
        name: "Branding & Production Team",
        code: "TEAM-BRANDING",
        description: "Development demo team for event mockups, print, and installations",
        departmentId: brandingDept.id,
      },
    });

    const demoEmployees = [
      {
        email: "yash.demo@fms.local",
        fullName: "Yash",
        designation: "Team Lead — Content Creation",
        role: UserRole.TEAM_LEAD,
        code: "DEV-EMP-01",
        teamId: contentTeam.id,
        teamRole: TeamRole.LEAD,
      },
      {
        email: "ruhi.demo@fms.local",
        fullName: "Ruhi",
        designation: "Team Lead — Content Creation",
        role: UserRole.TEAM_LEAD,
        code: "DEV-EMP-02",
        teamId: contentTeam.id,
        teamRole: TeamRole.LEAD,
      },
      {
        email: "arjun.demo@fms.local",
        fullName: "Arjun",
        designation: "Cameraman",
        role: UserRole.EMPLOYEE,
        code: "DEV-EMP-03",
        teamId: contentTeam.id,
        teamRole: TeamRole.SPECIALIST,
      },
      {
        email: "rohit.demo@fms.local",
        fullName: "Rohit",
        designation: "Video Editor",
        role: UserRole.EMPLOYEE,
        code: "DEV-EMP-04",
        teamId: contentTeam.id,
        teamRole: TeamRole.SPECIALIST,
      },
      {
        email: "navneet.demo@fms.local",
        fullName: "Navneet",
        designation: "Branding Coordinator",
        role: UserRole.DEPUTY_MANAGER,
        code: "DEV-EMP-05",
        teamId: brandingTeam.id,
        teamRole: TeamRole.LEAD,
      },
      {
        email: "vishal.demo@fms.local",
        fullName: "Vishal",
        designation: "Production Executive",
        role: UserRole.EMPLOYEE,
        code: "DEV-EMP-06",
        teamId: brandingTeam.id,
        teamRole: TeamRole.MEMBER,
      },
      {
        email: "rajesh.demo@fms.local",
        fullName: "Rajesh",
        designation: "Production Executive",
        role: UserRole.EMPLOYEE,
        code: "DEV-EMP-07",
        teamId: brandingTeam.id,
        teamRole: TeamRole.MEMBER,
      },
      {
        email: "mandeep.demo@fms.local",
        fullName: "Mandeep",
        designation: "Content & Mockup Designer",
        role: UserRole.EMPLOYEE,
        code: "DEV-EMP-08",
        teamId: brandingTeam.id,
        teamRole: TeamRole.SPECIALIST,
      },
      {
        email: "kajal.demo@fms.local",
        fullName: "Kajal",
        designation: "Social Media Executive",
        role: UserRole.EMPLOYEE,
        code: "DEV-EMP-09",
        teamId: contentTeam.id,
        teamRole: TeamRole.SPECIALIST,
        reportsToEmail: "yash.demo@fms.local",
      },
    ];

    const seededIdsByEmail = new Map<string, string>();

    for (const emp of demoEmployees) {
      const resolvedManagerId =
        (emp.reportsToEmail ? seededIdsByEmail.get(emp.reportsToEmail) : undefined) ??
        mainManagerId;

      const user = await prisma.user.upsert({
        where: { email: emp.email },
        update: {
          fullName: emp.fullName,
          designation: emp.designation,
          role: emp.role,
          managerId: resolvedManagerId,
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
          departmentId: brandingDept.id,
        },
      });

      seededIdsByEmail.set(emp.email, user.id);

      await prisma.teamMembership.upsert({
        where: { userId_teamId: { userId: user.id, teamId: emp.teamId } },
        update: { teamRole: emp.teamRole },
        create: { userId: user.id, teamId: emp.teamId, teamRole: emp.teamRole },
      });
    }

    console.log("Seeded development-only demo teams and staff accounts.");
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
