let typingInterval; // Global reference
const chipmunkSoundSrc = "chipmunk.mp3"; // your file path

// Element refs
const enterButton = document.getElementById('enter-button');
const loginScreen = document.getElementById('login-screen');
const loadingScreen = document.getElementById('loading-screen');
const progressFill = document.getElementById('progress-fill');
const section1 = document.getElementById('section1');
const section2 = document.getElementById('section2');
const textElement = document.getElementById('typewriter-text');
const nextArrow = document.getElementById('next-arrow');
const backArrow = document.getElementById('back-arrow');
const nextSectionButton = document.getElementById('next-section-button');
const chipmunkSound = new Audio("chipmunk.mp3");
chipmunkSound.volume = 0.1; // Lower so it’s ambient, not annoying


// Dialogue text
const panels = [
  "Welcome to my first iteration of documenting my evolving research interests. A lot of this is still fresh, raw, and in formation—but I hope it offers a glimpse into the themes that currently anchor my thinking.",
  
  "I’ve always believed that no matter what gets built—buildings, cities, infrastructures—humans define space by how they inhabit it, resist it, or reshape it to serve them.",
  
  "Architecture is never the end of the story. Technology, too, was supposed to expand this story: to free us, to help us create new ways of being in space, to grant us more agency and more liberty.",
  
  "But what we've received instead is something far more complex. We live in a world saturated with algorithms and smart machines, woven into our environments and bodies. While this proliferation has enabled forms of liberation, it has also reproduced deeper systems of surveillance and control. The promises of empowerment feel increasingly hollow. Our ability to simply exist in space—on our terms—has been eroded. And with that, we’ve also lost a sense of authorship over the spaces we create.",

  "This is where the body comes in. I’m drawn to questions of how technology is not just around us, but within us. Embodied technology—cyborgs, sensors, interfaces—exposes how power manifests through our most personal experiences. It’s not just about spatial politics anymore, it’s about bodily autonomy.",
  
  "My design practice is one that looks for ways to reclaim both: the ability to feel, to move, to resist, to reprogram space through the body. What can design do when it prioritizes lived experience over optimization? What happens when we center the sensorial, the personal, the political body in our systems of design?",

  "This is the framework I’m building toward: a practice rooted in reclaiming space, reclaiming our bodies, and reclaiming control. A speculative, critical, and sometimes messy design approach that asks: What if we built systems that actually centered people? What if we refused to be optimized? What if we designed for refusal, for pleasure, for protest, for autonomy?",

  "So come explore. Click through. Read the thoughts. View the experiments. And begin to imagine with me how we might take back control—of space, of technology, and of ourselves."
];

let currentPanel = 0;

function typeWriter(text) {
  clearInterval(typingInterval);
  textElement.textContent = '';
  let i = 0;

  // 🔊 Play chipmunk sound ONCE at start
  const chip = chipmunkSound.cloneNode();
  chip.volume = 0.1;
  chip.currentTime = 0;
  chip.play();

  typingInterval = setInterval(() => {
    textElement.textContent += text.charAt(i);
    i++;
    if (i === text.length) clearInterval(typingInterval);
  }, 30);
}

function updatePanel(index) {
  if (index >= 0 && index < panels.length) {
    currentPanel = index;
    typeWriter(panels[currentPanel]);

    if (index === panels.length - 1) {
      // Final panel — hide arrows, show section button
      backArrow.style.display = 'none';
      nextArrow.style.display = 'none';
      nextSectionButton.classList.remove('hidden');
    } else {
      // Intermediate panels — show arrows, hide section button
      backArrow.style.display = index > 0 ? 'inline' : 'none';
      nextArrow.style.display = 'inline';
      nextSectionButton.classList.add('hidden');
    }
  }
}

// Handle login → loading → section1
enterButton.addEventListener('click', () => {
  loginScreen.classList.add('hidden');
  loadingScreen.classList.remove('hidden');

  setTimeout(() => {
    progressFill.style.width = '100%';
  }, 100);

  setTimeout(() => {
    loadingScreen.classList.add('hidden');
    section1.classList.remove('hidden');
    updatePanel(0);
  }, 3100);
});

// Arrows
nextArrow?.addEventListener('click', () => {
  if (currentPanel < panels.length - 1) {
    updatePanel(currentPanel + 1);
  }
});

backArrow?.addEventListener('click', () => {
  if (currentPanel > 0) {
    updatePanel(currentPanel - 1);
  }
});

// Section transition
nextSectionButton?.addEventListener('click', () => {
  section1.classList.add('fade-out');
  setTimeout(() => {
    section1.classList.add('hidden');
    section2.classList.remove('hidden');
  }, 1000); // matches fade-out CSS
});

// Load 3D model into login screen (can be removed if no longer needed)
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(300, 300);
document.getElementById('model-container').appendChild(renderer.domElement);

const light = new THREE.HemisphereLight(0xffffff, 0x444444);
scene.add(light);

const loader = new THREE.GLTFLoader();
loader.load('head.glb', function (gltf) {
  const model = gltf.scene;
  model.scale.set(5, 5, 5);
  model.position.set(0, -1, 0);
  scene.add(model);

  animate();

  function animate() {
    requestAnimationFrame(animate);
    model.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
});



// This is section 2 desktop stuff 

// Make desktop icons draggable
const icons = document.querySelectorAll('.desktop-icon');

icons.forEach(icon => {
  icon.addEventListener('mousedown', function (e) {
    const el = this;
    const shiftX = e.clientX - el.getBoundingClientRect().left;
    const shiftY = e.clientY - el.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
      el.style.left = pageX - shiftX + 'px';
      el.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(event) {
      moveAt(event.pageX, event.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);

    el.onmouseup = function () {
      document.removeEventListener('mousemove', onMouseMove);
      el.onmouseup = null;
    };
  });

  icon.ondragstart = function () {
    return false;
  };
});

// This is the make my little icons draggable 

function makeIconsDraggable() {
  const icons = document.querySelectorAll('.desktop-icon');

  icons.forEach(icon => {
    icon.addEventListener('mousedown', function (e) {
      const el = this;
      const shiftX = e.clientX - el.getBoundingClientRect().left;
      const shiftY = e.clientY - el.getBoundingClientRect().top;

      // Set position to absolute in case it's not
      el.style.position = 'absolute';
      el.style.zIndex = 1000;

      function moveAt(pageX, pageY) {
        el.style.left = `${pageX - shiftX}px`;
        el.style.top = `${pageY - shiftY}px`;
      }

      function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
      }

      window.addEventListener('mousemove', onMouseMove);

      function onMouseUp() {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      }

      window.addEventListener('mouseup', onMouseUp);
    });
    

    // Prevent native drag behavior
    icon.ondragstart = () => false;
  });
}

window.addEventListener('load', () => {
  placeIconsRandomly();
  makeIconsDraggable();
});


// This part styles my popup windows 

// Open window on icon click
document.querySelectorAll('.desktop-icon').forEach(icon => {
  icon.addEventListener('dblclick', () => {
    const windowId = icon.dataset.window;
    const win = document.getElementById(windowId);
    if (win) {
      win.style.display = 'block';
      win.style.zIndex = Date.now(); // Bring to front
    }
  });
});

// Close window on X button click
document.querySelectorAll('.window-close').forEach(button => {
  button.addEventListener('click', (e) => {
    const win = e.target.closest('.window');
    win.style.display = 'none';
  });
});

document.querySelectorAll('.window').forEach(win => {
  const header = win.querySelector('.window-header');
  let offsetX = 0, offsetY = 0, isDragging = false;

  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    win.style.zIndex = Date.now();
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      // Calculate proposed new position
      let newLeft = e.clientX - offsetX;
      let newTop = e.clientY - offsetY;

      // Clamp it so window doesn't go out of bounds
      newLeft = Math.max(0, Math.min(window.innerWidth - win.offsetWidth, newLeft));
      newTop = Math.max(0, Math.min(window.innerHeight - win.offsetHeight, newTop));

      win.style.left = `${newLeft}px`;
      win.style.top = `${newTop}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
});


document.querySelectorAll('.window-maximize').forEach(button => {
  button.addEventListener('click', e => {
    const win = e.target.closest('.window');
    win.classList.toggle('fullscreen');
  });
});


// this is for my rhetorical stuff 

const rhetoricalText = 
  "I am hoping to learn more about interactive design, game design, mapping, and algorithmic research to explore the spatial politics embedded in everyday life. I want to create designs that actively engage audiences—designs that make people reconsider how their use of space has changed, and how their knowledge and liberties of their own bodies have been slowly stripped away from them.";

  const rhetoricalOutput = document.getElementById('rhetorical-text');
const rhetoricalCursor = document.getElementById('rhetorical-cursor');

function typeRhetorical(text) {
  let i = 0;
  rhetoricalOutput.textContent = '';
  rhetoricalCursor.style.display = 'inline-block';

  const interval = setInterval(() => {
    rhetoricalOutput.textContent += text.charAt(i);
    i++;
    if (i === text.length) {
      clearInterval(interval);
      rhetoricalCursor.style.display = 'none';
    }
  }, 25); // adjust typing speed here
}

// Trigger when window opens (or however you'd like)
typeRhetorical(rhetoricalText);


icon.addEventListener('dblclick', () => {
  const win = document.getElementById('window-rhetorical');
  if (win) {
    win.style.display = 'block';
    win.style.zIndex = Date.now();
    typeRhetorical(rhetoricalText); // trigger typing here
  }
});
