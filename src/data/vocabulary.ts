import type { VocabularyCategory, VocabularyWord } from "../types/vocabulary";

export const VOCABULARY_CATEGORIES: VocabularyCategory[] = [
  { id: "animals", label: "Animals", emoji: "🐾" },
  { id: "places", label: "Places", emoji: "📍" },
  { id: "verbs", label: "Verbs", emoji: "🏃" },
  { id: "colors", label: "Colors", emoji: "🎨" },
];

const ICON_BASE = "/vocabulary/icons";

export const VOCABULARY_WORDS: VocabularyWord[] = [
  { id: "cat", categoryId: "animals", word: "Cat", icon: `${ICON_BASE}/cat.svg` },
  { id: "dog", categoryId: "animals", word: "Dog", icon: `${ICON_BASE}/dog.svg` },
  { id: "bird", categoryId: "animals", word: "Bird", icon: `${ICON_BASE}/bird.svg` },
  { id: "fish", categoryId: "animals", word: "Fish", icon: `${ICON_BASE}/fish.svg` },
  { id: "lion", categoryId: "animals", word: "Lion", icon: `${ICON_BASE}/lion.svg` },
  { id: "rabbit", categoryId: "animals", word: "Rabbit", icon: `${ICON_BASE}/rabbit.svg` },

  { id: "house", categoryId: "places", word: "House", icon: `${ICON_BASE}/house.svg` },
  { id: "school", categoryId: "places", word: "School", icon: `${ICON_BASE}/school.svg` },
  { id: "park", categoryId: "places", word: "Park", icon: `${ICON_BASE}/park.svg` },
  { id: "beach", categoryId: "places", word: "Beach", icon: `${ICON_BASE}/beach.svg` },
  { id: "farm", categoryId: "places", word: "Farm", icon: `${ICON_BASE}/farm.svg` },
  { id: "city", categoryId: "places", word: "City", icon: `${ICON_BASE}/city.svg` },

  { id: "run", categoryId: "verbs", word: "Run", icon: `${ICON_BASE}/run.svg` },
  { id: "jump", categoryId: "verbs", word: "Jump", icon: `${ICON_BASE}/jump.svg` },
  { id: "eat", categoryId: "verbs", word: "Eat", icon: `${ICON_BASE}/eat.svg` },
  { id: "sleep", categoryId: "verbs", word: "Sleep", icon: `${ICON_BASE}/sleep.svg` },
  { id: "swim", categoryId: "verbs", word: "Swim", icon: `${ICON_BASE}/swim.svg` },
  { id: "read", categoryId: "verbs", word: "Read", icon: `${ICON_BASE}/read.svg` },

  { id: "red", categoryId: "colors", word: "Red", icon: `${ICON_BASE}/red.svg` },
  { id: "blue", categoryId: "colors", word: "Blue", icon: `${ICON_BASE}/blue.svg` },
  { id: "green", categoryId: "colors", word: "Green", icon: `${ICON_BASE}/green.svg` },
  { id: "yellow", categoryId: "colors", word: "Yellow", icon: `${ICON_BASE}/yellow.svg` },
  { id: "purple", categoryId: "colors", word: "Purple", icon: `${ICON_BASE}/purple.svg` },
  { id: "orange", categoryId: "colors", word: "Orange", icon: `${ICON_BASE}/orange.svg` },
];
