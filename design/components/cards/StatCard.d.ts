/**
 * @startingPoint section="Components" subtitle="Dashboard metric card" viewport="700x150"
 */
export interface StatCardProps {
  value: string | number;
  label: string;
  trend?: string;
}
export declare function StatCard(props: StatCardProps): JSX.Element;
