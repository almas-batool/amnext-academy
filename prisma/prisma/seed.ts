//prisma/seed.ts

import {
  PrismaClient,
  Role,
  Difficulty,
  CertStatus,
  AssessmentType,
  QuestionType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding MindScrapper database...");

  // ── Users ──────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@MindScrapper.dev" },
    update: {},
    create: {
      email: "admin@MindScrapper.dev",
      name: "Admin User",
      passwordHash: adminHash,
      role: Role.ADMIN,
      emailVerified: true,
      profile: { create: { xp: 9999, level: 20, streak: 100 } },
    },
  });

  const instrHash = await bcrypt.hash("Instr@123", 12);
  const instructor = await prisma.user.upsert({
    where: { email: "instructor@MindScrapper.dev" },
    update: {},
    create: {
      email: "instructor@MindScrapper.dev",
      name: "Jane Instructor",
      passwordHash: instrHash,
      role: Role.INSTRUCTOR,
      emailVerified: true,
      profile: { create: { xp: 5000, level: 10, streak: 30 } },
    },
  });

  const studentHash = await bcrypt.hash("Student@123", 12);
  const student = await prisma.user.upsert({
    where: { email: "student@MindScrapper.dev" },
    update: {},
    create: {
      email: "student@MindScrapper.dev",
      name: "John Student",
      passwordHash: studentHash,
      role: Role.STUDENT,
      emailVerified: true,
      profile: { create: { xp: 1250, level: 3, streak: 7 } },
    },
  });

  // ── Certifications ─────────────────────────────────────────────
  const jsCert = await prisma.certification.upsert({
    where: { slug: "javascript-fundamentals" },
    update: {},
    create: {
      instructorId: instructor.id,
      title: "JavaScript Fundamentals",
      slug: "javascript-fundamentals",
      description:
        "Master core JavaScript concepts from variables to async programming. Build real-world projects and earn a recognized certification.",
      longDescription:
        "This certification covers everything from JavaScript basics through advanced concepts. You'll write code, take quizzes, and prove your knowledge with a proctored final exam.",
      category: "Web Development",
      difficulty: Difficulty.BEGINNER,
      price: 999,
      currency: "USD",
      status: CertStatus.PUBLISHED,
      thumbnail:
        "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80",
      learningOutcomes: [
        "Understand JavaScript syntax and data types",
        "Work with functions, closures, and scope",
        "Master async programming with Promises and async/await",
        "Manipulate the DOM and handle events",
        "Write clean, modern ES6+ code",
      ],
      prerequisites: ["Basic HTML knowledge", "Basic CSS understanding"],
      tags: ["javascript", "web", "programming", "es6"],
      totalChapters: 3,
      duration: 20,
      chapters: {
        create: [
          {
            title: "Introduction to JavaScript",
            order: 1,
            content: `# Introduction to JavaScript

JavaScript is the programming language of the web. It runs in browsers and servers (Node.js), making it one of the most versatile languages available.

## Variables

Use \`let\` for mutable values and \`const\` for immutable references:

\`\`\`javascript
const name = "Alice";        // cannot be reassigned
let count = 0;               // can be reassigned
count++;                     // count = 1
\`\`\`

## Data Types

JavaScript has 7 primitive types:
- **string** – \`"hello"\`
- **number** – \`42\`, \`3.14\`
- **boolean** – \`true\`, \`false\`
- **null** – intentional absence of value
- **undefined** – variable declared but not assigned
- **symbol** – unique identifier
- **bigint** – arbitrary-precision integers

## Operators

\`\`\`javascript
// Arithmetic
const sum = 5 + 3;       // 8
const remainder = 10 % 3; // 1

// Comparison – always use ===
console.log(1 === "1");   // false (strict)
console.log(1 == "1");    // true  (loose – avoid)

// Logical
const isAdult = age >= 18 && hasId;
\`\`\`

## Control Flow

\`\`\`javascript
if (score >= 90) {
  grade = "A";
} else if (score >= 80) {
  grade = "B";
} else {
  grade = "C";
}

// Ternary
const status = isLoggedIn ? "Welcome!" : "Please log in";
\`\`\``,
            summary:
              "Learn JavaScript basics: variables, data types, operators, and control flow.",
          },
          {
            title: "Functions and Scope",
            order: 2,
            content: `# Functions and Scope

Functions are reusable blocks of code. JavaScript has several ways to define them.

## Function Declaration vs Expression

\`\`\`javascript
// Declaration – hoisted
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Expression – not hoisted
const greet = function(name) {
  return \`Hello, \${name}!\`;
};

// Arrow function – preferred for short functions
const greet = (name) => \`Hello, \${name}!\`;
\`\`\`

## Closures

A closure gives an inner function access to the outer function's variables even after the outer function returns:

\`\`\`javascript
function makeCounter() {
  let count = 0;            // captured in closure
  return {
    increment: () => ++count,
    decrement: () => --count,
    value:     () => count,
  };
}

const counter = makeCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.value();     // 2
\`\`\`

## Scope

- **Global** – accessible everywhere
- **Function** – accessible inside the function
- **Block** – \`let\` / \`const\` are block-scoped

\`\`\`javascript
let x = "global";

function example() {
  let x = "local";      // different variable
  console.log(x);       // "local"
}

console.log(x);         // "global"
\`\`\``,
            summary:
              "Master functions, arrow functions, closures, and scope in JavaScript.",
          },
          {
            title: "Async JavaScript",
            order: 3,
            content: `# Async JavaScript

Modern JavaScript is heavily asynchronous — network requests, timers, and I/O don't block execution.

## Callbacks (old way)

\`\`\`javascript
setTimeout(() => console.log("Done!"), 1000);
\`\`\`

## Promises

\`\`\`javascript
fetch("https://api.example.com/data")
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
\`\`\`

## async/await (modern, preferred)

\`\`\`javascript
async function loadUser(id) {
  try {
    const res  = await fetch(\`/api/users/\${id}\`);
    const user = await res.json();
    return user;
  } catch (error) {
    console.error("Failed to load user:", error);
    throw error;
  }
}
\`\`\`

## Promise.all – run in parallel

\`\`\`javascript
const [user, posts] = await Promise.all([
  fetch("/api/user").then(r => r.json()),
  fetch("/api/posts").then(r => r.json()),
]);
\`\`\``,
            summary:
              "Learn callbacks, Promises, and async/await for asynchronous programming.",
          },
        ],
      },
    },
  });

  const pythonCert = await prisma.certification.upsert({
    where: { slug: "python-for-data-science" },
    update: {},
    create: {
      instructorId: instructor.id,
      title: "Python for Data Science",
      slug: "python-for-data-science",
      description:
        "Learn Python programming with a focus on data analysis, NumPy, Pandas, and visualization.",
      category: "Data Science",
      difficulty: Difficulty.INTERMEDIATE,
      price: 1499,
      currency: "USD",
      status: CertStatus.PUBLISHED,
      thumbnail:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
      learningOutcomes: [
        "Write clean Python code",
        "Manipulate data with Pandas",
        "Visualize data with Matplotlib",
        "Build data pipelines",
      ],
      prerequisites: ["Basic programming knowledge"],
      tags: ["python", "data-science", "pandas", "numpy"],
      totalChapters: 2,
      duration: 30,
      chapters: {
        create: [
          {
            title: "Python Basics",
            order: 1,
            content:
              "# Python Basics\n\nPython is a versatile, readable language...",
            summary: "Python syntax, data structures, and functions.",
          },
          {
            title: "Data Analysis with Pandas",
            order: 2,
            content:
              "# Data Analysis with Pandas\n\nPandas is the backbone of data analysis in Python...",
            summary: "DataFrames, data cleaning, and aggregation.",
          },
        ],
      },
    },
  });

  // ── Assessment ─────────────────────────────────────────────────
  await prisma.assessment.upsert({
    where: { id: "asm_js_quiz_01" },
    update: {},
    create: {
      id: "asm_js_quiz_01",
      certId: jsCert.id,
      title: "JavaScript Basics Quiz",
      description: "Test your understanding of JavaScript fundamentals.",
      type: AssessmentType.QUIZ,
      passMark: 60,
      timeLimit: 15,
      randomize: true,
      questions: {
        create: [
          {
            type: QuestionType.MCQ,
            body: "Which keyword declares a block-scoped variable in modern JavaScript?",
            options: [
              { label: "var", value: "var" },
              { label: "let", value: "let" },
              { label: "def", value: "def" },
              { label: "dim", value: "dim" },
            ],
            answer: "let",
            explanation:
              "`let` is block-scoped. `var` is function-scoped and should be avoided.",
            points: 2,
            order: 1,
          },
          {
            type: QuestionType.TRUE_FALSE,
            body: "JavaScript is a statically typed language.",
            options: [
              { label: "True", value: "true" },
              { label: "False", value: "false" },
            ],
            answer: "false",
            explanation:
              "JavaScript is dynamically typed — types are inferred at runtime.",
            points: 1,
            order: 2,
          },
          {
            type: QuestionType.MCQ,
            body: "What does `===` check in JavaScript?",
            options: [
              { label: "Value only", value: "value" },
              { label: "Type only", value: "type" },
              { label: "Value and type", value: "both" },
              { label: "Reference", value: "ref" },
            ],
            answer: "both",
            explanation:
              "Strict equality (`===`) checks both value and type, unlike `==`.",
            points: 2,
            order: 3,
          },
          {
            type: QuestionType.FILL_BLANK,
            body: "To handle asynchronous code cleanly, we use the ________ keyword before a function call that returns a Promise.",
            answer: "await",
            explanation:
              "The `await` keyword pauses execution until the Promise resolves.",
            points: 2,
            order: 4,
          },
        ],
      },
    },
  });

  await prisma.assessment.create({
    data: {
      certId: jsCert.id,
      title: "JavaScript Certification Exam",
      description:
        "The final exam to earn your JavaScript Fundamentals Certificate.",
      type: AssessmentType.CERTIFICATION_EXAM,
      passMark: 70,
      timeLimit: 60,
      randomize: true,
      maxAttempts: 3,
      questions: {
        create: [
          {
            type: QuestionType.MCQ,
            body: "Which of the following correctly creates an arrow function?",
            options: [
              { label: "const fn = => {}", value: "a" },
              { label: "const fn = () => {}", value: "b" },
              { label: "const fn = function => {}", value: "c" },
              { label: "fn = () => {}", value: "d" },
            ],
            answer: "b",
            explanation:
              "Arrow functions use the syntax `() => {}` with optional parentheses for single params.",
            points: 2,
            order: 1,
          },
          {
            type: QuestionType.MCQ,
            body: "What is a closure in JavaScript?",
            options: [
              { label: "A way to close a browser window", value: "a" },
              {
                label: "A function that retains access to its lexical scope",
                value: "b",
              },
              { label: "A method to end a loop", value: "c" },
              { label: "A type of error handling", value: "d" },
            ],
            answer: "b",
            explanation:
              "Closures allow inner functions to access outer function's variables after the outer function has returned.",
            points: 3,
            order: 2,
          },
          {
            type: QuestionType.TRUE_FALSE,
            body: "async/await is built on top of Promises.",
            options: [
              { label: "True", value: "true" },
              { label: "False", value: "false" },
            ],
            answer: "true",
            explanation:
              "async/await is syntactic sugar over Promises, making async code look synchronous.",
            points: 1,
            order: 3,
          },
        ],
      },
    },
  });

  // ── Coding Problems ────────────────────────────────────────────
  await prisma.codingProblem.upsert({
    where: { slug: "two-sum" },
    update: {},
    create: {
      certId: jsCert.id,
      title: "Two Sum",
      slug: "two-sum",
      description: `## Two Sum

Given an array of integers \`nums\` and an integer \`target\`, return the **indices** of the two numbers that add up to \`target\`.

You may assume exactly one solution exists, and you may not use the same element twice.

### Examples

\`\`\`
Input:  nums = [2, 7, 11, 15], target = 9
Output: [0, 1]   // nums[0] + nums[1] = 9
\`\`\`

\`\`\`
Input:  nums = [3, 2, 4], target = 6
Output: [1, 2]
\`\`\`

### Constraints
- \`2 ≤ nums.length ≤ 10⁴\`
- \`-10⁹ ≤ nums[i] ≤ 10⁹\`
- Exactly one valid answer exists.`,
      difficulty: Difficulty.BEGINNER,
      tags: ["array", "hash-table"],
      starterCode: {
        javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your solution here
}`,
        python: `def two_sum(nums, target):
    # Your solution here
    pass`,
        java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
        return new int[]{};
    }
}`,
      },
      testCases: [
        { input: "2 7 11 15\n9", expectedOutput: "0 1", hidden: false },
        { input: "3 2 4\n6", expectedOutput: "1 2", hidden: false },
        { input: "3 3\n6", expectedOutput: "0 1", hidden: true },
      ],
      constraints: "2 ≤ nums.length ≤ 10⁴\n-10⁹ ≤ nums[i] ≤ 10⁹",
      hints: [
        "Try using a HashMap to store seen numbers.",
        "For each element, check if target - element exists in the map.",
      ],
    },
  });

  await prisma.codingProblem.upsert({
    where: { slug: "reverse-string" },
    update: {},
    create: {
      title: "Reverse a String",
      slug: "reverse-string",
      description: `## Reverse a String

Write a function that takes a string and returns it reversed.

### Examples
\`\`\`
Input:  "hello"
Output: "olleh"
\`\`\`

\`\`\`
Input:  "MindScrapper"
Output: "egrофnraeL"
\`\`\``,
      difficulty: Difficulty.BEGINNER,
      tags: ["string", "beginner"],
      starterCode: {
        javascript: `function reverseString(s) {
  // Your solution here
}`,
        python: `def reverse_string(s):
    # Your solution here
    pass`,
      },
      testCases: [
        { input: "hello", expectedOutput: "olleh", hidden: false },
        { input: "MindScrapper", expectedOutput: "egrоFnraeL", hidden: false },
        { input: "abcde", expectedOutput: "edcba", hidden: true },
      ],
      constraints: "1 ≤ s.length ≤ 10⁵",
      hints: ["Think about splitting, reversing an array, and joining."],
    },
  });

  await prisma.codingProblem.upsert({
    where: { slug: "fibonacci-sequence" },
    update: {},
    create: {
      title: "Fibonacci Sequence",
      slug: "fibonacci-sequence",
      description: `## Fibonacci Sequence

Return the **nth** Fibonacci number (0-indexed).

\`F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)\`

### Examples
\`\`\`
Input:  5
Output: 5   // 0, 1, 1, 2, 3, 5
\`\`\``,
      difficulty: Difficulty.BEGINNER,
      tags: ["recursion", "dynamic-programming"],
      starterCode: {
        javascript: `function fibonacci(n) {
  // Your solution here
}`,
        python: `def fibonacci(n):
    # Your solution here
    pass`,
      },
      testCases: [
        { input: "5", expectedOutput: "5", hidden: false },
        { input: "10", expectedOutput: "55", hidden: false },
        { input: "20", expectedOutput: "6765", hidden: true },
      ],
      constraints: "0 ≤ n ≤ 30",
      hints: ["Consider iterative over recursive to avoid stack overflow."],
    },
  });

  // ── Community Posts ────────────────────────────────────────────
  await prisma.communityPost.createMany({
    skipDuplicates: true,
    data: [
      {
        userId: student.id,
        certId: jsCert.id,
        title: "How do Promises work in JavaScript?",
        body: "I'm learning async JavaScript and struggling with Promises. Can someone explain the concept with a real-world analogy?",
        tags: ["javascript", "async", "promises"],
        upvotes: 15,
      },
      {
        userId: student.id,
        title: "Tips for the JavaScript Fundamentals exam?",
        body: "About to take the certification exam. What topics should I focus on? Any advice from people who've passed?",
        tags: ["exam", "javascript", "tips"],
        upvotes: 8,
      },
      {
        userId: student.id,
        title: "Best resources for learning Python after this course?",
        body: "Finished the JS cert, moving to Python. What should I study next?",
        tags: ["python", "learning", "resources"],
        upvotes: 5,
      },
    ],
  });

  // ── Enrollment for demo ────────────────────────────────────────
  await prisma.enrollment.upsert({
    where: { userId_certId: { userId: student.id, certId: jsCert.id } },
    update: {},
    create: {
      userId: student.id,
      certId: jsCert.id,
      paidAmount: 999,
      progress: 0.33,
    },
  });

  // ── XP transactions ────────────────────────────────────────────
  await prisma.xPTransaction.createMany({
    skipDuplicates: true,
    data: [
      { userId: student.id, points: 25, reason: "chapter_read", metadata: {} },
      { userId: student.id, points: 50, reason: "quiz_pass", metadata: {} },
      {
        userId: student.id,
        points: 30,
        reason: "coding_beginner",
        metadata: {},
      },
    ],
  });

  console.log("\n✅ Seed complete!\n");
  console.log("─────────────────────────────────────");
  console.log("Test accounts:");
  console.log("  Admin      : admin@MindScrapper.dev      / Admin@123");
  console.log("  Instructor : instructor@MindScrapper.dev / Instr@123");
  console.log("  Student    : student@MindScrapper.dev    / Student@123");
  console.log("─────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
