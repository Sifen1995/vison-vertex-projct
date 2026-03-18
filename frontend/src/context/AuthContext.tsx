import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { User, LoginRequest, RegisterRequest, MfaVerifyRequest } from '../types';
import { authApi } from '../api/auth';
import { setTokens, clearTokens, getAccessToken } from '../api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaRequired: boolean;
  mfaSetupData: { secret: string; qr_code: string } | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'MFA_REQUIRED' }
  | { type: 'MFA_SETUP'; payload: { secret: string; qr_code: string } }
  | { type: 'CLEAR_MFA' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  mfaRequired: false,
  mfaSetupData: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        mfaRequired: false,
        mfaSetupData: null,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'MFA_REQUIRED':
      return { ...state, mfaRequired: true, isLoading: false };
    case 'MFA_SETUP':
      return { ...state, mfaSetupData: action.payload, isLoading: false };
    case 'CLEAR_MFA':
      return { ...state, mfaRequired: false, mfaSetupData: null };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  setupMfa: () => Promise<void>;
  verifyMfa: (data: MfaVerifyRequest) => Promise<void>;
  clearMfaState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          // Decode token to get user info (basic JWT decode)
          const payload = JSON.parse(atob(token.split('.')[1]));
          const user: User = {
            id: payload.user_id,
            email: payload.email,
            user_name: payload.user_name,
            role: payload.role,
            is_verified: payload.is_verified,
            mfa_enabled: payload.mfa_enabled,
          };
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } catch {
          clearTokens();
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authApi.login(data);
      if (response.mfa_required) {
        dispatch({ type: 'MFA_REQUIRED' });
        return;
      }
      if (response.access_token && response.refresh_token) {
        setTokens(response.access_token, response.refresh_token);
        const payload = JSON.parse(atob(response.access_token.split('.')[1]));
        const user: User = {
          id: payload.user_id,
          email: payload.email,
          user_name: payload.user_name,
          role: payload.role,
          is_verified: payload.is_verified,
          mfa_enabled: payload.mfa_enabled,
        };
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await authApi.register(data);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors
    } finally {
      clearTokens();
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const setupMfa = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authApi.setupMfa();
      dispatch({ type: 'MFA_SETUP', payload: response });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  const verifyMfa = useCallback(async (data: MfaVerifyRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authApi.verifyMfa(data);
      if (response.access_token && response.refresh_token) {
        setTokens(response.access_token, response.refresh_token);
        const payload = JSON.parse(atob(response.access_token.split('.')[1]));
        const user: User = {
          id: payload.user_id,
          email: payload.email,
          user_name: payload.user_name,
          role: payload.role,
          is_verified: payload.is_verified,
          mfa_enabled: payload.mfa_enabled,
        };
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  const clearMfaState = useCallback(() => {
    dispatch({ type: 'CLEAR_MFA' });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        setupMfa,
        verifyMfa,
        clearMfaState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
