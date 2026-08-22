import { VOCABULARY_CATEGORIES, VOCABULARY_WORDS } from "../../data/vocabulary";
import { CardGrid, Screen, Subtitle, Title } from "../../components/ui/Screen";
import { BackRow, WordCard, WordIcon, WordLabel } from "./VocabularyWordList.styles";

interface Props {
  categoryId: string;
  onBack: () => void;
}

export function VocabularyWordList({ categoryId, onBack }: Props) {
  const category = VOCABULARY_CATEGORIES.find((candidate) => candidate.id === categoryId);
  const words = VOCABULARY_WORDS.filter((word) => word.categoryId === categoryId);

  return (
    <Screen>
      <BackRow type="button" onClick={onBack} aria-label="Back to categories">
        ← Categories
      </BackRow>
      <Title>
        {category?.emoji} {category?.label}
      </Title>
      <Subtitle>Tap around and learn the words!</Subtitle>
      <CardGrid>
        {words.map((word) => (
          <WordCard key={word.id}>
            <WordIcon src={word.icon} alt="" />
            <WordLabel>{word.word}</WordLabel>
          </WordCard>
        ))}
      </CardGrid>
    </Screen>
  );
}
