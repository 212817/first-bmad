// apps/web/src/components/layout/types.ts

/**
 * Profile menu item props
 */
export interface ProfileMenuItemProps {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

/**
 * Header props
 */
export interface HeaderProps {
  showProfileMenu?: boolean;
}
