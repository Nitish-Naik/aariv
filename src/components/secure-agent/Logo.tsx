export function Logo({ className = "w-8 h-8" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="proxyGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#818cf8" />
                    <stop offset="1" stopColor="#c084fc" />
                </linearGradient>
            </defs>

            {/* The Source Node */}
            <rect x="3" y="12" width="8" height="8" rx="2" fill="url(#proxyGradient)" fillOpacity="0.25" stroke="url(#proxyGradient)" strokeWidth="2.5" />

            {/* The Destination Nodes */}
            <rect x="21" y="4" width="8" height="8" rx="2" fill="url(#proxyGradient)" fillOpacity="0.25" stroke="url(#proxyGradient)" strokeWidth="2.5" />
            <rect x="21" y="20" width="8" height="8" rx="2" fill="url(#proxyGradient)" fillOpacity="0.25" stroke="url(#proxyGradient)" strokeWidth="2.5" />

            {/* The Routing Paths */}
            <path d="M11 16H16V8H21" stroke="url(#proxyGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 16H16V24H21" stroke="url(#proxyGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
