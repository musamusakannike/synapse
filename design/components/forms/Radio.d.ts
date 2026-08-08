/**
 * @startingPoint section="Components" subtitle="Custom radio, gold selected state" viewport="700x100"
 */
export interface RadioProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}
export declare function Radio(props: RadioProps): JSX.Element;
