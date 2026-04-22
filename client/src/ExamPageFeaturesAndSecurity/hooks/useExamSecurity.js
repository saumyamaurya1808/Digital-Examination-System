import { useEffect, useRef } from "react";

export const useExamSecurity = (testStarted, submitted, onViolation, onWarning) => {
    const warningCount = useRef(0);

    useEffect(() => {
        // Sirf tabhi run karein jab test chal raha ho
        if (!testStarted || submitted) return;

        // FIXED: Function name was inconsistent in your snippet
        const handleSecurityBreach = (msg) => {
            if (warningCount.current === 0) {
                warningCount.current += 1;
                onWarning(msg); // Pehli warning
            } else {
                onViolation("Security policy violation: " + msg); // Final action
            }
        };

        // 1. Block Right Click
        const handleContextMenu = (e) => e.preventDefault();

        // 2. Block Shortcuts
        const handleKeyDown = (e) => {
            if (
                e.key === "F12" ||
                (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
                (e.ctrlKey && e.key === "u")
            ) {
                e.preventDefault();
                handleSecurityBreach("Developer tools access is blocked.");
            }

            if (e.key === "PrintScreen") {
                navigator.clipboard.writeText("");
                handleSecurityBreach("Screenshots are strictly prohibited.");
            }

            if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4")) {
                handleSecurityBreach("Mac screenshots are blocked.");
            }
        };

        // 3. Tab Switch Detection
        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleSecurityBreach("Tab switching is not allowed during the exam.");
            }
        };

        // 4. Fullscreen Exit Detection
        const handleFullscreenChange = () => {
            // Agar full screen nahi hai aur notification show nahi ho rahi (to avoid loops)
            if (!document.fullscreenElement) {
                handleSecurityBreach("Exam must be taken in Fullscreen mode.");
            }
        };

        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, [testStarted, submitted, onViolation, onWarning]); // Added all dependencies
};