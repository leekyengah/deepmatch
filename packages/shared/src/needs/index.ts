import bank from "./question-bank-vi.json";

export type NeedsQuestion = {
  id: string;
  group: string;
  promptVi: string;
  answerType: string;
  branch: string;
  privacy: string;
  specStatus: string;
  implStatus: string;
  note?: string;
};

export const NEEDS_QUESTION_BANK_VI = bank as NeedsQuestion[];
export const NEEDS_QUESTION_COUNT = NEEDS_QUESTION_BANK_VI.length;
