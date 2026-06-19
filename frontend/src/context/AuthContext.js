import React, { createContext, useState, useEffect, useContext } from "react";
import io from "socket.io-client";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize Auth State from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  // Initialize Socket.io Connection
  useEffect(() => {
    if (!user || !user.id) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket client connected:", newSocket.id);
      newSocket.emit("registerUser", user.id);
    });

    const handleOnlineStatus = (users) => {
      setOnlineUsers(users);
    };

    newSocket.on("onlineStatus", handleOnlineStatus);
    newSocket.on("online_users", handleOnlineStatus);

    return () => {
      newSocket.off("onlineStatus", handleOnlineStatus);
      newSocket.off("online_users", handleOnlineStatus);
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Login handler
  const login = async (email, password) => {
    try {
      const data = await api.post("/auth/login", { email, password });
      
      // Save to state
      setUser(data.user);
      setToken(data.token);

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      return data.user;
    } catch (error) {
      throw error;
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const data = await api.post("/auth/register", userData);
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Update profile details dynamically
  const updateProfileState = (updatedFields) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedFields };
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        socket,
        onlineUsers,
        loading,
        login,
        register,
        logout,
        updateProfileState,
        isUserOnline
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
