/**
 * Platform detection based on Vite build mode
 */
export const isDesktopApp = import.meta.env.MODE === 'app';
export const isWebApp = import.meta.env.MODE === 'web' || import.meta.env.MODE === 'development';

/**
 * Defined roles authorized for the active platform
 */
export const platformRoles = isDesktopApp 
  ? (['admin', 'teacher'] as const)
  : (['teacher', 'parent'] as const);

export type PlatformRole = (typeof platformRoles)[number];