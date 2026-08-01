import React from 'react';
export interface XPPillProps {
  amount: number;
  /** show a leading + as a reward delta, vs a running total */
  delta?: boolean;
}
export function XPPill(props: XPPillProps): JSX.Element;
