import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./use-api";
import { User, Journey } from "kairos-api-client-ts";
import { journeysKeys } from "./journeys-queries"; // Import keys from your journeys file

// --- Placeholder Types (based on API docs) ---
type UserCreateInput = Omit<User, "_id" | "created_at" | "is_active" | "is_verified">;
type UserUpdateInput = { userId: string; data: Partial<User> };
type UpdatePasswordInput = { token: string; newPassword: string };

// --- Query Key Factory ---
export const usersKeys = {
  all: ["users"] as const,
  current: () => [...usersKeys.all, "me"] as const, // For the currently logged-in user
  detail: (userId: string) => [...usersKeys.all, "detail", userId] as const,
  journeys: (userId: string) => [...usersKeys.all, "journeys", userId] as const,
  activeJourney: (userId: string) => [...usersKeys.all, "activeJourney", userId] as const,
};

// --- QUERY HOOKS (for GET requests) ---

/**
 * Fetches the currently authenticated user.
 * Corresponds to: getCurrentUserApiV1UsersMeGet
 */
export const useCurrentUser = (isAuthenticated: boolean) => {
  const api = useApi();
  return useQuery<User, Error>({
    queryKey: usersKeys.current(),
    queryFn: async () => {
      const response = await api.users.getCurrentUserApiV1UsersMeGet();
      return response.data;
    },
    // Only run this query if the user is authenticated
    enabled: isAuthenticated,
    // User data is very important, so let's make it less likely to be stale
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Fetches a user by their ID.
 * Corresponds to: getUserByIdApiV1UsersUserIdGet
 */
export const useUserById = (userId: string | null | undefined) => {
  const api = useApi();
  return useQuery<User, Error>({
    queryKey: usersKeys.detail(userId!),
    queryFn: async () => {
      const response = await api.users.getUserByIdApiV1UsersUserIdGet(userId!);
      return response.data;
    },
    enabled: !!userId,
  });
};

/**
 * Fetches all journeys for a specific user.
 * This is the new, refactored implementation for your original `useUserJourneys` hook.
 * Corresponds to: getUserJourneysApiV1UsersUserIdJourneysGet
 */
export const useUserJourneys = (userId: string | null | undefined) => {
  const api = useApi();
  // The API doc returns 'any', but we strongly assume it's an array of Journey objects.
  return useQuery<Journey[], Error>({
    queryKey: usersKeys.journeys(userId!),
    queryFn: async () => {
      const response = await api.users.getUserJourneysApiV1UsersUserIdJourneysGet(userId!);
      return response.data;
    },
    enabled: !!userId,
  });
};

/**
 * Fetches the active journey for a specific user.
 * Corresponds to: getActiveJourneyApiV1UsersUserIdJourneysActiveGet
 */
export const useUserActiveJourney = (userId: string | null | undefined) => {
  const api = useApi();
  return useQuery<Journey | null, Error>({
    queryKey: usersKeys.activeJourney(userId!),
    queryFn: async () => {
      const response = await api.users.getActiveJourneyApiV1UsersUserIdJourneysActiveGet(userId!);
      return response.data;
    },
    enabled: !!userId,
  });
};


// --- MUTATION HOOKS (for POST, PUT, DELETE) ---

/**
 * Registers a new user. This is an unauthenticated action.
 * Corresponds to: registerUserApiV1UsersRegisterPost
 */
export const useRegisterUser = () => {
  const api = useApi();
  return useMutation({
    mutationFn: (newUser: UserCreateInput) =>
      api.users.registerUserApiV1UsersRegisterPost(newUser as User),
    // No query invalidation needed since the user is not logged in yet.
  });
};

/**
 * Updates a user's profile.
 * Corresponds to: updateUserApiV1UsersUserIdPut
 */
export const useUpdateUser = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: UserUpdateInput) =>
      api.users.updateUserApiV1UsersUserIdPut(userId, data as User),
    onSuccess: (data, variables) => {
      // The user's data has changed, so we must invalidate their queries
      // to trigger a refetch and update the UI.
      queryClient.invalidateQueries({ queryKey: usersKeys.current() });
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.userId) });
    },
  });
};

/**
 * Deletes a user.
 * Corresponds to: deleteUserApiV1UsersUserIdDelete
 */
export const useDeleteUser = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.users.deleteUserApiV1UsersUserIdDelete(userId),
    onSuccess: () => {
      // After deleting a user, all their related data is gone.
      // Clear the entire query cache for a clean state.
      queryClient.clear();
      // You would typically redirect to the login/home page here.
    },
  });
};

/**
 * Sends a password reset email. Unauthenticated action.
 * Corresponds to: resetPasswordApiV1UsersResetPasswordPost
 */
export const useResetPassword = () => {
  const api = useApi();
  return useMutation({
    mutationFn: (email: string) => api.users.resetPasswordApiV1UsersResetPasswordPost(email),
  });
};

/**
 * Updates the password using a reset token. Unauthenticated action.
 * Corresponds to: updatePasswordApiV1UsersUpdatePasswordPost
 */
export const useUpdatePassword = () => {
  const api = useApi();
  return useMutation({
    mutationFn: ({ token, newPassword }: UpdatePasswordInput) =>
      api.users.updatePasswordApiV1UsersUpdatePasswordPost(token, newPassword),
  });
};

/**
 * Verifies a user's email with a token.
 * Even though it's a GET, it's a one-time action that changes server state,
 * so it's best modeled as a mutation.
 * Corresponds to: verifyEmailApiV1UsersVerifyEmailGet
 */
export const useVerifyEmail = () => {
    const api = useApi();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (token: string) => api.users.verifyEmailApiV1UsersVerifyEmailGet(token),
        onSuccess: () => {
            // After successful verification, the user's 'is_verified' status has changed.
            // Invalidate the current user query to refetch the updated user object.
            queryClient.invalidateQueries({ queryKey: usersKeys.current() });
        }
    });
}