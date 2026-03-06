export default function AuraBackground() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#FDFBF7] pointer-events-none">
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes aura-float-1 {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(15vw, 15vh) scale(1.15); }
                    66% { transform: translate(-10vw, 5vh) scale(0.9); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                @keyframes aura-float-2 {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-15vw, -15vh) scale(1.1); }
                    66% { transform: translate(10vw, -10vh) scale(0.85); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                @keyframes aura-float-3 {
                    0% { transform: translate(0, 0) scale(1.1); }
                    33% { transform: translate(15vw, -20vh) scale(0.9); }
                    66% { transform: translate(5vw, 15vh) scale(1.2); }
                    100% { transform: translate(0, 0) scale(1.1); }
                }
                @keyframes aura-float-4 {
                    0% { transform: translate(0, 0) scale(0.9); }
                    33% { transform: translate(-20vw, 10vh) scale(1.2); }
                    66% { transform: translate(-5vw, -15vh) scale(1); }
                    100% { transform: translate(0, 0) scale(0.9); }
                }
            `}} />

            <div className="absolute inset-0 filter blur-[80px] md:blur-[120px] opacity-100">
                {/* Soft Peach Aura */}
                <div
                    className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vh] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(244,208,181,1) 0%, rgba(244,208,181,0) 70%)",
                        animation: "aura-float-1 25s infinite ease-in-out"
                    }}
                />

                {/* Warm Taupe Aura */}
                <div
                    className="absolute top-[30%] right-[-10%] w-[70vw] h-[70vh] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(209,195,180,1) 0%, rgba(209,195,180,0) 70%)",
                        animation: "aura-float-2 30s infinite ease-in-out"
                    }}
                />

                {/* Light Cream/Dusty Rose Aura */}
                <div
                    className="absolute bottom-[-20%] left-[20%] w-[80vw] h-[60vh] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(232,221,213,1) 0%, rgba(232,221,213,0) 70%)",
                        animation: "aura-float-3 28s infinite ease-in-out"
                    }}
                />

                {/* Additional Warm Amber / Coral Aura to add richness */}
                <div
                    className="absolute top-[10%] left-[30%] w-[50vw] h-[50vh] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(224,122,95,0.55) 0%, rgba(224,122,95,0) 70%)",
                        animation: "aura-float-4 35s infinite ease-in-out"
                    }}
                />
            </div>

            {/* Extremely subtle grain for texture (optional but adds chic feel) */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml;utf8,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }}></div>
        </div>
    )
}
