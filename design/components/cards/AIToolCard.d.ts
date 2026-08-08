import { ReactNode } from "react";
/**
 * @startingPoint section="Components" subtitle="Violet AI-feature card (Summarizer, Quiz, Flashcards, Q&A)" viewport="700x260"
 */
export interface AIToolCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  cta?: string;
  onClick?: () => void;
}
export declare function AIToolCard(props: AIToolCardProps): JSX.Element;
