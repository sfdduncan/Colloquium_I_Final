    chart = function(data) {
    const width = window.innerWidth + 300;
    const height = window.innerHeight;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 80;


    const tree = d3.cluster()
        .size([2 * Math.PI, radius])
        .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);

    const root = tree(
        d3.hierarchy(data).sort((a, b) => d3.ascending(a.data.name, b.data.name))
    );

    const svg = d3.create("svg")
        .attr("width", "100vw")
        .attr("height", "100vh")
        .attr("viewBox", [-cx, -cy, width, height])
        .style("background", "#56b940ff") // blue background
        .style("font", "8px sans-serif")
        .style("font-weight", "bold");

    // Links (white lines)
    const link = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 1.5)
    .selectAll("path")
    .data(root.links())
    .join("path")
    .attr("class", "link")
    .attr("d", d3.linkRadial()
        .angle(d => d.x)
        .radius(d => d.y));


    // Nodes (white circles)
        const node = svg.append("g")
        .selectAll("circle")
        .data(root.descendants())
        .join("circle")
        .attr("class", "node")
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
        .attr("fill", "white")
        .attr("r", 2.5)
        .on("mouseover", function(event, d) {
            const descendants = d.descendants();
            node.classed("highlight", n => descendants.includes(n));
            link.classed("highlight", l => descendants.includes(l.target));
        })
        .on("mouseout", function() {
            node.classed("highlight", false);
            link.classed("highlight", false);
        });


    // Labels (white text)
    svg.append("g")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .selectAll("text")
        .data(root.descendants())
        .join("text")
        .attr("transform", d =>
        `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0) rotate(${d.x >= Math.PI ? 180 : 0})`)
        .attr("dy", "0.31em")
        .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
        .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
        .attr("paint-order", "stroke")
        .attr("fill", "white")
        .text(d => d.data.name);

    return svg.node();
    }
  fetch("flare-2.json")
  .then(r => r.json())
  .then(data => {
    const chartContainer = document.getElementById("methods-chart");
    if (chartContainer) {
      chartContainer.innerHTML = ""; // Clear any previous chart
      chartContainer.appendChild(chart(data));
    }
  });

    // style the highlight 

    const style = document.createElement('style');
    style.textContent = `
    .node.highlight {
        fill: white;
        r: 2;
    }

    .link.highlight {
        stroke: white;
        stroke-opacity: 1;
        stroke-width: 1.5;
    }
    `;
    document.head.appendChild(style);
