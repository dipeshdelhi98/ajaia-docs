import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const users = [
  { email: "alex@ajaia.dev", name: "Alex Rivera", password: "demo1234" },
  { email: "jordan@ajaia.dev", name: "Jordan Chen", password: "demo1234" },
  { email: "sam@ajaia.dev", name: "Sam Okonkwo", password: "demo1234" },
];

const welcomeDoc = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Welcome to Ajaia Docs" }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "This is a lightweight collaborative editor. Try " },
        { type: "text", marks: [{ type: "bold" }], text: "bold" },
        { type: "text", text: ", " },
        { type: "text", marks: [{ type: "italic" }], text: "italic" },
        { type: "text", text: ", and " },
        { type: "text", marks: [{ type: "underline" }], text: "underline" },
        { type: "text", text: "." },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Sharing demo" }],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "This document is owned by Alex. Jordan is an editor; Sam is a viewer.",
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Sign in as Jordan to edit, or as Sam to see view-only access.",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

async function main() {
  await prisma.documentShare.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  const created = [];
  for (const u of users) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        name: u.name,
        passwordHash: await bcrypt.hash(u.password, 10),
      },
    });
    created.push(user);
  }

  const [alex, jordan, sam] = created;

  const shared = await prisma.document.create({
    data: {
      title: "Team kickoff notes",
      content: JSON.stringify(welcomeDoc),
      ownerId: alex.id,
    },
  });

  await prisma.documentShare.create({
    data: { documentId: shared.id, userId: jordan.id, role: "editor" },
  });

  await prisma.documentShare.create({
    data: { documentId: shared.id, userId: sam.id, role: "viewer" },
  });

  await prisma.document.create({
    data: {
      title: "Alex private draft",
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Only Alex can see this until it is shared.",
              },
            ],
          },
        ],
      }),
      ownerId: alex.id,
    },
  });

  console.log("Seeded users:");
  for (const u of users) {
    console.log(`  ${u.email} / ${u.password}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
