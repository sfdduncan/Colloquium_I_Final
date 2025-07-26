const communityFilenames = [
  "Amy_Freeman.jpg", "Drew.jpg", "Elizabeth.png", "Heidegger.png", "Kaoru.png",
  "Lauren_lee.jpg", "Paolo.jpg", "Shoshana.png", "Stephanie.png", "Trebor.jpg",
  "Troy.jpg", "VioletWhitney.jpeg"
];

const communityGallery = document.getElementById('community-gallery');

// Load all the images
communityFilenames.forEach(name => {
  const img = document.createElement('img');
  img.src = `artists_designer/${name}`;
  img.alt = name.split('.')[0];
  img.classList.add('community-image');
  communityGallery.appendChild(img);
});

// Manual scroll with arrows
document.getElementById('community-arrow-left').addEventListener('click', () => {
  communityGallery.scrollBy({ left: -300, behavior: 'smooth' });
});

document.getElementById('community-arrow-right').addEventListener('click', () => {
  communityGallery.scrollBy({ left: 300, behavior: 'smooth' });
});

// Auto-scroll fix
let communityAutoScroll;

function startCommunityAutoScroll() {
  communityAutoScroll = setInterval(() => {
    const maxScroll = communityGallery.scrollWidth - communityGallery.clientWidth;
    if (communityGallery.scrollLeft >= maxScroll) {
      communityGallery.scrollLeft = 0;
    } else {
      communityGallery.scrollLeft += 1;
    }
  }, 1); // Lower = faster
}

function stopCommunityAutoScroll() {
  clearInterval(communityAutoScroll);
}

// Pause auto-scroll on hover
communityGallery.addEventListener('mouseenter', stopCommunityAutoScroll);
communityGallery.addEventListener('mouseleave', startCommunityAutoScroll);

// Start on load
startCommunityAutoScroll();
