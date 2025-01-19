/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';

const KofiWidget: React.FC = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
        script.async = true;

        document.body.appendChild(script);

        script.onload = () => {
            if (typeof (window as any).kofiWidgetOverlay !== 'undefined') {
                (window as any).kofiWidgetOverlay.draw('revanapriyandi', {
                    type: 'floating-chat',
                    'floating-chat.donateButton.text': 'Support Me',
                    'floating-chat.donateButton.background-color': '#794bc4',
                    'floating-chat.donateButton.text-color': '#fff',
                });
            }
        };

        // Membersihkan script saat komponen dilepas
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return null; // Komponen tidak merender elemen ke DOM
};

export default KofiWidget;
