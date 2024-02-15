import { type RefObject, useLayoutEffect, useRef, useState } from "react";

function calculateHeight(ref: RefObject<HTMLDivElement>, offset: number) {
    if (!ref.current) {
        throw new Error("Ref is not set");
    }

    return (
        window.innerHeight - ref.current.getBoundingClientRect().top - offset
    );
}

export function useCalculateHeight(offset = 24) {
    const ref = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number>();

    useLayoutEffect(() => {
        if (!ref.current) {
            return;
        }

        setHeight(calculateHeight(ref, offset));

        const handleResize = () => {
            setHeight(calculateHeight(ref, offset));
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [offset]);

    return { ref, height };
}
