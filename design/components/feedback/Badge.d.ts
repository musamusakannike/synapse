import { ReactNode } from "react";
/**
 * @startingPoint section="Components" subtitle="Status pill, 7 tones" viewport="700x100"
 */
export interface BadgeProps {
  children?: ReactNode;
  tone?: "gold" | "violet" | "success" | "danger" | "warning" | "neutral" | "dark";
}
export declare function Badge(props: BadgeProps): JSX.Element;
