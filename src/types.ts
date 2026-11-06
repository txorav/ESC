export interface WordData {
  word: string;
  phonetic: string;
  pos: string;
  def: string;
  ex: string;
  syn: string[];
  origin: string;
  rule: string;
}

export interface DeskItemState {
  x: number;
  y: number;
  gone: boolean;
}

export interface ModalContent {
  title: string;
  subtitle: string;
  body: string;
}
