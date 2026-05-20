export default function DhakaDivider({ className = '' }) {
  // Dhaka fabric-inspired repeating triangle motif SVG
  return (
    <div className={`w-full overflow-hidden ${className}`} aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 24"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-6"
      >
        <defs>
          <pattern id="dhaka" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            {/* Base band */}
            <rect width="24" height="24" fill="#2D1A00" />
            {/* Gold triangle up */}
            <polygon points="0,24 12,4 24,24" fill="#E87A00" />
            {/* Red inner triangle */}
            <polygon points="4,24 12,10 20,24" fill="#C0392B" />
            {/* Dark center dot */}
            <polygon points="8,24 12,16 16,24" fill="#2D1A00" />
            {/* Top gold line */}
            <rect y="0" width="24" height="2" fill="#F5A623" />
            {/* Bottom gold line */}
            <rect y="22" width="24" height="2" fill="#F5A623" />
            {/* Vertical tick marks */}
            <rect x="0" y="2" width="1" height="4" fill="#F5A623" />
            <rect x="12" y="2" width="1" height="4" fill="#F5A623" />
            <rect x="23" y="2" width="1" height="4" fill="#F5A623" />
          </pattern>
        </defs>
        <rect width="100%" height="24" fill="url(#dhaka)" />
      </svg>
    </div>
  )
}
