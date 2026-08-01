import React from 'react';
export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}
export function Switch(props: SwitchProps): JSX.Element;
