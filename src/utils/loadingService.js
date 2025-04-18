let listeners = [];

// 구독 함수
export const subscribeLoading = (fn) => {
    listeners.push(fn);
    return () => {
        listeners = listeners.filter(l => l !== fn);
    };
};

// 발행 함수
export const publishLoading = (isLoading) => {
    listeners.forEach(fn => fn(isLoading));
};
