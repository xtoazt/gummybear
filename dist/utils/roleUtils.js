export const ROLE_HIERARCHY = {
    king: 5,
    admin: 4,
    support: 3,
    twin: 2,
    bankinda: 1,
};
export function hasPermission(user, permission) {
    const rolePermissions = {
        king: ['all'],
        admin: ['manage_users', 'create_components', 'view_all', 'approve_requests'],
        support: ['use_ai', 'view_support', 'create_components'],
        twin: ['chat', 'view_kajigs'],
        bankinda: ['view_only'],
    };
    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes('all') || userPermissions.includes(permission);
}
export function canType(user) {
    return !['bankinda'].includes(user.role);
}
export function canApproveRequests(user) {
    return ['king', 'admin'].includes(user.role);
}
export function canCreateComponents(user) {
    return ['king', 'admin', 'support'].includes(user.role);
}
export function canManageUsers(user) {
    return ['king', 'admin'].includes(user.role);
}
export function canChangeRoles(user) {
    return user.role === 'king';
}
export function getRoleDisplayName(role) {
    const displayNames = {
        king: 'King 👑',
        admin: 'Admin ⚡',
        support: 'Support 🤖',
        twin: 'Twin 👥',
        bankinda: 'Bankinda 👀',
    };
    return displayNames[role] || role;
}
export function getRoleColor(role) {
    const colors = {
        king: '#ff6b6b',
        admin: '#4ecdc4',
        support: '#45b7d1',
        twin: '#96ceb4',
        bankinda: '#feca57',
    };
    return colors[role] || '#666';
}
