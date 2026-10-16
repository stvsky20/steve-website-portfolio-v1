// Replace the sample identity, projects, and links here before publishing.
export const profile = {
  name: "Your Name",
  initials: "YN",
  email: "",
  github: "",
  linkedin: "",
  bio: "I like the space where a good idea becomes a working product. My approach connects hands-on development with clear plans, thoughtful communication, and a focus on the people who will use what we build.",
};
export type Project = {
  id: string;
  title: string;
  subtitle: string;
  category: "Development" | "Leadership";
  type: string;
  color: string;
  tags: string[];
  summary: string;
  challenge: string;
  approach: string;
  outcome: string;
};
export const projects: Project[] = [
  {
    id: "orbit",
    title: "Orbit",
    subtitle: "Less juggling. More momentum.",
    category: "Development",
    type: "PRODUCT DESIGN / FULLSTACK",
    color: "lilac",
    tags: ["Next.js", "TypeScript", "PostgreSQL"],
    summary:
      "An illustrative workspace for teams to turn scattered tasks into a clear delivery plan.",
    challenge:
      "Show how a single workspace could connect priorities, ownership, and project progress without adding more administrative work.",
    approach:
      "The concept brings a simple task board, shared milestones, and a delivery overview into one product. A real case study would explain the architecture, implementation, and decisions behind it.",
    outcome:
      "Sample concept only. Replace this section with your actual shipped product, contribution, and verified results.",
  },
  {
    id: "forma",
    title: "Forma",
    subtitle: "A better kind of storefront.",
    category: "Development",
    type: "E-COMMERCE / DEVELOPMENT",
    color: "peach",
    tags: ["React", "API integration", "Commerce"],
    summary:
      "An illustrative commerce experience with a considered product story and a focused shopping journey.",
    challenge:
      "Explore how product discovery can feel expressive while keeping navigation and purchase decisions clear.",
    approach:
      "The concept pairs an editorial product presentation with simple product information. Your real case study can describe API integration, performance, and how the purchase flow was built.",
    outcome:
      "Sample concept only. No sales or performance results are claimed. Add your actual project evidence here.",
  },
  {
    id: "launch",
    title: "Launchpad",
    subtitle: "A plan that moves things forward.",
    category: "Leadership",
    type: "PROJECT STRATEGY / DELIVERY",
    color: "blue",
    tags: ["Roadmapping", "Agile delivery", "Stakeholders"],
    summary:
      "An illustrative delivery plan that connects discovery, development, and launch.",
    challenge:
      "Make dependencies and responsibilities understandable across a cross-functional product team.",
    approach:
      "The concept maps a project into milestones with explicit owners, decisions, and handovers. Replace it with a real example of how you managed scope, risks, and communication.",
    outcome:
      "Sample concept only. Add your actual team context, delivery responsibilities, and outcomes before publishing.",
  },
];
