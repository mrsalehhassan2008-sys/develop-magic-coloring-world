export default function FeatureGraphic() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#1A1A2E] p-6">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-black text-white">🎨 Feature Graphic (1024x500)</h1>
        <p className="mb-6 text-sm font-bold text-[#A99CC4]">
          Right-click → Save As → Upload to Google Play
        </p>

        {/* Feature Graphic Canvas */}
        <div className="overflow-hidden rounded-[32px] shadow-2xl">
          <svg
            viewBox="0 0 1024 500"
            className="w-full max-w-[1024px]"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Gradient */}
            <defs>
              <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE8F4" />
                <stop offset="50%" stopColor="#E7F3FF" />
                <stop offset="100%" stopColor="#FFF6DE" />
              </linearGradient>
              <filter id="shadow">
                <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3" />
              </filter>
            </defs>

            <rect width="1024" height="500" fill="url(#bg)" />

            {/* Decorative Circles */}
            <circle cx="100" cy="100" r="60" fill="#FF7FB6" opacity="0.2" />
            <circle cx="924" cy="400" r="80" fill="#8E7CFF" opacity="0.2" />
            <circle cx="800" cy="80" r="40" fill="#FFD84D" opacity="0.3" />
            <circle cx="150" cy="420" r="50" fill="#7ED087" opacity="0.2" />

            {/* Main Title */}
            <text
              x="512"
              y="140"
              textAnchor="middle"
              fontSize="72"
              fontWeight="900"
              fill="#2E2545"
              filter="url(#shadow)"
            >
              Magic Coloring
            </text>
            <text
              x="512"
              y="210"
              textAnchor="middle"
              fontSize="72"
              fontWeight="900"
              fill="#8E7CFF"
              filter="url(#shadow)"
            >
              World
            </text>

            {/* Subtitle */}
            <text
              x="512"
              y="260"
              textAnchor="middle"
              fontSize="32"
              fontWeight="700"
              fill="#5B4B7A"
            >
              148+ Pages • Color by Numbers • Games
            </text>

            {/* Featured Emojis */}
            <text x="150" y="360" fontSize="80">🎨</text>
            <text x="280" y="360" fontSize="80">🖌️</text>
            <text x="410" y="360" fontSize="80">⭐</text>
            <text x="540" y="360" fontSize="80">🎈</text>
            <text x="670" y="360" fontSize="80">🔢</text>
            <text x="800" y="360" fontSize="80">🎭</text>

            {/* Age Badge */}
            <g transform="translate(850, 350)">
              <circle r="50" fill="#7ED087" />
              <text
                x="0"
                y="10"
                textAnchor="middle"
                fontSize="36"
                fontWeight="900"
                fill="white"
              >
                3+
              </text>
              <text
                x="0"
                y="35"
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fill="white"
              >
                YEARS
              </text>
            </g>

            {/* Bottom Banner */}
            <rect x="0" y="440" width="1024" height="60" fill="#8E7CFF" opacity="0.9" />
            <text
              x="512"
              y="478"
              textAnchor="middle"
              fontSize="24"
              fontWeight="900"
              fill="white"
            >
              ✨ Free • No Ads • Educational • Safe for Kids
            </text>
          </svg>
        </div>

        {/* Download Instructions */}
        <div className="mt-6 max-w-2xl rounded-2xl bg-[#2A2A4E] p-6 text-left">
          <h2 className="mb-3 text-lg font-black text-white">📥 How to Save</h2>
          <ol className="list-decimal space-y-2 pl-6 text-[#D9D9F0]">
            <li>Right-click on the graphic above</li>
            <li>Select "Save as PNG" or use screenshot tool</li>
            <li>Crop to exactly 1024 x 500 pixels</li>
            <li>Upload to Google Play Console → Store Listing → Feature Graphic</li>
          </ol>
          <div className="mt-4 rounded-xl bg-[#8E7CFF]/20 p-3">
            <p className="text-sm font-bold text-[#B49BE0]">
              💡 Alternative: Use the SVG code to create in Photoshop/Canva for higher quality
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
