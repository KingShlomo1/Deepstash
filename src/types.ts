export type Category =
  | "Mindfulness"
  | "Productivity"
  | "Money"
  | "Health"
  | "Psychology"
  | "Leadership"
  | "Creativity"
  | "Fitness"
  | "Science";

export interface Idea {
  id: string;
  title: string;
  text: string;
  source: string;
  category: Category;
  emoji: string;
  readSeconds: number;
}

export interface StorySlide {
  emoji: string;
  heading: string;
  body: string;
}

export interface Story {
  id: string;
  title: string;
  author: string;
  gradient: [string, string];
  emoji: string;
  slides: StorySlide[];
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  category: Category;
  emoji: string;
  minutes: number;
  questions: QuizQuestion[];
}

export interface MapBranch {
  label: string;
  emoji: string;
  points: string[];
}

export interface KnowledgeMap {
  id: string;
  title: string;
  category: Category;
  root: string;
  emoji: string;
  branches: MapBranch[];
}

export type VideoSource = "youtube" | "instagram";

export interface Video {
  id: string;
  title: string;
  creator: string;
  source: VideoSource;
  /** YouTube video id, or Instagram permalink for instagram source */
  ref: string;
  duration: string;
  category: Category;
  focus: string;
}
