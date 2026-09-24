import {
  AssessmentType,
  CertStatus,
  Difficulty,
  PrismaClient,
  QuestionType,
} from "@prisma/client";

const thumbnail = (topic: string) =>
  `https://images.unsplash.com/${topic}?w=800&q=80`;

type CourseSpec = {
  title: string;
  slug: string;
  category: string;
  difficulty: Difficulty;
  duration: number;
  price: number;
  image: string;
  topics: string[];
  skills: string[];
  prerequisites: string[];
  audience: string;
};

const courses: CourseSpec[] = [
  { title: "Full Stack Web Development", slug: "full-stack-web-development", category: "Web Development", difficulty: Difficulty.INTERMEDIATE, duration: 48, price: 99, image: "photo-1498050108023-c5249f4df085", topics: ["Web Fundamentals", "HTML & Modern CSS", "JavaScript Applications", "React Interfaces", "Next.js Routing", "Backend APIs", "PostgreSQL & Prisma", "Authentication and Deployment"], skills: ["HTML", "CSS", "JavaScript", "React", "Next.js", "Node.js", "PostgreSQL", "Prisma"], prerequisites: ["Basic programming experience", "Familiarity with HTML and CSS"], audience: "Developers who want to build and ship production-ready web applications." },
  { title: "Frontend Development with React", slug: "frontend-development-react", category: "Frontend", difficulty: Difficulty.INTERMEDIATE, duration: 32, price: 79, image: "photo-1633356122544-f134324a6cee", topics: ["Component Architecture", "JSX and Props", "State and Events", "Hooks and Effects", "Forms and Validation", "Routing and Data Fetching", "Testing React UIs", "Performance and Accessibility"], skills: ["React", "JSX", "Hooks", "React Router", "Testing Library", "Accessibility"], prerequisites: ["Modern JavaScript", "HTML and CSS fundamentals"], audience: "Frontend developers building maintainable, accessible React products." },
  { title: "Backend Development with Node.js", slug: "backend-development-nodejs", category: "Backend", difficulty: Difficulty.INTERMEDIATE, duration: 34, price: 79, image: "photo-1555066931-4365d14bab8c", topics: ["Node Runtime and Modules", "Express Application Design", "REST API Contracts", "Validation and Errors", "Authentication and Sessions", "Database Integration", "Testing and Observability", "Production Deployment"], skills: ["Node.js", "Express", "REST APIs", "JWT", "SQL", "API Testing"], prerequisites: ["JavaScript fundamentals", "Basic HTTP concepts"], audience: "Developers creating reliable server-side applications and APIs." },
  { title: "Next.js Full Stack Development", slug: "nextjs-full-stack-development", category: "Frontend", difficulty: Difficulty.ADVANCED, duration: 36, price: 89, image: "photo-1558655146-d09347e92766", topics: ["App Router Architecture", "Server and Client Components", "Layouts and Navigation", "Data Fetching and Caching", "Route Handlers", "Authentication", "Forms and Mutations", "Deployment and Monitoring"], skills: ["Next.js", "React Server Components", "TypeScript", "Prisma", "Caching", "Vercel"], prerequisites: ["React development experience", "JavaScript or TypeScript"], audience: "React developers ready to build full-stack applications with Next.js." },
  { title: "JavaScript Mastery", slug: "javascript-mastery", category: "Programming", difficulty: Difficulty.INTERMEDIATE, duration: 30, price: 59, image: "photo-1627398242454-45a1465c2479", topics: ["Types and Coercion", "Functions and Closures", "Objects and Prototypes", "Arrays and Iteration", "Asynchronous JavaScript", "DOM and Browser APIs", "Modules and Tooling", "Testing and Architecture"], skills: ["ES2023", "Closures", "Promises", "DOM", "Modules", "Testing"], prerequisites: ["Basic programming concepts"], audience: "Developers who want a deep, practical command of modern JavaScript." },
  { title: "TypeScript Development", slug: "typescript-development", category: "Programming", difficulty: Difficulty.INTERMEDIATE, duration: 28, price: 59, image: "photo-1516116216624-53e697fedbea", topics: ["Type Inference", "Interfaces and Type Aliases", "Generics", "Unions and Narrowing", "Utility Types", "Typed APIs", "Project Configuration", "Migration and Team Patterns"], skills: ["TypeScript", "Generics", "Type Design", "ES Modules", "API Contracts", "tsconfig"], prerequisites: ["Comfortable JavaScript"], audience: "JavaScript developers adding dependable types to real-world projects." },
  { title: "Python Programming", slug: "python-programming", category: "Programming", difficulty: Difficulty.BEGINNER, duration: 26, price: 49, image: "photo-1526374965328-7f61d4dc18c5", topics: ["Python Syntax and Data Types", "Control Flow and Functions", "Collections and Comprehensions", "Modules and Packages", "Object-Oriented Python", "Files and Exceptions", "Testing and Debugging", "Automation Project"], skills: ["Python", "Functions", "OOP", "Testing", "File I/O", "Automation"], prerequisites: ["No prior Python experience required"], audience: "New programmers and professionals automating tasks with Python." },
  { title: "Java Programming", slug: "java-programming", category: "Programming", difficulty: Difficulty.BEGINNER, duration: 28, price: 49, image: "photo-1515879218367-8466d910aaa4", topics: ["Java Syntax and JVM", "Classes and Objects", "Inheritance and Interfaces", "Collections Framework", "Exceptions and I/O", "Generics and Lambdas", "Concurrency Basics", "Application Project"], skills: ["Java", "OOP", "Collections", "Generics", "Streams", "JVM"], prerequisites: ["Basic programming logic"], audience: "Learners building a strong foundation in enterprise Java development." },
  { title: "C++ Programming", slug: "cpp-programming", category: "Programming", difficulty: Difficulty.INTERMEDIATE, duration: 30, price: 49, image: "photo-1555066931-4365d14bab8c", topics: ["C++ Syntax and Compilation", "References and Pointers", "Classes and RAII", "STL Containers", "Algorithms and Iterators", "Templates", "Concurrency", "Systems Project"], skills: ["C++", "STL", "Memory Management", "Templates", "Algorithms", "RAII"], prerequisites: ["Basic programming and problem solving"], audience: "Programmers targeting performance-sensitive and systems software." },
  { title: "C Programming", slug: "c-programming", category: "Programming", difficulty: Difficulty.BEGINNER, duration: 24, price: 39, image: "photo-1515879218367-8466d910aaa4", topics: ["C Program Structure", "Pointers and Memory", "Arrays and Strings", "Functions and Headers", "Structs and Enums", "File Processing", "Dynamic Allocation", "Command-Line Project"], skills: ["C", "Pointers", "Memory", "Structs", "Make", "Debugging"], prerequisites: ["Basic computer literacy"], audience: "Learners who need a rigorous foundation in low-level programming." },
  { title: "Data Structures & Algorithms", slug: "data-structures-algorithms", category: "Computer Science", difficulty: Difficulty.INTERMEDIATE, duration: 36, price: 69, image: "photo-1518770660439-4636190af475", topics: ["Complexity Analysis", "Arrays and Hash Tables", "Stacks and Queues", "Linked Lists", "Trees and Heaps", "Graphs", "Sorting and Searching", "Dynamic Programming"], skills: ["Big O", "Data Structures", "Algorithms", "Graphs", "Dynamic Programming", "Problem Solving"], prerequisites: ["Programming in any modern language"], audience: "Developers preparing for technical interviews or algorithm-heavy work." },
  { title: "Database Management & SQL", slug: "database-management-sql", category: "Database", difficulty: Difficulty.BEGINNER, duration: 26, price: 49, image: "photo-1544383835-bda2bc66a55d", topics: ["Relational Data Modeling", "SQL Queries", "Joins and Aggregation", "Constraints and Transactions", "Indexes and Query Plans", "Views and Procedures", "Security and Backups", "Reporting Project"], skills: ["SQL", "Relational Modeling", "Joins", "Transactions", "Indexes", "Backups"], prerequisites: ["Basic programming or spreadsheet experience"], audience: "Analysts and developers who work with relational data." },
  { title: "PostgreSQL Database Engineering", slug: "postgresql-database-engineering", category: "Database", difficulty: Difficulty.ADVANCED, duration: 32, price: 69, image: "photo-1544383835-bda2bc66a55d", topics: ["PostgreSQL Architecture", "Advanced SQL", "Indexes and Query Planning", "Transactions and Locking", "JSONB and Full Text", "Partitioning and Replication", "Roles and Security", "Production Operations"], skills: ["PostgreSQL", "SQL", "JSONB", "Query Tuning", "Replication", "Database Security"], prerequisites: ["SQL joins and relational design"], audience: "Engineers operating reliable PostgreSQL systems at scale." },
  { title: "MongoDB & NoSQL Development", slug: "mongodb-nosql-development", category: "Database", difficulty: Difficulty.INTERMEDIATE, duration: 28, price: 59, image: "photo-1558494949-ef010cbdcc31", topics: ["Document Data Modeling", "CRUD and Query Operators", "Indexes", "Aggregation Pipelines", "Schema Validation", "Transactions", "Replication and Sharding", "Application Integration"], skills: ["MongoDB", "NoSQL Modeling", "Aggregation", "Indexes", "Mongoose", "Scaling"], prerequisites: ["Basic JavaScript and data modeling"], audience: "Developers building flexible, document-oriented applications." },
  { title: "Artificial Intelligence Fundamentals", slug: "artificial-intelligence-fundamentals", category: "Artificial Intelligence", difficulty: Difficulty.BEGINNER, duration: 24, price: 49, image: "photo-1677442136019-21780ecad995", topics: ["AI Problem Framing", "Search and Optimization", "Knowledge Representation", "Probability for AI", "Supervised Learning Concepts", "Neural Network Intuition", "Responsible AI", "Applied AI Project"], skills: ["AI Concepts", "Search", "Probability", "Model Evaluation", "Responsible AI", "Python"], prerequisites: ["Basic algebra and programming"], audience: "Professionals who want a practical foundation in modern AI." },
  { title: "Machine Learning", slug: "machine-learning", category: "Artificial Intelligence", difficulty: Difficulty.INTERMEDIATE, duration: 38, price: 79, image: "photo-1551288049-bebda4e38f71", topics: ["ML Workflow", "Data Preparation", "Regression", "Classification", "Trees and Ensembles", "Clustering", "Feature Engineering", "Model Deployment"], skills: ["Python", "scikit-learn", "Regression", "Classification", "Feature Engineering", "MLOps"], prerequisites: ["Python and basic statistics"], audience: "Analysts and developers building predictive models from data." },
  { title: "Deep Learning", slug: "deep-learning", category: "Artificial Intelligence", difficulty: Difficulty.ADVANCED, duration: 42, price: 89, image: "photo-1518770660439-4636190af475", topics: ["Neural Network Mathematics", "PyTorch Tensors", "Optimization and Backpropagation", "CNN Architectures", "Sequence Models", "Transfer Learning", "Training at Scale", "Deep Learning Project"], skills: ["PyTorch", "Neural Networks", "CNNs", "RNNs", "Optimization", "GPU Training"], prerequisites: ["Python, linear algebra, and machine learning"], audience: "ML practitioners ready to train and evaluate deep neural networks." },
  { title: "Generative AI & LLMs", slug: "generative-ai-llms", category: "Artificial Intelligence", difficulty: Difficulty.ADVANCED, duration: 34, price: 89, image: "photo-1677442136019-21780ecad995", topics: ["Generative Model Landscape", "Transformer Architecture", "Prompt Design", "Embeddings and Vector Search", "Retrieval-Augmented Generation", "Fine-Tuning Strategies", "Evaluation and Guardrails", "Production LLM Application"], skills: ["LLMs", "Transformers", "Prompting", "Embeddings", "RAG", "AI Evaluation"], prerequisites: ["Python and basic machine learning"], audience: "Engineers building useful, reliable generative AI products." },
  { title: "Natural Language Processing", slug: "natural-language-processing", category: "Artificial Intelligence", difficulty: Difficulty.ADVANCED, duration: 34, price: 79, image: "photo-1451187580459-43490279c0fa", topics: ["Text Cleaning and Tokenization", "Language Representations", "Text Classification", "Sequence Labeling", "Information Retrieval", "Transformers for NLP", "Evaluation and Bias", "NLP Application"], skills: ["NLP", "Tokenization", "Transformers", "Text Classification", "Search", "Evaluation"], prerequisites: ["Python and introductory machine learning"], audience: "Data scientists and engineers working with language data." },
  { title: "Computer Vision", slug: "computer-vision", category: "Artificial Intelligence", difficulty: Difficulty.ADVANCED, duration: 34, price: 79, image: "photo-1516116216624-53e697fedbea", topics: ["Image Representation", "OpenCV Operations", "Feature Detection", "Image Classification", "Object Detection", "Segmentation", "Vision Transformers", "Computer Vision Project"], skills: ["OpenCV", "CNNs", "Object Detection", "Segmentation", "Image Processing", "PyTorch"], prerequisites: ["Python and basic deep learning"], audience: "Engineers creating systems that interpret images and video." },
  { title: "Data Science", slug: "data-science", category: "Data Science", difficulty: Difficulty.INTERMEDIATE, duration: 36, price: 69, image: "photo-1551288049-bebda4e38f71", topics: ["Data Science Workflow", "Python for Analysis", "Cleaning Messy Data", "Exploratory Analysis", "Statistical Inference", "Predictive Modeling", "Experiment Design", "Data Science Case Study"], skills: ["Python", "Pandas", "Statistics", "Visualization", "Machine Learning", "Experimentation"], prerequisites: ["Python basics and high-school mathematics"], audience: "Learners turning raw data into defensible business insights." },
  { title: "Data Analytics", slug: "data-analytics", category: "Data Science", difficulty: Difficulty.BEGINNER, duration: 28, price: 59, image: "photo-1551288049-bebda4e38f71", topics: ["Analytics Questions", "Spreadsheet to SQL", "Data Cleaning", "Descriptive Statistics", "Dashboard Design", "Cohort and Funnel Analysis", "Communicating Insights", "Analytics Portfolio Project"], skills: ["SQL", "Excel", "Dashboards", "Statistics", "Data Storytelling", "KPIs"], prerequisites: ["Basic spreadsheet usage"], audience: "Analysts and operators who need confident, decision-ready reporting." },
  { title: "Big Data Engineering", slug: "big-data-engineering", category: "Data Engineering", difficulty: Difficulty.ADVANCED, duration: 40, price: 89, image: "photo-1558494949-ef010cbdcc31", topics: ["Distributed Systems", "Batch Data Pipelines", "Apache Spark", "Streaming with Kafka", "Data Lake Architecture", "Warehouse Modeling", "Orchestration and Quality", "Production Data Platform"], skills: ["Spark", "Kafka", "Data Lakes", "ETL", "Airflow", "Distributed Systems"], prerequisites: ["Python, SQL, and database fundamentals"], audience: "Data engineers designing dependable pipelines for large datasets." },
  { title: "Cloud Computing Fundamentals", slug: "cloud-computing-fundamentals", category: "Cloud", difficulty: Difficulty.BEGINNER, duration: 24, price: 49, image: "photo-1451187580459-43490279c0fa", topics: ["Cloud Service Models", "Regions and Availability", "Compute and Storage", "Networking Basics", "Identity and Access", "Managed Databases", "Cost and Reliability", "Cloud Architecture Review"], skills: ["Cloud Concepts", "Networking", "IAM", "Storage", "Compute", "Cost Awareness"], prerequisites: ["Basic web and networking concepts"], audience: "Teams moving from local infrastructure to cloud services." },
  { title: "AWS Cloud Engineering", slug: "aws-cloud-engineering", category: "Cloud", difficulty: Difficulty.INTERMEDIATE, duration: 36, price: 79, image: "photo-1451187580459-43490279c0fa", topics: ["AWS Account and IAM", "VPC Networking", "EC2 and Load Balancing", "S3 and CloudFront", "RDS and DynamoDB", "Lambda and EventBridge", "Observability and Cost", "AWS Production Architecture"], skills: ["AWS", "EC2", "S3", "Lambda", "VPC", "RDS"], prerequisites: ["Cloud fundamentals and basic Linux"], audience: "Engineers deploying secure, observable workloads on AWS." },
  { title: "Microsoft Azure Fundamentals", slug: "microsoft-azure-fundamentals", category: "Cloud", difficulty: Difficulty.BEGINNER, duration: 24, price: 49, image: "photo-1451187580459-43490279c0fa", topics: ["Azure Core Services", "Subscriptions and Resource Groups", "Virtual Networks", "Storage Accounts", "Azure Compute", "Identity with Entra ID", "Monitoring and Governance", "Azure Solution Blueprint"], skills: ["Azure", "Entra ID", "Virtual Networks", "Storage", "Governance", "Monitoring"], prerequisites: ["Basic cloud and networking vocabulary"], audience: "Learners preparing to build and operate Azure workloads." },
  { title: "Google Cloud Fundamentals", slug: "google-cloud-fundamentals", category: "Cloud", difficulty: Difficulty.BEGINNER, duration: 24, price: 49, image: "photo-1451187580459-43490279c0fa", topics: ["Google Cloud Projects", "IAM and Organization", "Compute Engine", "Cloud Storage", "VPC Networking", "BigQuery", "Cloud Run", "Reliable GCP Architecture"], skills: ["Google Cloud", "IAM", "Compute Engine", "BigQuery", "Cloud Run", "VPC"], prerequisites: ["Basic cloud concepts"], audience: "Developers and analysts starting with Google Cloud services." },
  { title: "DevOps Engineering", slug: "devops-engineering", category: "DevOps", difficulty: Difficulty.INTERMEDIATE, duration: 34, price: 79, image: "photo-1518770660439-4636190af475", topics: ["DevOps Culture and Flow", "Linux and Shell Automation", "CI/CD Pipelines", "Infrastructure as Code", "Container Delivery", "Observability", "Security in Delivery", "Release Engineering Project"], skills: ["CI/CD", "Linux", "Automation", "Terraform", "Containers", "Observability"], prerequisites: ["Git and basic command-line skills"], audience: "Engineers improving the speed and reliability of software delivery." },
  { title: "Docker & Kubernetes", slug: "docker-kubernetes", category: "DevOps", difficulty: Difficulty.ADVANCED, duration: 36, price: 79, image: "photo-1605745341112-85968b19335b", topics: ["Container Images", "Docker Networking", "Compose Environments", "Kubernetes Objects", "Services and Ingress", "Configuration and Secrets", "Deployments and Scaling", "Cluster Operations"], skills: ["Docker", "Kubernetes", "Helm", "Containers", "Ingress", "Cluster Operations"], prerequisites: ["Linux, Git, and basic networking"], audience: "Developers and operators deploying containerized services." },
  { title: "Cybersecurity Fundamentals", slug: "cybersecurity-fundamentals", category: "Security", difficulty: Difficulty.BEGINNER, duration: 26, price: 59, image: "photo-1563013544-824ae1b704d3", topics: ["Security Principles", "Threat Modeling", "Identity and Access", "Network Security", "Web Security", "Cryptography Basics", "Incident Response", "Security Improvement Plan"], skills: ["Threat Modeling", "IAM", "Network Security", "Web Security", "Cryptography", "Incident Response"], prerequisites: ["Basic networking and operating systems"], audience: "Technology professionals building practical security awareness." },
  { title: "Ethical Hacking & Security", slug: "ethical-hacking-security", category: "Security", difficulty: Difficulty.ADVANCED, duration: 38, price: 89, image: "photo-1563013544-824ae1b704d3", topics: ["Reconnaissance and Scoping", "Vulnerability Discovery", "Web Application Testing", "Network Enumeration", "Exploitation Concepts", "Privilege and Lateral Movement", "Reporting Findings", "Authorized Assessment"], skills: ["Ethical Hacking", "Burp Suite", "Network Testing", "OWASP", "Risk Reporting", "Kali Linux"], prerequisites: ["Networking, Linux, and security fundamentals"], audience: "Authorized security testers and defenders practicing offensive techniques." },
  { title: "Software Engineering", slug: "software-engineering", category: "Software Engineering", difficulty: Difficulty.INTERMEDIATE, duration: 30, price: 69, image: "photo-1515879218367-8466d910aaa4", topics: ["Requirements and Scope", "Architecture and Modularity", "Version Control Workflows", "Testing Strategy", "Code Review", "Reliability and Operations", "Team Delivery", "Engineering Capstone"], skills: ["Requirements", "Architecture", "Testing", "Code Review", "Git", "Reliability"], prerequisites: ["Experience building a small software project"], audience: "Developers growing from coding tasks into sustainable engineering practice." },
  { title: "System Design", slug: "system-design", category: "Software Engineering", difficulty: Difficulty.ADVANCED, duration: 34, price: 79, image: "photo-1518770660439-4636190af475", topics: ["Requirements and Scale", "Capacity Planning", "APIs and Data Models", "Caching", "Queues and Async Work", "Replication and Consistency", "Observability and Resilience", "Architecture Interview Case"], skills: ["Distributed Systems", "Scalability", "APIs", "Caching", "Databases", "Architecture"], prerequisites: ["Backend development and SQL"], audience: "Engineers preparing to design resilient systems and lead architecture discussions." },
  { title: "Git & GitHub", slug: "git-github", category: "Development Tools", difficulty: Difficulty.BEGINNER, duration: 18, price: 29, image: "photo-1556075798-4825dfaaf498", topics: ["Git Objects and Commits", "Branching and Merging", "Conflict Resolution", "History and Recovery", "GitHub Repositories", "Pull Requests", "Actions and Automation", "Team Workflow"], skills: ["Git", "GitHub", "Branching", "Pull Requests", "CI", "Collaboration"], prerequisites: ["A project folder and command-line access"], audience: "Anyone who wants a confident, collaborative version-control workflow." },
  { title: "UI/UX Design", slug: "ui-ux-design", category: "Design", difficulty: Difficulty.INTERMEDIATE, duration: 28, price: 59, image: "photo-1558655146-d09347e92766", topics: ["User Research", "Personas and Journeys", "Information Architecture", "Wireframing", "Visual Systems", "Prototyping", "Usability Testing", "Product Design Case Study"], skills: ["UX Research", "Wireframes", "Figma", "Prototyping", "Usability", "Design Systems"], prerequisites: ["Curiosity about people and products"], audience: "Designers and product teams creating clear, usable digital experiences." },
  { title: "Mobile App Development", slug: "mobile-app-development", category: "Mobile", difficulty: Difficulty.INTERMEDIATE, duration: 32, price: 69, image: "photo-1512941937669-90a1b58e7e9c", topics: ["Mobile Product Architecture", "Responsive Layouts", "Navigation and State", "Offline Data", "Network Integration", "Device Capabilities", "Testing and Release", "Mobile App Project"], skills: ["Mobile UI", "State Management", "REST APIs", "Offline Storage", "Testing", "App Release"], prerequisites: ["JavaScript or another programming language"], audience: "Developers building and shipping applications for phones and tablets." },
  { title: "Android Development", slug: "android-development", category: "Mobile", difficulty: Difficulty.INTERMEDIATE, duration: 34, price: 69, image: "photo-1607252650355-f7fd0460ccdb", topics: ["Kotlin and Android Studio", "Layouts and Compose", "App Navigation", "Lifecycle and State", "Networking and Persistence", "Notifications and Permissions", "Testing Android Apps", "Play Store Release"], skills: ["Kotlin", "Android SDK", "Jetpack Compose", "Room", "Coroutines", "Play Console"], prerequisites: ["Object-oriented programming"], audience: "Developers creating polished native Android applications." },
  { title: "Blockchain & Web3", slug: "blockchain-web3", category: "Blockchain", difficulty: Difficulty.ADVANCED, duration: 32, price: 79, image: "photo-1639762681485-074b7f938ba0", topics: ["Distributed Ledger Concepts", "Wallets and Keys", "Transactions and Consensus", "Smart Contract Design", "Solidity Basics", "Web3 Frontends", "Security and Auditing", "Web3 Product Project"], skills: ["Blockchain", "Ethereum", "Solidity", "Smart Contracts", "Web3.js", "Wallet Security"], prerequisites: ["JavaScript and basic cryptography concepts"], audience: "Developers exploring secure decentralized applications and protocols." },
  { title: "Internet of Things (IoT)", slug: "internet-of-things-iot", category: "IoT", difficulty: Difficulty.INTERMEDIATE, duration: 30, price: 69, image: "photo-1518770660439-4636190af475", topics: ["IoT System Architecture", "Sensors and Microcontrollers", "Embedded Connectivity", "MQTT Messaging", "Edge Processing", "Cloud Device Management", "IoT Security", "Connected Device Project"], skills: ["IoT", "MQTT", "Sensors", "Embedded Systems", "Edge Computing", "Device Security"], prerequisites: ["Basic programming and electronics curiosity"], audience: "Builders connecting physical devices to dependable digital services." },
  { title: "Cloud-Native Full Stack Engineering", slug: "cloud-native-full-stack-engineering", category: "Cloud", difficulty: Difficulty.ADVANCED, duration: 44, price: 99, image: "photo-1451187580459-43490279c0fa", topics: ["Cloud-Native Principles", "Full Stack Service Boundaries", "Containers and Kubernetes", "Managed Data Services", "Event-Driven APIs", "Identity and Zero Trust", "Observability and SRE", "Cloud-Native Capstone"], skills: ["Cloud Native", "Kubernetes", "Microservices", "Event-Driven Systems", "DevSecOps", "SRE"], prerequisites: ["Full-stack development and cloud fundamentals"], audience: "Senior developers designing resilient, cloud-native products end to end." },
];

function chapterContent(course: CourseSpec, topic: string, index: number) {
  return `# ${topic}\n\n${course.title} module ${index} focuses on ${topic.toLowerCase()} in a practical engineering context.\n\n## Learning objectives\n- Explain the role of ${topic.toLowerCase()} in a complete ${course.category.toLowerCase()} workflow.\n- Apply the technique to a small, testable implementation.\n- Evaluate trade-offs and communicate a production-minded decision.\n\n## Practice\nBuild a focused exercise for ${course.title}, review the result against the module goals, and record one improvement for the capstone.`;
}

function questionFor(course: CourseSpec, topic: string, index: number) {
  const correct = topic;
  return {
    type: QuestionType.MCQ,
    body: `Which topic is directly covered in the ${index} module of ${course.title}?`,
    options: [
      { label: correct, value: correct },
      { label: "Unrelated project administration", value: "unrelated" },
      { label: "A deprecated tool with no course context", value: "deprecated" },
      { label: "An unrelated hardware specification", value: "hardware" },
    ],
    answer: correct,
    explanation: `${topic} is module ${index} in the ${course.title} learning sequence and connects to the course capstone.`,
    points: 1,
    order: index,
  };
}

export async function seedCourses(prisma: PrismaClient, instructorId: string) {
  const existing = await prisma.certification.findMany({ orderBy: { createdAt: "asc" } });
  const desiredSlugs = new Set(courses.map((course) => course.slug));
  const bySlug = new Map(existing.map((course) => [course.slug, course]));
  const extras = existing.filter((course) => !desiredSlugs.has(course.slug));
  const missing = courses.filter((course) => !bySlug.has(course.slug));

  if (extras.length > missing.length) {
    throw new Error(`Cannot reconcile ${existing.length} certifications to exactly 40 without deleting related records.`);
  }

  for (let index = 0; index < extras.length; index += 1) {
    const legacy = extras[index];
    const replacement = missing[index];
    await prisma.certification.update({
      where: { id: legacy.id },
      data: { slug: `migration-${legacy.id}` },
    });
    bySlug.set(replacement.slug, { ...legacy, slug: replacement.slug });
  }

  const seeded = new Map<string, { id: string }>();
  for (const course of courses) {
    const previous = bySlug.get(course.slug);
    const cert = previous
      ? await prisma.certification.update({
          where: { id: previous.id },
          data: {
            instructorId,
            title: course.title,
            slug: course.slug,
            description: `Build practical capability in ${course.title} through focused projects, guided practice, and industry-aligned assessment.`,
            longDescription: `This professional ${course.title} program takes learners through ${course.topics.join(", ")}. Target audience: ${course.audience}`,
            category: course.category,
            difficulty: course.difficulty,
            price: course.price,
            currency: "USD",
            status: CertStatus.PUBLISHED,
            thumbnail: thumbnail(course.image),
            learningOutcomes: course.topics.slice(0, 6).map((topic) => `Apply ${topic.toLowerCase()} to a practical ${course.title} project.`),
            prerequisites: course.prerequisites,
            targetAudience: course.audience,
            tags: course.skills,
            totalChapters: course.topics.length,
            duration: course.duration,
          },
        })
      : await prisma.certification.create({
          data: {
            instructorId,
            title: course.title,
            slug: course.slug,
            description: `Build practical capability in ${course.title} through focused projects, guided practice, and industry-aligned assessment.`,
            longDescription: `This professional ${course.title} program takes learners through ${course.topics.join(", ")}. Target audience: ${course.audience}`,
            category: course.category,
            difficulty: course.difficulty,
            price: course.price,
            currency: "USD",
            status: CertStatus.PUBLISHED,
            thumbnail: thumbnail(course.image),
            learningOutcomes: course.topics.slice(0, 6).map((topic) => `Apply ${topic.toLowerCase()} to a practical ${course.title} project.`),
            prerequisites: course.prerequisites,
            targetAudience: course.audience,
            tags: course.skills,
            totalChapters: course.topics.length,
            duration: course.duration,
          },
        });

    await prisma.chapter.deleteMany({ where: { certId: cert.id } });
    await prisma.chapter.createMany({
      data: course.topics.map((topic, index) => ({
        certId: cert.id,
        title: topic,
        order: index + 1,
        content: chapterContent(course, topic, index + 1),
        summary: `Apply ${topic.toLowerCase()} through a guided ${course.title} exercise.`,
      })),
    });

    for (const assessment of [
      { suffix: "quiz", title: `${course.title} Practice Quiz`, type: AssessmentType.QUIZ, passMark: 70, timeLimit: 20, maxAttempts: 5 },
      { suffix: "exam", title: `${course.title} Certification Exam`, type: AssessmentType.CERTIFICATION_EXAM, passMark: 70, timeLimit: 60, maxAttempts: 3 },
    ]) {
      const assessmentId = `asm_${course.slug.replace(/-/g, "_")}_${assessment.suffix}`;
      const assessmentRecord = await prisma.assessment.upsert({
        where: { id: assessmentId },
        update: {
          certId: cert.id,
          title: assessment.title,
          description: `Assess practical understanding of ${course.title} and its learning modules.`,
          type: assessment.type,
          passMark: assessment.passMark,
          timeLimit: assessment.timeLimit,
          randomize: true,
          maxAttempts: assessment.maxAttempts,
        },
        create: {
          id: assessmentId,
          certId: cert.id,
          title: assessment.title,
          description: `Assess practical understanding of ${course.title} and its learning modules.`,
          type: assessment.type,
          passMark: assessment.passMark,
          timeLimit: assessment.timeLimit,
          randomize: true,
          maxAttempts: assessment.maxAttempts,
        },
      });
      await prisma.question.deleteMany({ where: { assessmentId: assessmentRecord.id } });
      await prisma.question.createMany({
        data: course.topics.map((topic, index) => ({
          ...questionFor(course, topic, index + 1),
          assessmentId: assessmentRecord.id,
        })),
      });
    }
    seeded.set(course.slug, cert);
  }

  return seeded;
}

export { courses };
