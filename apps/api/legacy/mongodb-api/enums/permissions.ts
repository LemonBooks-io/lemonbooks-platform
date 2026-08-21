export const Permissions = {
    ALL: 'All',
    CREATE_ADMIN: 'Create Admin',
    DELETE_ADMIN: 'Delete Admin',
    EDIT_ADMIN: 'Edit Admin',
    CREATE_CUSTOMER: 'Create Customer',
    DELETE_CUSTOMER: 'Delete Customer',
    EDIT_CUSTOMER: 'Edit Customer',
    CREATE_SERVICE: 'Create Service',
    DELETE_SERVICE: 'Delete Service',
    UPDATE_SERVICE: 'Update Service',
    DISABLE_SERVICE: 'Disable Service',
    VIEW_CUSTOMER: 'View Customer',
    VIEW_ADMIN: 'View Admin',
    CREATE_BUSINESS: 'Create Business',
    EDIT_BUSINESS: 'Edit Business',
    DELETE_BUSINESS: 'Delete Business'
  } as const;
  
  export type Permission = typeof Permissions[keyof typeof Permissions];
  

  // Step 2: Define Target Mapping
const PermissionTargets: Record<Permission, string> = {
  All: "System",
  "Create Admin": "Generic",
  "Delete Admin": "Generic",
  "Edit Admin": "Generic",
  "Create Customer": "Generic",
  "Delete Customer": "Generic",
  "Edit Customer": "Generic",
  "Create Service": "System",
  "Delete Service": "System",
  "Update Service": "System",
  "Disable Service": "System",
  "View Customer": "Generic",
  "View Admin": "Generic",
  "Create Business": "System",
  "Edit Business": "System",
  "Delete Business": "System"
};

// Build the permission array
export const permissionObjects = Object.values(Permissions).map(permission => ({
  permission,
  target: PermissionTargets[permission]
}));

export const allPermissions: Permission[] = Object.values(Permissions);