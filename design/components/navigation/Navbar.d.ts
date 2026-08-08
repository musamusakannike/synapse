/**
 * @startingPoint section="Components" subtitle="Site header with nav links and CTA" viewport="700x90"
 */
export interface NavLink { label: string; href?: string; }
export interface NavbarProps {
  links?: NavLink[];
  active?: string;
  loggedIn?: boolean;
  onLogin?: () => void;
  onEnroll?: () => void;
}
export declare function Navbar(props: NavbarProps): JSX.Element;
