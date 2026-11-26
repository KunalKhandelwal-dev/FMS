import { PrismaClient, UserRole, UserStatus, JobType, DeliverableType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting FMS Database Seeding...");

  // 1. Ensure Default Department exists (Geeta University - Branding Department)
  const brandingDept = await prisma.department.upsert({
    where: { code: "GU-BRANDING" },
    update: {},
    create: {
      name: "Branding Department",
      code: "GU-BRANDING",
      description: "Geeta University Central Branding and Media Production Department",
      isActive: true,
    },
  });
  console.log(`Verified Department: ${brandingDept.name} (${brandingDept.code})`);

  // 2. Create Initial Administrator Account if configured in environment
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  const adminName = process.env.INITIAL_ADMIN_NAME || "System Administrator";

  if (adminEmail && adminPassword) {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        role: UserRole.MAIN_MANAGER,
        status: UserStatus.ACTIVE,
        departmentId: brandingDept.id,
      },
      create: {
        email: adminEmail,
        fullName: adminName,
        passwordHash,
        role: UserRole.MAIN_MANAGER,
        status: UserStatus.ACTIVE,
        departmentId: brandingDept.id,
        employeeCode: "GU-ADMIN-01",
      },
    });
    console.log(`Verified Initial Main Manager / Administrator: ${adminUser.email}`);
  } else {
    console.log(
      "Notice: INITIAL_ADMIN_EMAIL or INITIAL_ADMIN_PASSWORD not set. Skipping admin user creation."
    );
  }

  // 3. Seed Standard Workflow Templates (Content Creation & Branding Production)
  const contentTemplate = await prisma.workflowTemplate.upsert({
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
  console.log(`Verified Workflow Template: ${contentTemplate.name}`);

  const brandingTemplate = await prisma.workflowTemplate.upsert({
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
  console.log(`Verified Workflow Template: ${brandingTemplate.name}`);

  // 4. Initial Configurable Credit Rule Placeholders (Baseline rules, pending business decisions)
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
      await prisma.creditRule.create({
        data: rule,
      });
    }
  }
  console.log("Verified Baseline Credit Rule placeholders.");

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
