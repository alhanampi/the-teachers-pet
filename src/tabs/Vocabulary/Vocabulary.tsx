import { useState } from "react";
import { VocabularyCategories } from "../VocabularyCategories";
import { VocabularyWordList } from "../VocabularyWordList";

export function Vocabulary() {
  const [categoryId, setCategoryId] = useState<string | null>(null);

  if (categoryId) {
    return <VocabularyWordList categoryId={categoryId} onBack={() => setCategoryId(null)} />;
  }

  return <VocabularyCategories onSelect={setCategoryId} />;
}
