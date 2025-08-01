// Select canvas and setup context
const canvas = document.getElementById("circle-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = width;
  canvas.height = height;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const tooltip = document.getElementById("timeline-tooltip");
const barTooltip = document.getElementById("bar-tooltip");

let data = [];
let circles = [];
let yearGroups = new Map();
let hoveredYear = null;

// Utility
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

  // Assign consistent year colors
  const years = [...yearGroups.keys()].filter(y => /^\d{4}$/.test(y)).sort();
  yearColors.domain(years);

  // Create floating circles
  circles = data.map(d => ({
    x: random(5, canvas.width - 50),
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

const yearColors = d3.scaleOrdinal().range([
  "#ff00ff", "#00ffff", "#ffcc00", "#ff3300", "#33cc33",
  "#6600ff", "#00ffcc", "#cc00ff", "#3399ff", "#ff6666",
  "#ccff00", "#ff0099", "#00ff00", "#0099ff", "#ff9933",
  "#ff3399", "#66ffcc", "#cc66ff", "#33ff99", "#9900cc",
  "#ffff00", "#00ccff", "#ffccff", "#ff4444", "#44ffcc"
]);

function drawYearTimeline() {
  const svg = d3.select("#year-timeline");
  svg.selectAll("*").remove();

  const years = [...yearGroups.keys()].filter(y => /^\d{4}$/.test(y)).sort();
  const height = document.getElementById("year-sidebar").clientHeight;

  const yScale = d3.scalePoint()
    .domain(years)
    .range([30, height - 30]);

  svg.append("line")
    .attr("x1", 60).attr("x2", 60)
    .attr("y1", 20).attr("y2", height - 20)
    .attr("stroke", "black");

  const nodes = svg.selectAll("circle")
    .data(years)
    .enter()
    .append("circle")
    .attr("cx", 60)
    .attr("cy", d => yScale(d))
    .attr("r", 6)
    .attr("fill", d => (d === hoveredYear ? yearColors(d) : "white"))
    .attr("stroke", d => yearColors(d))
    .attr("class", d => `timeline-circle-${d}`)
    .on("mouseenter", (event, year) => {
      circles.forEach(c => c.highlighted = (c.year === year));
      hoveredYear = year;
    })
    .on("mouseleave", () => {
      circles.forEach(c => c.highlighted = false);
      hoveredYear = null;
    });

  svg.selectAll("text")
    .data(years)
    .enter()
    .append("text")
    .attr("x", 40)
    .attr("y", d => yScale(d) + 4)
    .attr("text-anchor", "end")
    .text(d => d)
    .style("font-size", "10px");
}

function updateTimelineHighlights() {
  d3.selectAll("#year-timeline circle")
    .attr("fill", d => (d === hoveredYear ? yearColors(d) : "white"));
}

function drawBarChart() {
  const svg = d3.select("#bar-chart-svg");
  svg.selectAll("*").remove();

  const years = [...yearGroups.keys()].filter(y => !isNaN(y)).sort();
  const yearCounts = years.map(y => ({ year: y, count: yearGroups.get(y).length }));

  const chartWidth = document.getElementById("bar-chart").clientWidth;
  const chartHeight = document.getElementById("bar-chart").clientHeight;

  const y = d3.scaleBand()
    .domain(years)
    .range([20, chartHeight - 10])
    .padding(0.2);

  const x = d3.scaleLinear()
    .domain([0, d3.max(yearCounts, d => d.count) || 1])
    .range([0, chartWidth - 70]);

  svg.selectAll("rect")
    .data(yearCounts)
    .enter()
    .append("rect")
    .attr("x", d => Math.max(chartWidth - x(d.count) - 50, 0))
    .attr("width", d => Math.max(x(d.count), 0))
    .attr("y", d => y(d.year))
    .attr("height", y.bandwidth())
    .attr("fill", "white")
    .attr("stroke", "black")
    .on("mouseenter", function(event, d) {
      d3.select(this).attr("fill", yearColors(d.year));
      barTooltip.classList.remove("hidden");
      barTooltip.innerText = `${d.count} entries in ${d.year}`;
      barTooltip.style.left = `${event.clientX - 5}px`;
      barTooltip.style.top = `${event.clientY}px`;
      circles.forEach(c => c.highlighted = (c.year === d.year));
      hoveredYear = d.year;
    })
    .on("mouseleave", function() {
      d3.select(this).attr("fill", "white");
      barTooltip.classList.add("hidden");
      circles.forEach(c => c.highlighted = false);
      hoveredYear = null;
    });

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
    ctx.lineWidth = c.highlighted ? 1.5 : 1;
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
  hoveredYear = null;

  for (let c of circles) {
    const dist = Math.hypot(mx - c.x, my - c.y);
    if (dist < c.r + 5) {
      hoveredYear = c.year;
      tooltip.classList.remove("hidden");
      tooltip.style.left = `${c.x + 12}px`; // Tooltip is placed relative to iframe
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

  if (!found) {
    tooltip.classList.add("hidden");
  }
}


function animate() {
  updatePositions();
  drawCircles();
  updateTimelineHighlights();
  requestAnimationFrame(animate);
}

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  detectHover(x, y);
  circles.forEach(c => c.highlighted = (c.year === hoveredYear));
});

// Load and kick off
fetch("cyberfeminism_manifesto_refs.json")
  .then(res => res.json())
  .then(json => {
    createCirclesFromData(json);
    animate();
  });
