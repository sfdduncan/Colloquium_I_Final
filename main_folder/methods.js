function chart(data) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const cx = width / 2;
  const cy = height / 2;
  const treeSize = [400, 200];

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "#0044aa");

  const root = d3.hierarchy(data);
  root.x = cx;
  root.y = cy;

  const buckets = root.children ?? [];

  // Manually define layout positions (including 2 N buckets)
  const layout = [
    { direction: "north", angle: 270, x: cx - 80, y: cy - 150 },
    { direction: "north", angle: 270, x: cx + 80, y: cy - 150 },
    { direction: "east",  angle: 0,   x: cx + 150, y: cy },
    { direction: "south", angle: 90,  x: cx,y: cy + 150 },
    { direction: "west",  angle: 180, x: cx - 150, y: cy }
  ];

  const allNodes = [root];
  const allLinks = [];

  buckets.forEach((bucket, i) => {
    const { direction, angle, x, y } = layout[i];
    bucket.direction = direction;

    const tree = d3.tree().size(treeSize);
    const treeRoot = tree(bucket); // reuse actual hierarchy

    treeRoot.each(d => {
      const dx = d.x - treeSize[0] / 2;
      const dy = d.y;

      let px = dx;
      let py = dy;

      if (angle === 0) {
        px = x + dy;
        py = y + dx;
      } else if (angle === 90) {
        px = x - dx;
        py = y + dy;
      } else if (angle === 180) {
        px = x - dy;
        py = y - dx;
      } else if (angle === 270) {
        px = x + dx;
        py = y - dy;
      }

      d.x = px;
      d.y = py;
      d.direction = direction;
    });

    treeRoot.descendants().forEach(d => {
      d.depth += 1;
      allNodes.push(d);
    });

    treeRoot.links().forEach(link => {
      allLinks.push({ source: link.source, target: link.target, direction });
    });

    bucket.x = x;
    bucket.y = y;
    allLinks.push({ source: root, target: bucket, direction });
  });

  // Curved link generator
  function curvedLink(d) {
    const isVertical = d.direction === "north" || d.direction === "south";
    if (isVertical) {
      const midY = (d.source.y + d.target.y) / 2;
      return `
        M${d.source.x},${d.source.y}
        C${d.source.x},${midY}
         ${d.target.x},${midY}
         ${d.target.x},${d.target.y}
      `;
    } else {
      const midX = (d.source.x + d.target.x) / 2;
      return `
        M${d.source.x},${d.source.y}
        C${midX},${d.source.y}
         ${midX},${d.target.y}
         ${d.target.x},${d.target.y}
      `;
    }
  }

  // Draw links
  svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 1.5)
    .selectAll("path")
    .data(allLinks)
    .join("path")
    .attr("d", curvedLink);

  // Draw dots
  svg.append("g")
    .selectAll("circle")
    .data(allNodes)
    .join("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 3)
    .attr("fill", "white");

  // Draw labels
  svg.append("g")
    .selectAll("text")
    .data(allNodes)
    .join("text")
    .attr("transform", d => {
      if (d === root) return `translate(${d.x},${d.y - 14})`;
      if (d.direction === "north") return `translate(${d.x},${d.y - 10}) rotate(270)`;
      if (d.direction === "south") return `translate(${d.x},${d.y + 10}) rotate(90)`;
      if (d.direction === "east")  return `translate(${d.x + 8},${d.y})`;
      if (d.direction === "west")  return `translate(${d.x - 8},${d.y})`;
      return `translate(${d.x + 6},${d.y})`;
    })
    .attr("text-anchor", d => {
      if (d === root) return "middle";
      if (d.direction === "west") return "end";
      return "start";
    })
    .attr("alignment-baseline", "middle")
    .attr("paint-order", "stroke")
    .attr("stroke", "black")
    .attr("stroke-width", 3)
    .attr("fill", "white")
    .attr("font-size", 25)
    .text(d => d.data.name);

  return svg.node();
}

// Load and render
fetch('flare-2.json')
  .then(response => response.json())
  .then(data => {
    document.body.style.margin = 0;
    document.body.style.padding = 0;
    document.body.style.overflow = 'hidden';
    document.body.style.background = "#0044aa";
    document.body.appendChild(chart(d3.hierarchy(data)));
  });
