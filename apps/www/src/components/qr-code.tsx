import { useEffect, useState, useRef } from "react";

import * as InternalQRCode from "qrcode";

import { DownloadIcon } from "lucide-react";
import { ExternalLinkButton } from "./ui/link-button";

type QRCodeProps = {
    content: string;
};

export function QRCode({ content }: QRCodeProps) {
    const imageRef = useRef<HTMLImageElement>(null);
    const [qrCodeSrc, setQrCodeSrc] = useState<string>();

    const test = async () => {
        if (!imageRef.current) {
            return;
        }

        const { width } = imageRef.current.getBoundingClientRect();

        const qr = await InternalQRCode.toDataURL(content, {
            type: "image/webp",
            width,
            margin: 2,
        });

        imageRef.current.src = qr;
        setQrCodeSrc(qr);
    };

    useEffect(() => {
        test();
    }, [content]);

    return (
        <>
            <img
                ref={imageRef}
                className="w-full select-none overflow-hidden rounded"
            />

            <ExternalLinkButton href={qrCodeSrc} download>
                <DownloadIcon className="h-4 w-4" />

                <span className="ml-2">Download QR code</span>
            </ExternalLinkButton>
        </>
    );
}
