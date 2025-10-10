import React, { createContext, useContext, useState, useEffect } from 'react';
import { ModulePermission } from '../types/client';

interface PermissionContextType {
  permissions: ModulePermission[];
  hasPermission: (module: string, action: 'read' | 'write' | 'delete' | 'admin') => boolean;
  hasRestriction: (module: string, restriction: string) => boolean;
  setPermissions: (permissions: ModulePermission[]) => void;
  setDemoAdminMode: () => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

// Default permissions - all modules disabled by default for security
const defaultPermissions: ModulePermission[] = [
  {
    module: 'clients',
    permissions: { read: true, write: false, delete: false, admin: false },
    restrictions: { viewPersonalDataOnly: false, accessToSecretData: false }
  },
  {
    module: 'invoices',
    permissions: { read: false, write: false, delete: false, admin: false },
    restrictions: { accessToFinancialData: false }
  },
  {
    module: 'email',
    permissions: { read: true, write: true, delete: false, admin: false }
  },
  {
    module: 'chat',
    permissions: { read: true, write: true, delete: false, admin: false },
    restrictions: { accessToFullChatHistory: false }
  },
  {
    module: 'calendar',
    permissions: { read: true, write: true, delete: false, admin: false }
  },
  {
    module: 'ceidg',
    permissions: { read: false, write: false, delete: false, admin: false }
  },
  {
    module: 'reports',
    permissions: { read: false, write: false, delete: false, admin: false }
  },
  {
    module: 'settings',
    permissions: { read: false, write: false, delete: false, admin: false }
  },
  {
    module: 'user_management',
    permissions: { read: false, write: false, delete: false, admin: false },
    restrictions: { manageOtherUsers: false }
  }
];

// Demo admin permissions - full access to all modules for demo purposes
export const demoAdminPermissions: ModulePermission[] = [
  {
    module: 'clients',
    permissions: { read: true, write: true, delete: true, admin: true },
    restrictions: { viewPersonalDataOnly: false, accessToSecretData: true }
  },
  {
    module: 'invoices',
    permissions: { read: true, write: true, delete: true, admin: true },
    restrictions: { accessToFinancialData: true }
  },
  {
    module: 'email',
    permissions: { read: true, write: true, delete: true, admin: true }
  },
  {
    module: 'chat',
    permissions: { read: true, write: true, delete: true, admin: true },
    restrictions: { accessToFullChatHistory: true }
  },
  {
    module: 'calendar',
    permissions: { read: true, write: true, delete: true, admin: true }
  },
  {
    module: 'ceidg',
    permissions: { read: true, write: true, delete: true, admin: true }
  },
  {
    module: 'reports',
    permissions: { read: true, write: true, delete: true, admin: true }
  },
  {
    module: 'settings',
    permissions: { read: true, write: true, delete: true, admin: true }
  },
  {
    module: 'user_management',
    permissions: { read: true, write: true, delete: true, admin: true },
    restrictions: { manageOtherUsers: true }
  }
];

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<ModulePermission[]>(defaultPermissions);

  useEffect(() => {
    // Load permissions from localStorage or API
    const savedPermissions = localStorage.getItem('user_permissions');
    if (savedPermissions) {
      try {
        setPermissions(JSON.parse(savedPermissions));
      } catch (error) {
        console.error('Error loading permissions:', error);
      }
    }
  }, []);

  const hasPermission = (module: string, action: 'read' | 'write' | 'delete' | 'admin'): boolean => {
    const modulePermission = permissions.find(p => p.module === module);
    return modulePermission ? modulePermission.permissions[action] : false;
  };

  const hasRestriction = (module: string, restriction: string): boolean => {
    const modulePermission = permissions.find(p => p.module === module);
    return modulePermission?.restrictions ? 
      modulePermission.restrictions[restriction] === true : false;
  };

  const updatePermissions = (newPermissions: ModulePermission[]) => {
    setPermissions(newPermissions);
    localStorage.setItem('user_permissions', JSON.stringify(newPermissions));
  };

  const setDemoAdminMode = () => {
    setPermissions(demoAdminPermissions);
    localStorage.setItem('user_permissions', JSON.stringify(demoAdminPermissions));
  };

  return (
    <PermissionContext.Provider value={{
      permissions,
      hasPermission,
      hasRestriction,
      setPermissions: updatePermissions,
      setDemoAdminMode
    }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};