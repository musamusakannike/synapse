/**
 * @startingPoint section="Components" subtitle="Course/quiz completion bar" viewport="700x100"
 */
export interface ProgressBarProps {
  value?: number;
  max?: number;
  tone?: "gold" | "violet" | "success";
  label?: string;
}
export declare function ProgressBar(props: ProgressBarProps): JSX.Element;
