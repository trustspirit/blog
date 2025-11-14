import React from 'react';
import clsx from 'clsx';
import styles from './TextField.module.scss';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  className,
  id,
  ...props
}) => {
  const inputId = id || `textfield-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={clsx(styles.container, fullWidth && styles.fullWidth)}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          styles.input,
          error && styles.error,
          className
        )}
        {...props}
      />
      {(error || helperText) && (
        <span className={clsx(styles.helperText, error && styles.errorText)}>
          {error || helperText}
        </span>
      )}
    </div>
  );
};
