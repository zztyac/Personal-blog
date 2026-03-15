import bcrypt from "bcryptjs";
import { PrismaClient, PostStatus } from "@prisma/client";
import { mockPosts, mockTopics } from "@/lib/content/mock-data";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "change-me";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: "admin",
      displayName: "Admin"
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: "admin",
      displayName: "Admin"
    }
  });

  for (const topic of mockTopics) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: {
        name: topic.name,
        description: topic.description,
        accentColor: topic.accentColor
      },
      create: {
        name: topic.name,
        slug: topic.slug,
        description: topic.description,
        accentColor: topic.accentColor
      }
    });
  }

  for (const post of mockPosts) {
    const topic = await prisma.topic.findUniqueOrThrow({
      where: { slug: post.topicSlug }
    });

    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        summary: post.summary,
        contentMarkdown: post.contentMarkdown,
        status: post.status as PostStatus,
        readingTime: post.readingTime,
        isFeatured: post.isFeatured,
        publishedAt: post.status === "published" ? new Date(post.publishedAt) : null,
        topicId: topic.id,
        authorId: admin.id
      },
      create: {
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        contentMarkdown: post.contentMarkdown,
        status: post.status as PostStatus,
        readingTime: post.readingTime,
        isFeatured: post.isFeatured,
        publishedAt: post.status === "published" ? new Date(post.publishedAt) : null,
        topicId: topic.id,
        authorId: admin.id
      }
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
