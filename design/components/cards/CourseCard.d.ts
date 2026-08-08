/**
 * @startingPoint section="Components" subtitle="Course thumbnail card, price/progress" viewport="700x360"
 */
export interface CourseCardProps {
  image?: string;
  level?: string;
  title: string;
  instructor?: string;
  price?: number;
  free?: boolean;
  progress?: number;
  dark?: boolean;
}
export declare function CourseCard(props: CourseCardProps): JSX.Element;
