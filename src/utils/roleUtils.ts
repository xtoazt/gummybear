import type { User } from '../types';

export const ROLE_HIERARCHY = {
  king: 5,
  admin: 4,
  support: 3,
  twin: 2,
  bankinda: 1,
} as const;

export type Role = keyof typeof ROLE_HIERARCHY;

export function hasPermission(user: User, permission: string): boolean {
  const rolePermissions: Record<Role, string[]> = {
    king: ['all'],
    admin: ['manage_users', 'create_components', 'view_all', 'approve_requests'],
    support: ['use_ai', 'view_support', 'create_components'],
    twin: ['chat', 'view_kajigs'],
    bankinda: ['view_only'],
  };

  const userPermissions = rolePermissions[user.role] || [];
  return userPermissions.includes('all') || userPermissions.includes(permission);
}

export function canType(user: User): boolean {
  return !['bankinda'].includes(user.role);
}

export function canApproveRequests(user: User): boolean {
  return ['king', 'admin'].includes(user.role);
}

export function canCreateComponents(user: User): boolean {
  return ['king', 'admin', 'support'].includes(user.role);
}

export function canManageUsers(user: User): boolean {
  return ['king', 'admin'].includes(user.role);
}

export function canChangeRoles(user: User): boolean {
  return user.role === 'king';
}

export function getRoleDisplayName(role: Role): string {
  const displayNames: Record<Role, string> = {
    king: 'King 👑',
    admin: 'Admin ⚡',
    support: 'Support 🤖',
    twin: 'Twin 👥',
    bankinda: 'Bankinda 👀',
  };
  return displayNames[role] || role;
}

export function getRoleColor(role: Role): string {
  const colors: Record<Role, string> = {
    king: '#ff6b6b',
    admin: '#4ecdc4',
    support: '#45b7d1',
    twin: '#96ceb4',
    bankinda: '#feca57',
  };
  return colors[role] || '#666';
}
