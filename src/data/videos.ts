import type { Video } from "../types";

/**
 * Workout & movement videos.
 *
 * YouTube items embed by video id (`ref`). Instagram items open the creator's
 * profile/reel (`ref` = handle) since Instagram blocks most inline embeds.
 *
 * Every card also exposes an "open externally" link built from the title, so
 * even if a specific id changes the content is always one tap away.
 *
 * Swap the `ref` values for your own curated videos any time — see README.
 */
export const videos: Video[] = [
  {
    id: "v1",
    title: "10 Min Full Body — No Equipment",
    creator: "MadFit",
    source: "youtube",
    ref: "cbKkB3POqaY",
    duration: "10:00",
    category: "Fitness",
    focus: "Full body",
  },
  {
    id: "v2",
    title: "15 Min Beginner Ab Workout",
    creator: "growwithjo",
    source: "youtube",
    ref: "ml6cT4AZdqI",
    duration: "15:00",
    category: "Fitness",
    focus: "Core",
  },
  {
    id: "v3",
    title: "20 Min Full Body HIIT — No Repeat",
    creator: "growingannanas",
    source: "youtube",
    ref: "cZnsLVArIt8",
    duration: "20:00",
    category: "Fitness",
    focus: "HIIT",
  },
  {
    id: "v4",
    title: "Mobility Flow to Undo Sitting",
    creator: "Tom Merrick",
    source: "youtube",
    ref: "0e2z1i4pT2M",
    duration: "12:00",
    category: "Health",
    focus: "Mobility",
  },
  {
    id: "v5",
    title: "Reel: 3 Moves for Stronger Glutes",
    creator: "@syattfitness",
    source: "instagram",
    ref: "syattfitness",
    duration: "0:45",
    category: "Fitness",
    focus: "Glutes",
  },
  {
    id: "v6",
    title: "Reel: Perfect Push-Up Form",
    creator: "@thereadyathletic",
    source: "instagram",
    ref: "achievefitnessboston",
    duration: "0:30",
    category: "Fitness",
    focus: "Technique",
  },
  {
    id: "v7",
    title: "10 Min Morning Yoga Stretch",
    creator: "Yoga With Adriene",
    source: "youtube",
    ref: "4pKly2JojMw",
    duration: "10:00",
    category: "Mindfulness",
    focus: "Yoga",
  },
  {
    id: "v8",
    title: "Reel: 60-Second Desk Reset",
    creator: "@doctor.jordan.dpt",
    source: "instagram",
    ref: "doctorjordandpt",
    duration: "1:00",
    category: "Health",
    focus: "Posture",
  },
];
