import { getCurrentUser, signOut as apiSignOut } from "@/lib/appwrite";
import { Models } from "appwrite";
import { createContext, useContext, useEffect, useState } from "react";

interface IAuthContext {
    user: Models.Document | null;
    isLoading: boolean;
    setUser: (user: Models.Document | null) => void;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<IAuthContext>({
    user: null,
    isLoading: true,
    setUser: () => {},
    signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<Models.Document | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            setIsLoading(false);
        };

        fetchUser();
    }, []);

    const signOut = async () => {
        await apiSignOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signOut, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
