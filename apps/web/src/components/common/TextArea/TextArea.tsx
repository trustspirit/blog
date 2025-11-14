import React from 'react';
import clsx from 'clsx';
import styles from './TextArea.module.scss';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  className,
  id,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={clsx(styles.container, fullWidth && styles.fullWidth)}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={clsx(
          styles.textarea,
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
