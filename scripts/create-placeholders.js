const fs = require("fs");
const path = require("path");

const IMAGE_DIR = path.join(__dirname, "..", "public", "images");

// Ensure the images directory exists
if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

// List of images to create
const PLACEHOLDERS = [
  {
    name: "kebumen-landscape.jpg",
    color: "#3b82f6",
    icon: "🏞️",
    text: "Kebumen Landscape",
  },
  {
    name: "pantai-petanahan.jpg",
    color: "#06b6d4",
    icon: "🏖️",
    text: "Pantai Petanahan",
  },
  {
    name: "goa-jatijajar.jpg",
    color: "#22c55e",
    icon: "🌳",
    text: "Goa Jatijajar",
  },
  {
    name: "benteng-van-der-wijck.jpg",
    color: "#a16207",
    icon: "📜",
    text: "Benteng Van Der Wijck",
  },
  {
    name: "placeholder.jpg",
    color: "#6366f1",
    icon: "📷",
    text: "Image Placeholder",
  },
];

// Create a simple SVG placeholder
function createSvgPlaceholder({ color, icon, text }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="${color}" />
  <rect width="800" height="600" fill="url(#grid)" fillOpacity="0.2" />
  
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 0 0 L 40 0 L 40 40 L 0 40 Z" fill="none" stroke="white" stroke-width="1" opacity="0.2" />
    </pattern>
  </defs>
  
  <g transform="translate(400, 260)">
    <text x="0" y="0" font-family="Arial" font-size="120" text-anchor="middle" dominant-baseline="middle">${icon}</text>
  </g>
  
  <g transform="translate(400, 400)">
    <rect x="-300" y="-40" width="600" height="80" fill="rgba(0,0,0,0.5)" rx="10" ry="10" />
    <text x="0" y="15" font-family="Arial" font-size="36" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
  </g>
</svg>`;
}

// Generate and save placeholders
PLACEHOLDERS.forEach((placeholder) => {
  const filePath = path.join(
    IMAGE_DIR,
    placeholder.name.replace(".jpg", ".svg")
  );
  const svg = createSvgPlaceholder(placeholder);

  fs.writeFileSync(filePath, svg);
  console.log(
    `Created placeholder: ${placeholder.name.replace(".jpg", ".svg")}`
  );
});

console.log("\nAll placeholder images created successfully!");
console.log(`Images are available in: ${IMAGE_DIR}`);
console.log(
  "Note: These are SVG files that act as placeholders for the JPG images referenced in the code."
);
