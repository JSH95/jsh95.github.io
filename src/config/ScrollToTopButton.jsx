import { useEffect, useState } from "react";

const ScrollToTopButton = () => {
    const [visible, setVisible] = useState(false);

    // 스크롤 위치 감지
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 200) {
                setVisible(true);
            } else {
                setVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    // 스크롤 맨 위로
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`btn position-fixed transition-opacity ${
                visible ? "opacity-100" : "opacity-0"
            }`}
            style={{
                bottom: "30px",
                right: "30px",
                zIndex: 9999,
                borderRadius: "50%",
                width: "40px",
                backgroundColor: "#f0f0f0",   // 원하는 배경색
                color: "#000",
                height: "40px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                pointerEvents: visible ? "auto" : "none", // 안 보일 때 클릭 막기
                transition: "opacity 0.4s ease",
            }}
            aria-label="Scroll to top"
        >
            <i className="bi bi-arrow-up-short"></i>
        </button>
    );
};

export default ScrollToTopButton;
