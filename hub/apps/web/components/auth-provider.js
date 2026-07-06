"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProvider = AuthProvider;
exports.useAuth = useAuth;
const react_1 = require("react");
const api_1 = require("@/lib/api");
const AuthContext = (0, react_1.createContext)(null);
function AuthProvider({ children }) {
    const [user, setUser] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const refresh = (0, react_1.useCallback)(async () => {
        try {
            const { user } = await api_1.api.me();
            setUser(user);
        }
        catch {
            setUser(null);
        }
        finally {
            setLoading(false);
        }
    }, []);
    const logout = (0, react_1.useCallback)(async () => {
        await api_1.api.logout().catch(() => { });
        setUser(null);
    }, []);
    (0, react_1.useEffect)(() => {
        void refresh();
    }, [refresh]);
    return (<AuthContext.Provider value={{ user, loading, refresh, logout, setUser }}>
      {children}
    </AuthContext.Provider>);
}
function useAuth() {
    const ctx = (0, react_1.useContext)(AuthContext);
    if (!ctx)
        throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
