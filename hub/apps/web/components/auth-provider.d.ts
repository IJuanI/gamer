import type { PublicUser } from "@gamer/shared";
interface AuthContextValue {
    user: PublicUser | null;
    loading: boolean;
    refresh: () => Promise<void>;
    logout: () => Promise<void>;
    setUser: (u: PublicUser | null) => void;
}
export declare function AuthProvider({ children }: {
    children: React.ReactNode;
}): import("react").JSX.Element;
export declare function useAuth(): AuthContextValue;
export {};
