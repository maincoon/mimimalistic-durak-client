import { useEffect, useState } from "react";

export function InstallPWA() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed
        const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches;
        setIsStandalone(isStandaloneMode);

        // Check platform
        const userAgent = window.navigator.userAgent.toLowerCase();
        setIsIOS(/iphone|ipad|ipod/.test(userAgent));
        setIsAndroid(/android/.test(userAgent));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handler = (e: any) => {
            e.preventDefault();
            console.log("PWA install prompt captured");
            setDeferredPrompt(e);
        };
        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    if (isStandalone) {
        return null;
    }

    // Don't render anything if not iOS/Android and no prompt available yet
    if (!deferredPrompt && !isIOS && !isAndroid) {
        return null;
    }

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setDeferredPrompt(null);
            }
        } else if (isIOS) {
            alert("To install: tap the Share icon below ⬇️ and select 'Add to Home Screen' ➕");
        } else if (isAndroid) {
            alert("To install: tap the Menu icon (⋮ or three dots) and select 'Install App' or 'Add to Home screen' 📲. \n\nNote: This may not work on unsecure HTTP connections.");
        }
    };

    return (
        <button className="install-icon-button" onClick={handleInstall} title="Install App">
            📲
        </button>
    );

}

