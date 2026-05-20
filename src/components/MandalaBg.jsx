export default function MandalaBg({ size = 600, className = '' }) {
  return (
    <div
      className={`absolute pointer-events-none select-none ${className}`}
      aria-hidden="true"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', opacity: 0.04 }}
      >
        <g fill="none" stroke="#E87A00" strokeWidth="0.5" transform="translate(100,100)">
          {/* Outer rings */}
          {[90, 80, 70, 60, 50, 40, 30, 20, 10].map(r => (
            <circle key={r} cx="0" cy="0" r={r} />
          ))}
          {/* 16-petal lotus */}
          {Array.from({ length: 16 }, (_, i) => {
            const angle = (i * 360) / 16
            const rad = (angle * Math.PI) / 180
            const x = Math.cos(rad) * 60
            const y = Math.sin(rad) * 60
            const x2 = Math.cos(rad + 0.4) * 30
            const y2 = Math.sin(rad + 0.4) * 30
            return (
              <path
                key={i}
                d={`M0,0 Q${x2},${y2} ${x},${y} Q${-x2},${-y2} 0,0`}
              />
            )
          })}
          {/* 8-spoke lines */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i * 360) / 8
            const rad = (angle * Math.PI) / 180
            return (
              <line
                key={i}
                x1="0" y1="0"
                x2={Math.cos(rad) * 90}
                y2={Math.sin(rad) * 90}
              />
            )
          })}
          {/* Inner decorative triangles */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i * 360) / 8
            const rad = (angle * Math.PI) / 180
            const x = Math.cos(rad) * 45
            const y = Math.sin(rad) * 45
            const lx = Math.cos(rad - 0.3) * 25
            const ly = Math.sin(rad - 0.3) * 25
            const rx = Math.cos(rad + 0.3) * 25
            const ry = Math.sin(rad + 0.3) * 25
            return <polygon key={i} points={`${x},${y} ${lx},${ly} ${rx},${ry}`} />
          })}
          {/* Center star */}
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i * 360) / 6
            const rad = (angle * Math.PI) / 180
            return (
              <line
                key={i}
                x1={Math.cos(rad) * 5} y1={Math.sin(rad) * 5}
                x2={Math.cos(rad) * 15} y2={Math.sin(rad) * 15}
              />
            )
          })}
          <circle cx="0" cy="0" r="5" fill="#E87A00" fillOpacity="0.3" />
        </g>
      </svg>
    </div>
  )
}
