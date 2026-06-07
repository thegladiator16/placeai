'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser as useClerkUser } from '@clerk/nextjs';
import { PLAN_LIMITS } from '@placeai/types';
import type { User } from '@placeai/db';
import type { FeatureName, SubscriptionTier } from '@placeai/types';
import type { ApiResponse } from '@placeai/types';

async function fetchCurrentUser(): Promise<User> {
  const res = await fetch('/api/v1/auth/me');
  if (!res.ok) throw new Error('Failed to fetch user');
  const json = await res.json() as ApiResponse<User>;
  if (!json.success) throw new Error(json.error.message);
  return json.data;
}

export function useUser() {
  const { isLoaded: clerkLoaded, isSignedIn } = useClerkUser();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['current-user'],
    queryFn: fetchCurrentUser,
    enabled: clerkLoaded && isSignedIn === true,
    staleTime: 5 * 60 * 1000,
  });

  const tier = (user?.subscriptionTier ?? 'free') as SubscriptionTier;
  const limits = PLAN_LIMITS[tier];

  function canUseFeature(_feature: FeatureName): boolean {
    // Optimistic check — server enforces hard gate
    // For now, all features are "allowed" optimistically, server returns 429 on quota
    return true;
  }

  return {
    user,
    isLoading: !clerkLoaded || isLoading,
    isSignedIn,
    error,
    tier,
    limits,
    canUseFeature,
  };
}
