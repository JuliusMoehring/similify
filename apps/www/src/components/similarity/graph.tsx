"use client";

import * as d3 from "d3";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

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
    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0,
    });

    const { ref, height } = useCalculateHeight();
    const canvasRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const updateDimensions = () => {
            if (!ref.current) {
                return;
            }

            const { width, height } = ref.current.getBoundingClientRect();

            setDimensions({ width, height });
        };

        updateDimensions();

        window.addEventListener("resize", updateDimensions);

        return () => {
            window.removeEventListener("resize", updateDimensions);
        };
    }, [height]);

    useEffect(() => {
        const simulation = d3
            .forceSimulation(nodes)
            .force("charge", d3.forceManyBody().strength(-2000))
            .force("collide", d3.forceCollide(6))
            .force(
                "link",
                d3
                    .forceLink(links)
                    .id((d) => (d as any).id)
                    .strength((_, i) => links[i]?.value ?? 1),
            )

            .force(
                "center",
                d3.forceCenter(dimensions.width / 2, dimensions.height / 2),
            );

        const svg = d3
            .select(canvasRef.current)
            .append("svg")
            .attr("viewBox", [0, 0, dimensions.width, dimensions.height]);

        const g = svg.append("g");

        const link = g
            .append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", (d) => d.value * 100);

        const node = g
            .append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodes)
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
            .data(nodes)
            .join("text")
            .text((d) => d.name);

        simulation.on("tick", () => {
            link.attr("x1", (d) => getLinkValue(d, "source", "x"))
                .attr("y1", (d) => getLinkValue(d, "source", "y"))
                .attr("x2", (d) => getLinkValue(d, "target", "x"))
                .attr("y2", (d) => getLinkValue(d, "target", "y"));

            node.attr("cx", (d) => d.x ?? 0).attr("cy", (d) => d.y ?? 0);

            label.attr("x", (d) => d.x ?? 0).attr("y", (d) => d.y ?? 0);
        });

        return () => {
            simulation.stop();
            svg.remove();
        };
    }, [nodes, links, dimensions]);

    return (
        <div ref={ref} className="h-screen w-full" style={{ height }}>
            <div ref={canvasRef} />
        </div>
    );
}
