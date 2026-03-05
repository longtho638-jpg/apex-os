'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface TenantConfig {
  id: string;
  name: string;
  theme_config: {
    primaryColor: string;
    logoUrl: string;
  };
}

const TenantContext = createContext<TenantConfig | null>(null);

export function useTenant() {
  return useContext(TenantContext);
}

export function TenantProvider({
  children,
  initialTenant,
}: {
  children: React.ReactNode;
  initialTenant?: TenantConfig;
}) {
  const [tenant, _setTenant] = useState<TenantConfig | null>(initialTenant || null);

  useEffect(() => {
    if (tenant?.theme_config?.primaryColor) {
      document.documentElement.style.setProperty('--primary', tenant.theme_config.primaryColor);
      // You might want to calculate darker/lighter shades here
    }
  }, [tenant]);

  return <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>;
}
