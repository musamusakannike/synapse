import React from 'react';
export interface RadioProps {
  label?: string;
  checked?: boolean;
  onChange?: () => void;
}
export function Radio(props: RadioProps): JSX.Element;
