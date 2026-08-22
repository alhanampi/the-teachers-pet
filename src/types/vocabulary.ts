export interface VocabularyCategory {
  id: string;
  label: string;
  emoji: string;
}

export interface VocabularyWord {
  id: string;
  categoryId: string;
  word: string;
  icon: string;
  antonymPairs?: Array<[string, string]>;
  colorExamples?: string[];
}
