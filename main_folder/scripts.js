const filenames = [
  "CyborgManifesto.png",
  "Designsforthepluriverse.png",
  "ExtraStateCraft.jpg",
  "Feminism-Confronts-Technology-JudyWajcman.original_WEbpbCU.jpg",
  "NativeSpace.png",
  "NewDarkAge.jpg",
  "OwnThis.jpg",
  "Reassembling.jpg",
  "TacticalMedia.jpg",
  "TheSecondDigitalTurn.jpg",
  "aBurgularsGuide.jpg",
  "aWorldofManyWorlds.jpg",
  "ageofsurveillance.png",
  "architecturefromtheoutside.jpg",
  "artPlatforms.jpg",
  "bodiesincode.jpg",
  "closeUpatadistance.jpg",
  "cyborg_book.jpg",
  "dark_matters.jpg",
  "escape_overcode__34204.jpg",
  "forensicArchitecture.jpg",
  "geologyOfMedia.jpg",
  "how_we_became_posthuman.jpg",
  "indigenousdatasovereignty.jpg",
  "parablesforthevirtual.jpg",
  "platformCapitalism.jpg",
  "productionofspace.jpg",
  "programEarth.jpg",
  "raceAfterTech.jpg",
  "speculativeDreaming.jpg",
  "surveillance_aftersnowden.jpg",
  "theStack.jpg",
  "the_second_self.jpg",
  "xRayArchitecture.jpg"
];

// Rotate array utility
function rotateArray(arr, count) {
  return arr.slice(count).concat(arr.slice(0, count));
}

// Load images into each column
function loadImages(column, offset = 0, multiplier = 3) {
  const rotated = rotateArray(filenames, offset);

  for (let i = 0; i < multiplier; i++) {
    rotated.forEach(name => {
      const img = document.createElement('img');
      img.src = `bookCovers/${name}`;
      img.alt = name;
      column.appendChild(img);
    });
  }
}

const leftCol = document.getElementById('left-column');
const middleCol = document.getElementById('middle-column');
const rightCol = document.getElementById('right-column');

// Load images with different starting points
loadImages(leftCol, 0, 2);
loadImages(middleCol, 10, 4); // extra content to ensure scroll
loadImages(rightCol, 20, 2);

// Wait for all images to load, then set middleCol.scrollTop to bottom
window.addEventListener('load', () => {
  middleCol.scrollTop = middleCol.scrollHeight; // start from bottom
  autoScroll();
});

function autoScroll() {
  leftCol.scrollTop += 1;
  rightCol.scrollTop += 1;
  middleCol.scrollTop -= 1;

  // Loop back when halfway through
  if (leftCol.scrollTop >= leftCol.scrollHeight / 2) leftCol.scrollTop = 0;
  if (rightCol.scrollTop >= rightCol.scrollHeight / 2) rightCol.scrollTop = 0;
  if (middleCol.scrollTop <= 0) middleCol.scrollTop = middleCol.scrollTop;

  requestAnimationFrame(autoScroll);
}
