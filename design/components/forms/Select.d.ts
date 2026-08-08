/**
 * @startingPoint section="Components" subtitle="Native dropdown, labeled" viewport="700x120"
 */
export interface SelectOption { label?: string; value?: string; }
export interface SelectProps {
  label?: string;
  options?: (SelectOption | string)[];
  value?: string;
  onChange?: (e: any) => void;
  disabled?: boolean;
  placeholder?: string;
}
export declare function Select(props: SelectProps): JSX.Element;
