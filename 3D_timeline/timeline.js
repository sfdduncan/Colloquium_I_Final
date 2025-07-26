// Select canvas and setup context
const canvas = document.getElementById("circle-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas); // this will help me later when I need to add it to window 

const tooltip = document.getElementById("tooltip");
const barTooltip = document.getElementById("bar-tooltip"); // for popups

let data = [];
let circles = [];
let yearGroups = new Map();

// Vibrant Y2K-style colors (expand as needed)
const yearColors = d3.scaleOrdinal()
  .domain([...yearGroups.keys()].sort())
  .range([
    "#ff00ff", "#00ffff", "#ffcc00", "#ff3300", "#33cc33",
    "#6600ff", "#00ffcc", "#cc00ff", "#3399ff", "#ff6666",
    "#ccff00", "#ff0099", "#00ff00", "#0099ff", "#ff9933",
    "#ff3399", "#66ffcc", "#cc66ff", "#33ff99", "#9900cc",
    "#ffff00", "#00ccff", "#ffccff", "#ff4444", "#44ffcc"
  ]);

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function createCirclesFromData(jsonData) {
  data = jsonData;

  // Group data by year
  jsonData.forEach(d => {
    if (!yearGroups.has(d.year)) yearGroups.set(d.year, []);
    yearGroups.get(d.year).push(d);
  });

  // Create floating circles
  circles = data.map(d => ({
    x: random(120, canvas.width - 50),
    y: random(50, canvas.height - 50),
    vx: random(-0.3, 0.3),
    vy: random(-0.3, 0.3),
    r: 6,
    data: d,
    year: d.year,
    highlighted: false
  }));

  drawYearTimeline();
  drawBarChart();
}

function drawYearTimeline() {
  const svg = d3.select("#year-timeline");
  svg.selectAll("*").remove();

  const years = [...yearGroups.keys()]
    .filter(y => y && /^\d{4}$/.test(y))  // keep only 4-digit numeric years
  .sort();
  const height = document.getElementById("year-sidebar").clientHeight;

  const yScale = d3.scalePoint()
    .domain(years)
    .range([30, height - 30]);

  svg.append("line")
    .attr("x1", 50).attr("x2", 50)
    .attr("y1", 20).attr("y2", height - 20)
    .attr("stroke", "black");

  // Year nodes
  svg.selectAll("circle")
    .data(years)
    .enter()
    .append("circle")
    .attr("cx", 50)
    .attr("cy", d => yScale(d))
    .attr("r", 6)
    .attr("fill", "white")
    .attr("stroke", "black")
    .on("mouseenter", (event, year) => {
      circles.forEach(c => c.highlighted = (c.year === year));
    })
    .on("mouseleave", () => {
      circles.forEach(c => c.highlighted = false);
    });

  svg.selectAll("text")
    .data(years)
    .enter()
    .append("text")
    .attr("x", 30)
    .attr("y", d => yScale(d) + 4)
    .attr("text-anchor", "end")
    .text(d => d)
    .style("font-size", "10px");
}

function drawBarChart() {
  const svg = d3.select("#bar-chart-svg");
  svg.selectAll("*").remove();

  const years = [...yearGroups.keys()].filter(y => y && !isNaN(y)).sort();
  const yearCounts = years.map(y => ({ year: y, count: yearGroups.get(y).length }));

  const chartWidth = document.getElementById("bar-chart").clientWidth;
  const chartHeight = document.getElementById("bar-chart").clientHeight;

  const y = d3.scaleBand()
    .domain(years)
    .range([20, chartHeight - 10])
    .padding(0.2);

const x = d3.scaleLinear()
  .domain([0, d3.max(yearCounts, d => d.count) || 1]) // fallback to 1 if undefined
  .range([0, chartWidth - 70]);


  // Draw bars that grow leftward
svg.selectAll("rect")
  .data(yearCounts)
  .enter()
  .append("rect")
  .attr("x", d => {
    const barWidth = x(d.count);
    return Math.max(chartWidth - barWidth - 50, 0); // prevent negative x
  })
  .attr("width", d => Math.max(x(d.count), 0)) // clamp to prevent negative widths
  .attr("y", d => y(d.year))
  .attr("height", y.bandwidth())
  .attr("fill", "white")
  .attr("stroke", "black")
    .on("mouseenter", function(event, d) {
      d3.select(this).attr("fill", "black");
      barTooltip.classList.remove("hidden");
      barTooltip.innerText = `${d.count} entries in ${d.year}`;
      barTooltip.style.left = `${event.clientX - 5}px`;
      barTooltip.style.top = `${event.clientY}px`;
      circles.forEach(c => c.highlighted = (c.year === d.year));
    })
    .on("mouseleave", function() {
      d3.select(this).attr("fill", "none");
      barTooltip.classList.add("hidden");
      circles.forEach(c => c.highlighted = false);
    });

  // Year text labels
  svg.selectAll("text")
    .data(yearCounts)
    .enter()
    .append("text")
    .attr("x", chartWidth - 10)
    .attr("y", d => y(d.year) + y.bandwidth() / 4 + 8)
    .attr("text-anchor", "end")
    .text(d => d.year)
    .style("font-size", "10px");

}

function drawCircles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let c of circles) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    
    ctx.fillStyle = c.highlighted ? yearColors(c.year) : "white";
    ctx.strokeStyle = c.highlighted ? "black" : yearColors(c.year);
    ctx.lineWidth = c.highlighted ? 1 : 1;
    
    ctx.fill();
    ctx.stroke();
  }
}



function updatePositions() {
  for (let c of circles) {
    c.x += c.vx;
    c.y += c.vy;
    if (c.x < 120 + c.r || c.x > canvas.width - c.r) c.vx *= -1;
    if (c.y < c.r || c.y > canvas.height - c.r) c.vy *= -1;
  }
}

function detectHover(mx, my) {
  let found = false;
  for (let c of circles) {
    const dist = Math.hypot(mx - c.x, my - c.y);
    if (dist < c.r + 4) {
      tooltip.classList.remove("hidden");
      tooltip.style.left = `${c.x + 12}px`;
      tooltip.style.top = `${c.y + 12}px`;
      tooltip.innerHTML = `
        <strong>${c.data.project || 'Untitled'}</strong><br>
        <em>${(c.data.authors || []).join(', ')}</em><br>
        <small>${c.data.year}</small><br><br>
        ${c.data.excerpt || ''}
      `;
      found = true;
      break;
    }
  }
  if (!found) tooltip.classList.add("hidden");
}

function animate() {
  updatePositions();
  drawCircles();
  requestAnimationFrame(animate);
}

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  detectHover(e.clientX - rect.left, e.clientY - rect.top);
});

// Load JSON and kickstart the app
fetch("cyberfeminism_manifesto_refs.json")
  .then(res => res.json())
  .then(json => {
    createCirclesFromData(json);
    animate();
  });
