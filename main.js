let typingInterval; // Global reference

// Element refs
const enterButton = document.getElementById('enter-button');
const loginScreen = document.getElementById('login-screen');
const iframeScreen = document.getElementById('iframe-screen');
const loadingScreen = document.getElementById('loading-screen');
const progressFill = document.getElementById('progress-fill');
const section1 = document.getElementById('section1');
const section2 = document.getElementById('section2');
const textElement = document.getElementById('typewriter-text');
const nextArrow = document.getElementById('next-arrow');
const backArrow = document.getElementById('back-arrow');
const nextSectionButton = document.getElementById('next-section-button');



// Dialogue t

let currentPanel = 0;

function typeWriter(text) {
  clearInterval(typingInterval);
  textElement.textContent = '';
  let i = 0;

  typingInterval = setInterval(() => {
    textElement.textContent += text.charAt(i);
    i++;
    if (i === text.length) clearInterval(typingInterval);
  }, 20);
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

enterButton.addEventListener('click', () => {
  // Fade out login screen
  loginScreen.style.opacity = 0;
  setTimeout(() => {
    loginScreen.classList.add('hidden');
    iframeScreen.classList.remove('hidden');
    iframeScreen.style.opacity = 0;
    setTimeout(() => {
      iframeScreen.style.opacity = 1;
    }, 50); // small delay to allow transition
  }, 1000); // match transition duration
});

document.addEventListener('DOMContentLoaded', () => {
  const continueButton = document.getElementById('continue-button');

  continueButton.addEventListener('click', () => {
    document.getElementById('iframe-screen').classList.add('hidden');
    loadingScreen.classList.remove('hidden');
    progressFill.style.width = '0%';

    setTimeout(() => {
      progressFill.style.width = '100%';
    }, 100);

    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      section2.classList.remove('hidden');

      // Scatter windows randomly
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      document.querySelectorAll('.window').forEach(win => {
        const left = Math.random() * (windowWidth - 400);
        const top = Math.random() * (windowHeight - 300);

        win.style.display = 'block';
        win.style.left = `${left}px`;
        win.style.top = `${top}px`;
        win.style.transform = 'none';
      });

      // Show dock
      const dock = document.getElementById('mac-dock');
      if (dock) dock.style.display = 'flex';

      const introWin = document.getElementById('window-intro');
      if (introWin) {
        introWin.style.display = 'block';
        introWin.style.zIndex = Date.now();
        typeIntro(introText);
      }
    }, 3100);
  });
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

let zIndexCounter = 3000;

// Open window on icon click
document.querySelectorAll('.desktop-icon').forEach(icon => {
  icon.addEventListener('dblclick', () => {
    const windowId = icon.dataset.window;
    const win = document.getElementById(windowId);
    if (win) {
      win.style.display = 'block';
      win.style.zIndex = ++zIndexCounter; // always one above the rest
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
    const isFullscreen = win.classList.toggle('fullscreen');

    if (isFullscreen) {
      // Remove inline styles set by dragging
      win.style.left = '';
      win.style.top = '';
      win.style.transform = '';
    } else {
      // Optional: restore to default centered state (non-fullscreen)
      win.style.left = '50%';
      win.style.top = '50%';
      win.style.transform = 'translate(-50%, -50%)';
    }
  });
});


// This is for my introduction stuff 

const introText = 
  "Welcome to my first iteration of documenting my evolving research interests. A lot of this is still fresh, raw, and in formation—but I hope it offers a glimpse into the themes that currently anchor my thinking.\n\n" +
  "I’ve always believed that no matter what gets built—buildings, cities, infrastructures—humans define space by how they inhabit it, resist it, or reshape it to serve them.\n\n" +
  "Architecture is never the end of the story. Technology, too, was supposed to expand this story: to free us, to help us create new ways of being in space, to grant us more agency and more liberty.\n\n" +
  "But what we've received instead is something far more complex. We live in a world saturated with algorithms and smart machines, woven into our environments and bodies. While this proliferation has enabled forms of liberation, it has also reproduced deeper systems of surveillance and control. The promises of empowerment feel increasingly hollow. Our ability to simply exist in space—on our terms—has been eroded. And with that, we’ve also lost a sense of authorship over the spaces we create.\n\n" +
  "This is where the body comes in. I’m drawn to questions of how technology is not just around us, but within us. Embodied technology—cyborgs, sensors, interfaces—exposes how power manifests through our most personal experiences. It’s not just about spatial politics anymore, it’s about bodily autonomy.\n\n" +
  "My design practice is one that looks for ways to reclaim both: the ability to feel, to move, to resist, to reprogram space through the body. What can design do when it prioritizes lived experience over optimization? What happens when we center the sensorial, the personal, the political body in our systems of design?\n\n" +
  "This is the framework I’m building toward: a practice rooted in reclaiming space, reclaiming our bodies, and reclaiming control. A speculative, critical, and sometimes messy design approach that asks: What if we built systems that actually centered people? What if we refused to be optimized? What if we designed for refusal, for pleasure, for protest, for autonomy?\n\n" +
  "So come explore. Click through. Read the thoughts. View the experiments. And begin to imagine with me how we might take back control—of space, of technology, and of ourselves.";

const introTyped = document.getElementById('intro-typed');
const introCursor = document.getElementById('intro-cursor');

function typeIntro(text) {
  let i = 0;
  clearInterval(typingInterval);
  introTyped.textContent = '';
  introCursor.style.display = 'inline-block';

  typingInterval = setInterval(() => {
    introTyped.textContent += text.charAt(i);
    i++;
    if (i === text.length) {
      clearInterval(typingInterval);
      introCursor.style.display = 'none';
    }
  }, 25);
}


// this is for my rhetorical stuff 

const rhetoricalText = 
  "I am hoping to learn more about interactive design, game design, mapping, and algorithmic research to explore the spatial politics embedded in everyday life. I want to create designs that actively engage audiences—designs that make people reconsider how their use of space has changed, and how their knowledge and liberties of their own bodies have been slowly stripped away from them. \n\nEssentially what I find challenging in this work is that I have little to no experience in 3D design and fabrication. Although I do want to communicate a lot of my research interests in game design mediums, I also find the realm of interactive/exhibition design fascinating. I see this type of aesthetic as an opportunity to full immerse people into my work -- similar to the works of Lauren Lee McCarthy. \n\nFor the final exhibition, I am planning on doing something projector-related (potentially putting up a recording of the network map I made on repeat so that people can both see my work and experience it. Further, for my backdrop, I was thinking of putting something sort of a mishmash collage of different artists/game designers that inspire me.\n\n In a larger sense, I’m interested in how code, design systems, and computational architectures mediate our relationship to space and the body. This project asks: What forms of power are embedded within the technologies that shape how we move, interact, and exist in space? How are bodies, especially those that are racialized, gendered, or marginalized, encoded, tracked, and disciplined through spatial technologies? What happens when architecture begins to function like an interface, and when computation becomes the underlying logic that governs how space operates? \n\nI am also curious about what it means to reclaim agency within these systems. Not through optimization or compliance, but through friction, refusal, and counter-design. I’m thinking through how the concept of the decolonized cyborg might help make sense of these relationships and open up other ways of designing with and through technological embodiment. These questions are connected to larger conversations around surveillance, infrastructure, the regulation of movement, and the politics of digital systems. I’m not trying to resolve any of these tensions, but I do want to create space to trace them, feel them, and understand them differently.\n\n For my capstone, I want to create an interactive piece that helps people examine how they use space and how technology can empower them to take back spaces that have been taken from them. I’m still figuring out the exact form, but I’m thinking about something immersive like a projection or interface that responds to movement or interaction. It wouldn’t offer a solution, but rather a way to reflect, feel, and notice what often goes unseen. I want the project to open up space for people to question how their bodies move through the world and how digital tools might support new forms of presence, control, and resistance.";

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


document.querySelectorAll('.desktop-icon').forEach(icon => {
  icon.addEventListener('dblclick', () => {
    const windowId = icon.dataset.window;
    const win = document.getElementById(windowId);

    if (win) {
      win.style.display = 'block';
      win.style.zIndex = Date.now();

      if (windowId === 'window-intro') {
        typeIntro(introText); // Will restart cleanly every time
      }
      if (windowId === 'window-rhetorical') {
        typeRhetorical(rhetoricalText);
      }
    }
  });
});


// this is for the drop down click 

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      const label = item.textContent.trim();

      if (label.startsWith("About Me")) {
        const aboutWindow = document.getElementById('window-about-me');
        if (aboutWindow) {
          aboutWindow.style.display = 'block';
        } else {
          console.warn("Could not find #window-about-me in DOM");
        }
      }

      else if (label.startsWith("Need a Guide?")) {
        const dock = document.getElementById('mac-dock');
        if (dock) {
          dock.style.display = 'flex';
        } else {
          console.warn("Could not find #mac-dock in DOM");
        }
      }

      else if (label.startsWith("Log Out")) {
        alert("Logging out...\n(You can define your own behavior here)");
      }
    });
  });
});



function closeWindow(id) {
  document.getElementById(id).style.display = 'none';
}
