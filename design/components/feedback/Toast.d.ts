import { ReactNode } from "react";
/**
 * @startingPoint section="Components" subtitle="Inline notification toast" viewport="700x100"
 */
export interface ToastProps {
  children?: ReactNode;
  tone?: "info" | "success" | "danger";
  onClose?: () => void;
}
export declare function Toast(props: ToastProps): JSX.Element;
