import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const toast = useToast();

  const handleError = (error) => {
    setError(error);
    toast({
      title: 'Error',
      description: error.message,
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  };

  const checkAuth = useCallback(async () => {
    if (!isInitialized) {
      setIsLoading(true);
    }
    
    try {
      const response = await fetch('/api/auth/user', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setError(null);
      } else {
        setUser(null);
        if (response.status !== 401) {
          throw new Error('Failed to verify authentication');
        }
      }
    } catch (error) {
      handleError(error);
      setUser(null);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [toast, isInitialized]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      setUser(data.user);
      setError(null);
      return true;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      setUser(null);
      setError(null);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      error,
      isInitialized,
      login, 
      logout, 
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
