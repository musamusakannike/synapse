/**
 * @startingPoint section="Components" subtitle="Segmented tab switcher" viewport="700x100"
 */
export interface TabItem { label: string; value: string; }
export interface TabsProps {
  tabs: TabItem[];
  active?: string;
  onChange?: (value: string) => void;
}
export declare function Tabs(props: TabsProps): JSX.Element;
