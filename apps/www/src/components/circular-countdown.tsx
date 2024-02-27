"use client";

import { Rubik_Mono_One } from "next/font/google";
import {
    ComponentPropsWithoutRef,
    DependencyList,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import { cn } from "~/lib/utils";

const rubikMonoOne = Rubik_Mono_One({
    weight: "400",
    subsets: ["latin"],
});

type CircularCountdownProps = ComponentPropsWithoutRef<"div"> & {
    seconds: number;
    dependencies?: DependencyList;
};

export function CircularCountdown({
    seconds,
    dependencies = [],
    className,
    ...rest
}: CircularCountdownProps) {
    const [counter, setCounter] = useState(seconds);

    const [displayProperties, setDisplayProperties] = useState<{
        strokeWidth: number;
        radius: number;
        fontSize: number;
    }>({
        strokeWidth: 0,
        radius: 0,
        fontSize: 0,
    });

    const containerRef = useRef<HTMLDivElement | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        console.log("seconds changed");

        setCounter(seconds);

        intervalRef.current = setInterval(() => {
            setCounter((prev) => {
                if (prev === 0) {
                    clearInterval(intervalRef.current!);
                    return 0;
                }

                return prev - 1;
            });
        }, 1_000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [seconds, ...dependencies]);

    useLayoutEffect(() => {
        const calculateDisplayProperties = () => {
            if (!containerRef.current) {
                return;
            }

            const { width, height } =
                containerRef.current.getBoundingClientRect();

            const maxDimension = Math.min(width, height);

            const strokeWidth = Math.max(maxDimension / 20, 6);

            setDisplayProperties({
                strokeWidth,
                radius: 50 - strokeWidth,
                fontSize: Math.max(maxDimension / 4, 10),
            });
        };

        calculateDisplayProperties();

        window.addEventListener("resize", calculateDisplayProperties);

        return () => {
            window.removeEventListener("resize", calculateDisplayProperties);
        };
    }, []);

    const cirrcumference = 2 * Math.PI * displayProperties.radius;
    const progress = ((seconds - counter) / seconds) * cirrcumference;

    return (
        <div
            ref={containerRef}
            className={cn(
                "flex h-full w-full items-center justify-center",
                className,
            )}
            {...rest}
        >
            <div className="relative">
                {displayProperties && (
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                        <circle
                            className="fill-none stroke-muted text-transparent"
                            cx="50"
                            cy="50"
                            r={displayProperties.radius}
                            strokeWidth={displayProperties.strokeWidth}
                            strokeLinecap="round"
                        />

                        <circle
                            className="fill-none stroke-foreground text-transparent"
                            cx="50"
                            cy="50"
                            r={displayProperties.radius}
                            strokeWidth={displayProperties.strokeWidth}
                            strokeDasharray={
                                2 * Math.PI * displayProperties.radius
                            }
                            strokeDashoffset={progress}
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                        />
                    </svg>
                )}
                <span
                    className={cn(
                        "absolute inset-0 flex items-center justify-center font-bold tabular-nums text-foreground",
                        rubikMonoOne.className,
                    )}
                    style={{
                        fontSize: displayProperties.fontSize,
                    }}
                >
                    {counter}
                </span>
            </div>
        </div>
    );
}
