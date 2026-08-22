import { Modal } from "../../components/ui/Modal";
import type { VocabularyWord } from "../../types/vocabulary";
import {
  ExampleChip,
  ExampleGrid,
  Icon,
  IconWrap,
  PairDivider,
  PairList,
  PairRow,
  PairWord,
  SectionLabel,
} from "./VocabularyWordDetail.styles";

interface Props {
  word: VocabularyWord;
  onClose: () => void;
}

export function VocabularyWordDetail({ word, onClose }: Props) {
  return (
    <Modal title={word.word} onClose={onClose}>
      <IconWrap>
        <Icon src={word.icon} alt="" />
      </IconWrap>
      {word.antonymPairs && (
        <>
          <SectionLabel>Opposites</SectionLabel>
          <PairList>
            {word.antonymPairs.map(([a, b]) => (
              <PairRow key={`${a}-${b}`}>
                <PairWord>{a}</PairWord>
                <PairDivider>↔</PairDivider>
                <PairWord>{b}</PairWord>
              </PairRow>
            ))}
          </PairList>
        </>
      )}
      {word.colorExamples && (
        <>
          <SectionLabel>Things that are {word.word.toLowerCase()}</SectionLabel>
          <ExampleGrid>
            {word.colorExamples.map((example) => (
              <ExampleChip key={example}>{example}</ExampleChip>
            ))}
          </ExampleGrid>
        </>
      )}
    </Modal>
  );
}
