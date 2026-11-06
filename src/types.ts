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

export type DeskItemType = 'radio' | 'mic' | 'pen' | 'dict' | 'gram' | 'prn';

export interface DeskItemInstance {
  instanceId: string;
  type: DeskItemType;
  x: number;
  y: number;
  rotation?: number;
}

export interface ModalContent {
  title: string;
  subtitle: string;
  body: string;
}
