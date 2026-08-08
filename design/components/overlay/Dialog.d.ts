import { ReactNode } from "react";
/**
 * @startingPoint section="Components" subtitle="Centered modal dialog" viewport="700x260"
 */
export interface DialogProps {
  open: boolean;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
}
export declare function Dialog(props: DialogProps): JSX.Element;
