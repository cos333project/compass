import { forwardRef, Ref, RefCallback } from 'react';

import classNames from 'classnames';

// import { Handle, Remove } from '../Item';

import styles from './Container.module.scss';

export type ContainerProps = {
  children: React.ReactNode;
  columns?: number;
  label?: string | React.ReactNode;
  style?: React.CSSProperties;
  horizontal?: boolean;
  hover?: boolean;
  handleProps?: React.HTMLAttributes<HTMLDivElement | HTMLButtonElement>;
  scrollable?: boolean;
  shadow?: boolean;
  placeholder?: boolean;
  unstyled?: boolean;
  height?: string | number;
  onClick?(): void;
  onRemove?(): void;
};

export const Container = forwardRef<HTMLDivElement | HTMLButtonElement, ContainerProps>(
  (
    {
      children,
      columns = 1,
      // handleProps, // TODO: remove permanently?
      horizontal,
      hover,
      onClick,
      // onRemove, // TODO: remove permanently?
      label,
      placeholder,
      style,
      scrollable,
      shadow,
      unstyled,
      height,
      ...props
    }: ContainerProps,
    ref: Ref<HTMLDivElement | HTMLButtonElement>
  ) => {
    const Component = onClick ? 'button' : 'div';
    const setRef: RefCallback<HTMLDivElement | HTMLButtonElement> = (instance) => {
      if (typeof ref === 'function') {
        ref(instance);
      }
    };

    return (
      <Component
        {...props}
        ref={setRef}
        style={
          {
            ...style,
            '--columns': columns,
            height: height,
          } as React.CSSProperties
        }
        className={classNames(
          styles.Container,
          unstyled && styles.unstyled,
          horizontal && styles.horizontal,
          hover && styles.hover,
          placeholder && styles.placeholder,
          scrollable && styles.scrollable,
          shadow && styles.shadow
        )}
        onClick={onClick}
        tabIndex={onClick ? 0 : undefined}
      >
        {label ? (
          <div className={styles.Header}>
            {label}
            {/* <div className={styles.Actions}>
              {onRemove ? <Remove onClick={onRemove} /> : undefined}
              <Handle {...handleProps} />
            </div> */}
          </div>
        ) : null}
        {placeholder ? children : <ul>{children}</ul>}
      </Component>
    );
  }
);

Container.displayName = 'Container';
