/**
 * @startingPoint section="Components" subtitle="Toggle, violet on-state" viewport="700x100"
 */
export interface SwitchProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}
export declare function Switch(props: SwitchProps): JSX.Element;
