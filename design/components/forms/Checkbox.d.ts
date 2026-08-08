/**
 * @startingPoint section="Components" subtitle="Custom checkbox, gold checked state" viewport="700x100"
 */
export interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}
export declare function Checkbox(props: CheckboxProps): JSX.Element;
