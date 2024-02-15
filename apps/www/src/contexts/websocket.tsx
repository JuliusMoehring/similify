import {
    createContext,
    type PropsWithChildren,
    useContext,
    useEffect,
    useState,
} from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
    autoConnect: false,
});

type WebSocketContextType = {
    isConnected: boolean;
};

const WebSocketContext = createContext<WebSocketContextType | null>({
    isConnected: false,
});

export function WebSocketProvider({ children }: PropsWithChildren) {
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        const onConnect = () => {
            setIsConnected(true);
        };

        const onDisconnect = () => {
            setIsConnected(false);
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, []);

    return (
        <WebSocketContext.Provider
            value={{
                isConnected,
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocket() {
    const context = useContext(WebSocketContext);

    if (context === null) {
        const error = new Error(
            "useWebSocket must be used within a WebSocketContext",
        );

        if (Error.captureStackTrace) {
            Error.captureStackTrace(error, useWebSocket);
        }

        throw error;
    }

    return context;
}
