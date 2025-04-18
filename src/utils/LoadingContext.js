import React, { createContext, useContext, useState, useEffect  } from "react";
import { subscribeLoading } from './loadingService';

const LoadingContext = createContext({
    isProcessing: false,
    setIsProcessing: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeLoading(flag => {
            setIsProcessing(flag);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (isProcessing) {
            // 현재 경로를 강제로 push 해버림 → 뒤로가기를 누르면 다시 현재 페이지로
            window.history.replaceState(null, "", window.location.hash);
        }
        const handleBeforeUnload = (e) => {
            if (isProcessing) {
                e.preventDefault();
                e.returnValue = ""; // 브라우저 표준
            }
        };

        const handlePopState = (e) => {
            if (isProcessing) {
                // 사용자가 뒤로가기를 눌렀지만, 강제로 다시 현재 페이지로 리디렉션
                window.history.replaceState(null, "", window.location.hash);
            }
        };

        if (isProcessing) {
            window.addEventListener("beforeunload", handleBeforeUnload);
            window.addEventListener("popstate", handlePopState);
        }

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("popstate", handlePopState);
        };
    }, [isProcessing]);

    return (
        <LoadingContext.Provider value={{ isProcessing, setIsProcessing }}>
            {children}
        </LoadingContext.Provider>
    );
};
