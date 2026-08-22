import { VOCABULARY_CATEGORIES } from "../../data/vocabulary";
import { CardGrid, Screen, Subtitle, Title } from "../../components/ui/Screen";
import { CategoryCard, CategoryEmoji } from "./VocabularyCategories.styles";

interface Props {
  onSelect: (categoryId: string) => void;
}

export function VocabularyCategories({ onSelect }: Props) {
  return (
    <Screen>
      <Title>Vocabulary 📚</Title>
      <Subtitle>Pick a category to explore</Subtitle>
      <CardGrid>
        {VOCABULARY_CATEGORIES.map((category, index) => (
          <CategoryCard
            key={category.id}
            type="button"
            $index={index}
            onClick={() => onSelect(category.id)}
          >
            <CategoryEmoji aria-hidden="true">{category.emoji}</CategoryEmoji>
            {category.label}
          </CategoryCard>
        ))}
      </CardGrid>
    </Screen>
  );
}
