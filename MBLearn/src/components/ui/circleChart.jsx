export default function CircleChart({
    size = 120,
    strokeWidth = 10,
    value = 12,
    label = "",
    color = "hsl(218,97%,26%)",
    backgroundColor = "#E0E0E0",
    textColor = "#000",
    type,
    assesmentScore,
    assesmentTotalItem

}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative" style={{width: size,height: size}}>
            <svg width={size} height={size}>
                <circle
                    stroke={backgroundColor}
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={radius}
                    cx={size/2}
                    cy={size/2}
                    />
                <circle
                    stroke={color}
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    r={radius}
                    cx={size/2}
                    cy={size/2}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{transition: "stroke-dashoffset 0.5s ease"}}
                />
            </svg>
            {type === "finished" ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <p className="font-header text-4xl text-primary">{value}%</p>
                            <p className="font-text text-xs text-unactive">Assesment <br/> Performance</p>
                        </div>
                ):null}
        </div>
    )
}
