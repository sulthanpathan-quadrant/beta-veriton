// import { createContext, useContext, useState, ReactNode } from "react";

// interface User {
//   user_id: string;
//   email: string;
//   full_name: string;
//   is_active?: boolean;
//   agent_id?: string;
//   agent_name?: string;
//   session_id?: string;
//   total_chats?: number;
// }

// interface AuthContextType {
//   user: User | null;
//   isAuthenticated: boolean;
//   login: (email: string, password: string) => Promise<boolean>;
//   signup: (name: string, email: string, password: string) => Promise<boolean>;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<User | null>(() => {
//     const stored = localStorage.getItem("aivolve_user");
//     return stored ? JSON.parse(stored) : null;
//   });

//   // LOGIN API
//   const login = async (email: string, password: string): Promise<boolean> => {
//     try {
//       const formData = new URLSearchParams();
//       formData.append("email", email);
//       formData.append("password", password);

//       const res = await fetch(
//         " /login",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//             Accept: "application/json",
//           },
//           body: formData.toString(),
//         }
//       );

//       if (!res.ok) return false;

//       const data = await res.json();

//       const userData: User = {
//         ...data.user,
//         agent_id: data.agent_id,
//         agent_name: data.agent_name,
//         session_id: data.session_id,
//         total_chats: data.total_chats,
//       };

//       setUser(userData);
//       localStorage.setItem("aivolve_user", JSON.stringify(userData));

//       return true;
//     } catch (err) {
//       console.error("Login error:", err);
//       return false;
//     }
//   };

//   // SIGNUP API
//   const signup = async (name: string, email: string, password: string): Promise<boolean> => {
//     try {
//       const formData = new URLSearchParams();
//       formData.append("email", email);
//       formData.append("password", password);
//       formData.append("full_name", name);

//       const res = await fetch(
//         "https://automl-webnew-chcgfqc8a5cbhtc4.eastus-01.azurewebsites.net/register",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//             Accept: "application/json",
//           },
//           body: formData.toString(),
//         }
//       );

//       if (!res.ok) return false;

//       // After signup, automatically login to fetch user info
//       const loginSuccess = await login(email, password);
//       return loginSuccess;
//     } catch (err) {
//       console.error("Signup error:", err);
//       return false;
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem("aivolve_user");
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isAuthenticated: !!user,
//         login,
//         signup,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within AuthProvider");
//   return context;
// };

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  user_id?: string;
  id?: string;
  email: string;
  full_name?: string;
  name?: string;
  is_active?: boolean;
  agent_id?: string;
  agent_name?: string;
  session_id?: string;
  total_chats?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 🔥 AUTH HYDRATION
   * This is the MOST IMPORTANT part.
   * It syncs AuthContext with Auth.tsx (which writes `user`)
   */
  useEffect(() => {
    const storedUser =
      localStorage.getItem("aivolve_user") ||
      localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  /**
   * LOGIN (kept for future usage / compatibility)
   * Even if not used by Auth.tsx, it keeps system consistent
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);

      const res = await fetch(
        "https://api.veriton.ai/api/service3/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: formData.toString(),
        }
      );

      if (!res.ok) return false;

      const data = await res.json();

      const userData: User = {
        ...data.user,
        agent_id: data.agent_id,
        agent_name: data.agent_name,
        session_id: data.session_id,
        total_chats: data.total_chats,
      };

      setUser(userData);

      // 🔑 Store BOTH keys (compatibility with Auth.tsx)
      localStorage.setItem("aivolve_user", JSON.stringify(userData));
      localStorage.setItem("user", JSON.stringify(userData));

      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  /**
   * SIGNUP (kept for completeness)
   */
  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("full_name", name);

      const res = await fetch(
        "https://api.veriton.ai/api/service3/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: formData.toString(),
        }
      );

      if (!res.ok) return false;

      // Auto-login after signup
      return await login(email, password);
    } catch (err) {
      console.error("Signup error:", err);
      return false;
    }
  };

  /**
   * LOGOUT
   */
  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
