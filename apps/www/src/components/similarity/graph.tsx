"use client";

import * as d3 from "d3";
import { MD5 } from "object-hash";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";

import { useCalculateHeight } from "~/hooks/use-calculate-height";

type Node = d3.SimulationNodeDatum & {
    id: string;
    name: string;
};

type Link = d3.SimulationLinkDatum<d3.SimulationNodeDatum> & {
    value: number;
};

type SimilarityGraphProps<N extends Node, L extends Link> = {
    nodes: N[];
    links: L[];
};

function getLinkValue<L extends Link>(
    link: L,
    datum: "source" | "target",
    value: "x" | "y",
) {
    if (typeof link[datum] === "string" || typeof link[datum] === "number") {
        return 0;
    }

    return link[datum][value] ?? 0;
}

export function SimilarityGraph<N extends Node, L extends Link>({
    nodes,
    links,
}: SimilarityGraphProps<N, L>) {
    const { ref, height } = useCalculateHeight();
    const canvasRef = useRef<HTMLDivElement>(null);
    const simulationRef = useRef<d3.Simulation<N, undefined> | null>(null);
    const svgRef = useRef<d3.Selection<
        SVGSVGElement,
        unknown,
        null,
        undefined
    > | null>(null);

    const memoizedNodes = useMemo(() => nodes, [MD5(nodes)]);
    const memoizedLinks = useMemo(() => links, [MD5(links)]);

    useLayoutEffect(() => {
        const runSimulation = () => {
            if (!ref.current) {
                return;
            }

            if (simulationRef.current) {
                simulationRef.current.force("charge", null);
            }

            svgRef.current?.remove();

            const { width, height } = ref.current.getBoundingClientRect();

            const minDimension = Math.min(width, height);

            simulationRef.current = d3
                .forceSimulation(memoizedNodes)
                .force(
                    "charge",
                    d3
                        .forceManyBody()
                        .strength(Math.sqrt(minDimension) * -1000),
                )
                .force("collide", d3.forceCollide(6))
                .force(
                    "link",
                    d3
                        .forceLink(memoizedLinks)
                        .id((d) => (d as any).id)
                        .strength((_, i) => memoizedLinks[i]?.value ?? 1),
                )

                .force("center", d3.forceCenter(width / 2, height / 2));

            const zoom = d3
                .zoom()
                .on("zoom", (event) =>
                    d3.select("svg g").attr("transform", event.transform),
                );

            svgRef.current = d3
                .select(canvasRef.current)
                .append("svg")
                .attr("viewBox", [0, 0, width, height])
                .call(zoom);

            const g = svgRef.current.append("g");

            const link = g
                .append("g")
                .attr("stroke", "#999")
                .attr("stroke-opacity", 0.6)
                .selectAll("line")
                .data(links)
                .join("line")
                .attr("stroke-width", (d) => d.value * 10);

            const node = g
                .append("g")
                .attr("stroke", "#fff")
                .attr("stroke-width", 1.5)
                .selectAll("circle")
                .data(memoizedNodes)
                .join("circle")
                .attr("r", 5)
                .attr("fill", "#000");

            const label = g
                .append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 14)
                .attr("fill", "currentColor")
                .attr("text-anchor", "middle")
                .selectAll("text")
                .data(memoizedNodes)
                .join("text")
                .text((d) => d.name);

            simulationRef.current.on("tick", () => {
                link.attr("x1", (d) => getLinkValue(d, "source", "x"))
                    .attr("y1", (d) => getLinkValue(d, "source", "y"))
                    .attr("x2", (d) => getLinkValue(d, "target", "x"))
                    .attr("y2", (d) => getLinkValue(d, "target", "y"));

                node.attr("cx", (d) => d.x ?? 0).attr("cy", (d) => d.y ?? 0);

                label.attr("x", (d) => d.x ?? 0).attr("y", (d) => d.y ?? 0);
            });
        };

        runSimulation();

        window.addEventListener("resize", runSimulation);

        return () => {
            window.removeEventListener("resize", runSimulation);
            simulationRef.current?.stop();
            svgRef.current?.remove();
        };
    }, [height]);

    useEffect(() => {
        if (!simulationRef.current) {
            return;
        }

        simulationRef.current.force(
            "link",
            d3
                .forceLink(memoizedLinks)
                .id((d) => (d as any).id)
                .strength((_, i) => memoizedLinks[i]?.value ?? 1),
        );
    }, [memoizedLinks]);

    return (
        <div ref={ref} className="h-screen w-full" style={{ height }}>
            <div ref={canvasRef} />
        </div>
    );
}
