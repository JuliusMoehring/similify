/**"use client";

import { faker } from "@faker-js/faker";
import * as d3 from "d3";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const nodes = faker.helpers.multiple(() => ({ id: faker.string.uuid() }), {
    count: 40,
});

const links: {
    source: string;
    target: string;
    value: number;
}[] = [];

for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
        const source = nodes[i];
        const target = nodes[j];

        const value = faker.number.float({ min: 0, max: 1 });

        if (!source || !target) {
            continue;
        }

        links.push({
            source: source.id,
            target: target.id,
            value,
        });
    }
}

type Node = d3.SimulationNodeDatum;
type Link = d3.SimulationLinkDatum<d3.SimulationNodeDatum> & {
    value: number;
};

export default function TestPage() {
    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0,
    });

    const [data] = useState(() => ({
        nodes,
        links,
    }));

    const containerRef = useRef<HTMLDivElement | null>(null);
    const ref = useRef<SVGSVGElement | null>(null);

    useLayoutEffect(() => {
        const updateDimensions = () => {
            if (!containerRef.current) {
                return;
            }

            const { width, height } =
                containerRef.current.getBoundingClientRect();

            setDimensions({ width, height });
        };

        updateDimensions();

        window.addEventListener("resize", updateDimensions);

        return () => {
            window.removeEventListener("resize", updateDimensions);
        };
    }, []);

    useEffect(() => {
        const links: Link[] = data.links.map((d) => Object.create(d));
        const nodes: Node[] = data.nodes.map((d) => Object.create(d));

        const simulation = d3
            .forceSimulation(nodes)
            .force("charge", d3.forceManyBody().strength(-5000))
            .force("collide", d3.forceCollide(6))
            .force(
                "link",
                d3
                    .forceLink(links)
                    .id((d) => (d as any).id)
                    .strength((_, i) => data.links[i]?.value ?? 1),
            )

            .force(
                "center",
                d3.forceCenter(dimensions.width / 2, dimensions.height / 2),
            );

        const svg = d3
            .select(ref.current)
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
            .attr("stroke-width", (d) => Math.sqrt(d.value));

        const node = g
            .append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("r", 5)
            .attr("fill", "#000");

        simulation.on("tick", () => {
            link.attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);

            node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
        });

        return () => {
            simulation.stop();
            svg.remove();
        };
    }, [data, dimensions]);

    return (
        <div ref={containerRef} className="w-full h-screen">
            <svg
                ref={ref}
                width={dimensions.width}
                height={dimensions.height}
            />
        </div>
    );
}


*/
