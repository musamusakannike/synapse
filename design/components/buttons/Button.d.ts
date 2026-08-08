import { ReactNode, ButtonHTMLAttributes } from "react";

/**
 * @startingPoint section="Components" subtitle="Primary action button, four variants" viewport="700x160"
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "ai";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  children?: ReactNode;
}
export declare function Button(props: ButtonProps): JSX.Element;
