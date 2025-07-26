(function() {
let draggedNode = null;
let isDragging = false;
let hoveredNode = null;

const tooltip = document.getElementById('tooltip');
const container = document.querySelector('#window-network .window-content');

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 50;

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);



let controls = new THREE.OrbitControls(camera, renderer.domElement);

let composer = new THREE.EffectComposer(renderer);
composer.addPass(new THREE.RenderPass(scene, camera));
let bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 2.0, 1.0, 0.0);
composer.addPass(bloomPass);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const nodes = [], nodeDataMap = new Map(), flowingEdges = [], lightPulses = [];
const bucketPositions = new Map();
const backgroundOrbs = [];

function createBackgroundOrbs(count = 5000) {
  for (let i = 0; i < count; i++) {
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x3333ff, transparent: true, opacity: 0.4 })
    );
    orb.position.set(
      (Math.random() - 0.5) * 1200,
      (Math.random() - 0.5) * 1200,
      (Math.random() - 0.5) * 1200
    );
    scene.add(orb);
    backgroundOrbs.push({ mesh: orb, velocity: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(0.02) });
  }
}

function createFlowingBeam(p1, p2, color = 0x00ffff) {
  const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  const curve = new THREE.CatmullRomCurve3([p1.clone(), mid.clone(), p2.clone()]);
  const geometry = new THREE.TubeGeometry(curve, 20, 0.1, 8, false);
  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 });
  const tube = new THREE.Mesh(geometry, material);
  scene.add(tube);
  tube.userData = { p1: p1.clone(), p2: p2.clone(), mid: mid.clone(), geometry };
  flowingEdges.push(tube);
}

function createLightPulse(p1, p2, color = 0xff00ff) {
  const geometry = new THREE.SphereGeometry(0.1, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color });
  const pulse = new THREE.Mesh(geometry, material);
  scene.add(pulse);
  let t = Math.random();
  const speed = 0.01 + Math.random() * 0.01;
  return () => {
    t += speed;
    if (t > 1) t = 0;
    pulse.position.lerpVectors(p1, p2, t);
  };
}

function initGraph(nodesData, linksData) {
  const nodeMap = new Map();
  const BUCKET_RADIUS = 40;
  const BUCKET_COUNT = nodesData.filter(n => n.group === "bucket").length;
  let bucketIndex = 0;
  let loadedCount = 0;

  nodesData.forEach((node, i) => {
    let x = 0, y = 0, z = 0;

    if (node.group === "core") {
      x = y = z = 0;
    } else if (node.group === "bucket") {
      const angle = (bucketIndex / BUCKET_COUNT) * Math.PI * 2;
      x = Math.cos(angle) * BUCKET_RADIUS;
      y = Math.sin(angle) * BUCKET_RADIUS;
      z = (Math.random() - 0.5) * BUCKET_RADIUS;
      bucketIndex++;
      bucketPositions.set(node.id, new THREE.Vector3(x, y, z));
    } else {
      const r = BUCKET_RADIUS * 3 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      x = r * Math.sin(phi) * Math.cos(theta);
      y = r * Math.sin(phi) * Math.sin(theta);
      z = r * Math.cos(phi);
    }

    const scale = node.group === "core" ? 8 : node.group === "bucket" ? 4 : 1.2;
    const color = node.group === "core" ? 0xffffff : node.group === "bucket" ? 0xff0099 : 0x00ffff;

    const geometry = new THREE.SphereGeometry(1, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.scale.set(scale, scale, scale);
    sphere.position.set(x, y, z);
    sphere.userData.label = node.id;

    scene.add(sphere);
    nodeMap.set(node.id, sphere);
    nodeDataMap.set(sphere, node.id);
    nodes.push(sphere);

    loadedCount++;
    if (loadedCount === nodesData.length) {
      linksData.forEach(link => {
        const source = nodeMap.get(link.source);
        const target = nodeMap.get(link.target);
        if (source && target) {
          createFlowingBeam(source.position, target.position);
          lightPulses.push(createLightPulse(source.position, target.position));
        }
      });
    }
  });
}

function animate() {
  requestAnimationFrame(animate);
  const t = Date.now() * 0.001;

  flowingEdges.forEach(edge => {
    const { p1, p2, mid } = edge.userData;
    const waveHeight = 8.0, waveSpeed = 0.5, frequency = 0.3;
    const animatedMid = mid.clone();
    animatedMid.y += Math.sin(t * waveSpeed + mid.x * frequency) * waveHeight;
    const newCurve = new THREE.CatmullRomCurve3([p1, animatedMid, p2]);
    const newGeometry = new THREE.TubeGeometry(newCurve, 20, 0.1, 8, false);
    edge.geometry.dispose();
    edge.geometry = newGeometry;
  });

  nodes.forEach((node, i) => {
    const scale = 1 + 0.2 * Math.sin(Date.now() * 0.002 + i);
    node.scale.set(scale, scale, scale);
  });

  backgroundOrbs.forEach(({ mesh, velocity }) => {
    mesh.position.add(velocity);
    if (mesh.position.length() > 200) mesh.position.multiplyScalar(-1);
  });

  lightPulses.forEach(p => p());

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(nodes, true);
  if (intersects.length > 0) {
    hoveredNode = intersects[0].object;
    while (hoveredNode && !hoveredNode.userData.label && hoveredNode.parent) {
      hoveredNode = hoveredNode.parent;
    }
    if (hoveredNode && hoveredNode.userData.label) {
      tooltip.style.display = 'block';
      tooltip.innerText = hoveredNode.userData.label;
    } else {
      tooltip.style.display = 'none';
      hoveredNode = null;
    }
  } else {
    tooltip.style.display = 'none';
    hoveredNode = null;
  }

  composer.render();
}

fetch('my_network.json')
  .then(res => res.json())
  .then(data => {
    initGraph(data.nodes, data.links);
    createBackgroundOrbs();
    animate();
  });

window.addEventListener('resize', () => {
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  composer.setSize(width, height);
});


window.addEventListener('mousemove', event => {
  const bounds = container.getBoundingClientRect();
  mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

  const localX = event.clientX - bounds.left;
  const localY = event.clientY - bounds.top;

  tooltip.style.left = `${localX + 10}px`;
  tooltip.style.top = `${localY + 10}px`;

  if (isDragging && draggedNode) {
    raycaster.setFromCamera(mouse, camera);
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(planeZ, intersection);
    draggedNode.position.copy(intersection);
  }
});


window.addEventListener('mousedown', () => {
  if (hoveredNode) {
    draggedNode = hoveredNode;
    isDragging = true;
    controls.enabled = false;
  }
});

window.addEventListener('mouseup', () => {
  draggedNode = null;
  isDragging = false;
  controls.enabled = true;
});
})();