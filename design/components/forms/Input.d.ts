import { InputHTMLAttributes } from "react";
/**
 * @startingPoint section="Components" subtitle="Labeled text field with help/error text" viewport="700x140"
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}
export declare function Input(props: InputProps): JSX.Element;
