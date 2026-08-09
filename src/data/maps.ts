import type { KnowledgeMap } from "../types";

export const maps: KnowledgeMap[] = [
  {
    id: "m1",
    title: "The Habit Loop",
    category: "Productivity",
    root: "Habit Loop",
    emoji: "🔁",
    branches: [
      { label: "Cue", emoji: "🔔", points: ["Trigger that starts it", "Make it obvious", "Environment > willpower"] },
      { label: "Craving", emoji: "🧲", points: ["The wanting", "Make it attractive", "Bundle with something fun"] },
      { label: "Response", emoji: "⚡", points: ["The action itself", "Make it easy", "Reduce friction / 2-min rule"] },
      { label: "Reward", emoji: "🏆", points: ["Closes the loop", "Make it satisfying", "Track & celebrate"] },
    ],
  },
  {
    id: "m2",
    title: "Personal Finance",
    category: "Money",
    root: "Money Map",
    emoji: "💰",
    branches: [
      { label: "Earn", emoji: "💼", points: ["Grow skills = income", "Multiple streams", "Negotiate raises"] },
      { label: "Save", emoji: "🏦", points: ["Pay yourself first", "Emergency fund (3–6 mo)", "Automate transfers"] },
      { label: "Invest", emoji: "📈", points: ["Index funds", "Time in market", "Compounding"] },
      { label: "Protect", emoji: "🛡️", points: ["Insurance", "Avoid bad debt", "Diversify"] },
    ],
  },
  {
    id: "m3",
    title: "Fitness Foundations",
    category: "Fitness",
    root: "Get Strong",
    emoji: "💪",
    branches: [
      { label: "Train", emoji: "🏋️", points: ["Squat · hinge · push", "Pull · carry", "Progressive overload"] },
      { label: "Fuel", emoji: "🍳", points: ["Protein ~0.7g/lb", "Whole foods", "Hydrate"] },
      { label: "Recover", emoji: "😴", points: ["7–9h sleep", "Rest days", "Deload weeks"] },
      { label: "Consistency", emoji: "🔁", points: ["Don't miss twice", "Show up ugly", "Track progress"] },
    ],
  },
  {
    id: "m4",
    title: "Calm Toolkit",
    category: "Mindfulness",
    root: "Stay Calm",
    emoji: "🧘",
    branches: [
      { label: "Breath", emoji: "🌬️", points: ["4-7-8 pattern", "Long exhales", "Box breathing"] },
      { label: "Body", emoji: "🖐️", points: ["5-4-3-2-1 senses", "Relax shoulders", "Walk it off"] },
      { label: "Mind", emoji: "💭", points: ["Name the emotion", "Watch, don't fight", "This will pass"] },
      { label: "Habit", emoji: "🙏", points: ["Daily gratitude", "Morning routine", "Screen curfew"] },
    ],
  },
];
