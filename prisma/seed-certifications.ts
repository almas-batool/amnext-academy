//seed-certifications.ts

import { PrismaClient, Difficulty } from "@prisma/client";

const prisma = new PrismaClient();

const certifications = [
  {
    title: "HTML & CSS Fundamentals",
    slug: "html-css-fundamentals",
    category: "Web Development",
    difficulty: Difficulty.BEGINNER,
  },
  {
    title: "JavaScript Essentials",
    slug: "javascript-essentials",
    category: "Web Development",
    difficulty: Difficulty.BEGINNER,
  },
  {
    title: "Advanced JavaScript",
    slug: "advanced-javascript",
    category: "Web Development",
    difficulty: Difficulty.INTERMEDIATE,
  },
  {
    title: "React.js Developer",
    slug: "reactjs-developer",
    category: "Frontend",
    difficulty: Difficulty.INTERMEDIATE,
  },
  {
    title: "Next.js Masterclass",
    slug: "nextjs-masterclass",
    category: "Frontend",
    difficulty: Difficulty.ADVANCED,
  },
  {
    title: "TypeScript Professional",
    slug: "typescript-professional",
    category: "Programming",
    difficulty: Difficulty.INTERMEDIATE,
  },
  {
    title: "Node.js Backend Development",
    slug: "nodejs-backend-development",
    category: "Backend",
    difficulty: Difficulty.INTERMEDIATE,
  },
  {
    title: "Express.js API Development",
    slug: "express-api-development",
    category: "Backend",
    difficulty: Difficulty.INTERMEDIATE,
  },
  {
    title: "MongoDB Fundamentals",
    slug: "mongodb-fundamentals",
    category: "Database",
    difficulty: Difficulty.BEGINNER,
  },
  {
    title: "PostgreSQL Mastery",
    slug: "postgresql-mastery",
    category: "Database",
    difficulty: Difficulty.INTERMEDIATE,
  },
  {
    title: "MySQL Database Administration",
    slug: "mysql-database-administration",
    category: "Database",
    difficulty: Difficulty.INTERMEDIATE,
  },
  {
    title: "Python Programming",
    slug: "python-programming",
    category: "Programming",
    difficulty: Difficulty.BEGINNER,
  },
  {
    title: "Advanced Python",
    slug: "advanced-python",
    category: "Programming",
    difficulty: Difficulty.ADVANCED,
  },
  {
    title: "Java Programming",
    slug: "java-programming",
    category: "Programming",
    difficulty: Difficulty.BEGINNER,
  },
  {
    title: "Spring Boot Development",
    slug: "spring-boot-development",
    category: "Backend",
    difficulty: Difficulty.ADVANCED,
  },
  {
    title: "C Programming",
    slug: "c-programming",
    category: "Programming",
    difficulty: Difficulty.BEGINNER,
  },
  {
    title: "C++ Programming",
    slug: "cpp-programming",
    category: "Programming",
    difficulty: Difficulty.INTERMEDIATE,
  },
  {
    title: "Data Structures & Algorithms",
    slug: "data-structures-algorithms",
    category: "Computer Science",
    difficulty: Difficulty.INTERMEDIATE,
  },
  {
    title: "Operating Systems",
    slug: "operating-systems",
    category: "Computer Science",
    difficulty: Difficulty.INTERMEDIATE,
  },
  {
    title: "Computer Networks",
    slug: "computer-networks",
    category: "Computer Science",
    difficulty: Difficulty.INTERMEDIATE,
  },
  {
    title: "Cloud Computing Fundamentals",
    slug: "cloud-computing-fundamentals",
    category: "Cloud",
    difficulty: Difficulty.BEGINNER,
  },
  {
    title: "AWS Cloud Practitioner",
    slug: "aws-cloud-practitioner",
    category: "Cloud",
    difficulty: Difficulty.INTERMEDIATE,
  },
  {
    title: "Microsoft Azure Fundamentals",
    slug: "azure-fundamentals",
    category: "Cloud",
    difficulty: Difficulty.BEGINNER,
  },
  {
    title: "Google Cloud Platform",
    slug: "google-cloud-platform",
    category: "Cloud",
    difficulty: Difficulty.INTERMEDIATE,
  },
  {
    title: "Docker Essentials",
    slug: "docker-essentials",
    category: "DevOps",
    difficulty: Difficulty.INTERMEDIATE,
  },
  {
    title: "Kubernetes Administration",
    slug: "kubernetes-administration",
    category: "DevOps",
    difficulty: Difficulty.ADVANCED,
  },
  {
    title: "Git & GitHub Professional",
    slug: "git-github-professional",
    category: "Development Tools",
    difficulty: Difficulty.BEGINNER,
  },
  {
    title: "Linux System Administration",
    slug: "linux-system-administration",
    category: "Operating Systems",
    difficulty: Difficulty.INTERMEDIATE,
  },
  {
    title: "Cyber Security Essentials",
    slug: "cyber-security-essentials",
    category: "Security",
    difficulty: Difficulty.INTERMEDIATE,
  },
  {
    title: "Ethical Hacking Fundamentals",
    slug: "ethical-hacking-fundamentals",
    category: "Security",
    difficulty: Difficulty.ADVANCED,
  },
  {
    title: "Artificial Intelligence Fundamentals",
    slug: "artificial-intelligence-fundamentals",
    category: "Artificial Intelligence",
    difficulty: Difficulty.BEGINNER,
  },
  {
    title: "Machine Learning Essentials",
    slug: "machine-learning-essentials",
    category: "Artificial Intelligence",
    difficulty: Difficulty.INTERMEDIATE,
  },
  {
    title: "Deep Learning with Python",
    slug: "deep-learning-with-python",
    category: "Artificial Intelligence",
    difficulty: Difficulty.ADVANCED,
  },
  {
    title: "Data Science Bootcamp",
    slug: "data-science-bootcamp",
    category: "Data Science",
    difficulty: Difficulty.INTERMEDIATE,
  },
  {
    title: "Prompt Engineering",
    slug: "prompt-engineering",
    category: "Generative AI",
    difficulty: Difficulty.BEGINNER,
  },
  {
    title: "Generative AI Developer",
    slug: "generative-ai-developer",
    category: "Generative AI",
    difficulty: Difficulty.ADVANCED,
  },
  {
    title: "LangChain Development",
    slug: "langchain-development",
    category: "Generative AI",
    difficulty: Difficulty.ADVANCED,
  },
  {
    title: "REST API Development",
    slug: "rest-api-development",
    category: "Backend",
    difficulty: Difficulty.INTERMEDIATE,
  },
  {
    title: "GraphQL Fundamentals",
    slug: "graphql-fundamentals",
    category: "Backend",
    difficulty: Difficulty.INTERMEDIATE,
  },
  {
    title: "Software Engineering Principles",
    slug: "software-engineering-principles",
    category: "Computer Science",
    difficulty: Difficulty.BEGINNER,
  },
];

async function main() {
  const instructor = await prisma.user.findFirst({
    where: {
      role: "INSTRUCTOR",
    },
  });

  if (!instructor) {
    throw new Error("Instructor account not found. Run your main seed first.");
  }

  const thumbnailMap: Record<string, string> = {
    "Web Development": "/images/certifications/web.jpg",
    Frontend: "/images/certifications/frontend.jpg",
    Backend: "/images/certifications/backend.jpg",
    Programming: "/images/certifications/programming.jpg",
    Database: "/images/certifications/database.jpg",
    Cloud: "/images/certifications/cloud.jpg",
    DevOps: "/images/certifications/devops.jpg",
    Security: "/images/certifications/security.jpg",
    "Artificial Intelligence": "/images/certifications/ai.jpg",
    "Data Science": "/images/certifications/ai.jpg",
    "Generative AI": "/images/certifications/ai.jpg",
    "Computer Science": "/images/certifications/computer-science.jpg",
  };

  for (const item of certifications) {
    const thumbnail =
      thumbnailMap[item.category] ?? "/images/certifications/programming.jpg";
    const certification = await prisma.certification.upsert({
      where: {
        slug: item.slug,
      },
      update: {},
      create: {
        instructorId: instructor.id,

        title: item.title,

        slug: item.slug,

        description: `${item.title} certification covering theory and practical concepts.`,

        longDescription: `This certification provides complete learning materials, assessments and coding practice for ${item.title}.`,

        category: item.category,

        difficulty: item.difficulty,

        price:
          item.difficulty === Difficulty.BEGINNER
            ? 799
            : item.difficulty === Difficulty.INTERMEDIATE
              ? 1499
              : 2499,

        currency: "USD",

        status: "PUBLISHED",

        thumbnail,

        learningOutcomes: [
          "Understand fundamentals",
          "Hands-on practice",
          "Complete assessments",
          "Earn certification",
        ],

        prerequisites: ["Basic computer knowledge"],

        tags: [item.category, item.title],

        totalChapters: 1,

        duration: 20,
      },
    });

    // Create one chapter
    const chapter = await prisma.chapter.create({
      data: {
        certId: certification.id,
        title: "Introduction",
        order: 1,
        content: `# ${item.title}

Welcome to ${item.title}.

This certification covers:

• Fundamentals
• Practical Concepts
• Best Practices
• Assessment
• Coding Practice

Complete this chapter before attempting the assessments.`,
        summary: `Introduction to ${item.title}`,
      },
    });

    // Practice Quiz
    const quiz = await prisma.assessment.create({
      data: {
        certId: certification.id,
        title: "Practice Quiz",
        description: "Practice assessment",
        type: "QUIZ",
        passMark: 60,
        randomize: true,
      },
    });

    // Final Exam
    const finalExam = await prisma.assessment.create({
      data: {
        certId: certification.id,
        title: "Final Certification Exam",
        description: "Final Exam",
        type: "CERTIFICATION_EXAM",
        passMark: 70,
        randomize: true,
      },
    });

    // Create questions
    for (let i = 1; i <= 10; i++) {
      await prisma.question.create({
        data: {
          assessmentId: quiz.id,
          body: `Practice Question ${i} for ${item.title}`,
          type: "MCQ",
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: "Option A",
          explanation: "Sample explanation.",
          order: i,
          difficulty: item.difficulty,
        },
      });

      await prisma.question.create({
        data: {
          assessmentId: finalExam.id,
          body: `Final Exam Question ${i} for ${item.title}`,
          type: "MCQ",
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: "Option A",
          explanation: "Sample explanation.",
          order: i,
          difficulty: item.difficulty,
        },
      });
    }

    // Coding Problem 1
    await prisma.codingProblem.upsert({
      where: {
        slug: `${item.slug}-challenge-1`,
      },
      update: {},
      create: {
        certId: certification.id,
        title: `${item.title} Coding Challenge 1`,
        slug: `${item.slug}-challenge-1`,
        description: "Solve the given programming problem.",
        difficulty: item.difficulty,
        tags: [item.category],

        starterCode: {
          javascript: "function solve(){\n\n}",
        },

        solution: "Sample Solution",

        testCases: [
          {
            input: "5",
            output: "5",
          },
        ],

        hints: ["Read the problem carefully."],
      },
    });

    // Coding Problem 2
    await prisma.codingProblem.upsert({
      where: {
        slug: `${item.slug}-challenge-2`,
      },
      update: {},
      create: {
        certId: certification.id,
        title: `${item.title} Coding Challenge 2`,
        slug: `${item.slug}-challenge-2`,
        description: "Advanced coding problem.",
        difficulty: item.difficulty,
        tags: [item.category],

        starterCode: {
          javascript: "function solve(){\n\n}",
        },

        solution: "Sample Solution",

        testCases: [
          {
            input: "10",
            output: "10",
          },
        ],

        hints: ["Think before coding."],
      },
    });

    console.log(`✅ ${item.title}`);
  }

  console.log("\n🎉 Successfully generated 40 certifications!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
