import type { Quiz } from "../types";

export const quizzes: Quiz[] = [
  {
    id: "q1",
    title: "Habits & Behavior",
    category: "Productivity",
    emoji: "🔁",
    minutes: 3,
    questions: [
      {
        q: "According to Atomic Habits, every action is a vote for...",
        options: ["A bigger goal", "The person you want to become", "Instant rewards", "Your willpower"],
        answer: 1,
        explanation: "Habits are identity in action. Each rep casts a vote for the type of person you're becoming.",
      },
      {
        q: "The '2-minute rule' says you should...",
        options: ["Meditate for 2 minutes", "Do any task under 2 minutes immediately", "Rest 2 minutes between tasks", "Plan for 2 minutes"],
        answer: 1,
        explanation: "Knocking out sub-2-minute tasks on the spot prevents small things from snowballing.",
      },
      {
        q: "Improving 1% every day makes you roughly how much better in a year?",
        options: ["2× better", "10× better", "37× better", "100× better"],
        answer: 2,
        explanation: "1.01^365 ≈ 37.8. Tiny gains compound dramatically over time.",
      },
      {
        q: "The best way to make a habit stick is to make the cue...",
        options: ["Hidden", "Obvious", "Painful", "Random"],
        answer: 1,
        explanation: "Make it obvious: design your environment so the right cue is in your path.",
      },
    ],
  },
  {
    id: "q2",
    title: "Money Basics",
    category: "Money",
    emoji: "💰",
    minutes: 3,
    questions: [
      {
        q: "'Pay yourself first' means...",
        options: ["Buy what you want first", "Save/invest before spending", "Pay debts last", "Tip yourself"],
        answer: 1,
        explanation: "Move money to savings/investments automatically before any spending happens.",
      },
      {
        q: "Real wealth is best described as...",
        options: ["Visible luxury goods", "A high salary", "Assets you didn't spend", "Your credit limit"],
        answer: 2,
        explanation: "Wealth is invisible — the money kept and invested, not converted into stuff.",
      },
      {
        q: "'Lifestyle creep' is when...",
        options: ["Prices rise", "Spending rises with income", "You move cities", "Rent increases"],
        answer: 1,
        explanation: "As income grows, spending quietly grows to match it — banking raises fights this.",
      },
      {
        q: "The bigger driver of long-term returns is usually...",
        options: ["Timing the market", "Time in the market", "Picking hot stocks", "Day trading"],
        answer: 1,
        explanation: "Consistent, long-term investing lets compounding do the heavy lifting.",
      },
    ],
  },
  {
    id: "q3",
    title: "Body & Brain",
    category: "Health",
    emoji: "🧠",
    minutes: 3,
    questions: [
      {
        q: "The 4-7-8 breath calms you by...",
        options: ["Raising heart rate", "Lengthening the exhale", "Holding your breath forever", "Hyperventilating"],
        answer: 1,
        explanation: "A long exhale activates the parasympathetic 'rest and digest' system.",
      },
      {
        q: "'Zone 2' cardio is a pace where you can...",
        options: ["Barely breathe", "Still hold a conversation", "Sprint all-out", "Only walk"],
        answer: 1,
        explanation: "Conversational pace builds your aerobic base and mitochondria efficiently.",
      },
      {
        q: "For memory, which beats cramming?",
        options: ["Spaced repetition", "All-nighters", "Rereading once", "Highlighting"],
        answer: 0,
        explanation: "Spacing study across days with sleep between locks knowledge into long-term memory.",
      },
      {
        q: "Progressive overload means...",
        options: ["Lifting max every day", "Slightly increasing demand over time", "Never resting", "Only cardio"],
        answer: 1,
        explanation: "Muscle adapts when you ask a little more of it than last time.",
      },
    ],
  },
];
