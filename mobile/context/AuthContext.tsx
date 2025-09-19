import { getCurrentUser } from "@/lib/appwrite";
import { Models } from "appwrite";
import { createContext, useContext, useEffect, useState } from "react";

interface IAuthContext {
    user: Models.Document | null;
    isLoading: boolean;
}

const AuthContext = createContext<IAuthContext>({
    user: null,
    isLoading: true,
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

    return (
        <AuthContext.Provider value={{ user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
