import React from 'react'

export default function VantaBackground() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#FDFBF7] pointer-events-none">
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fog-float-1 {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(25vw, 15vh) scale(1.2); }
                    66% { transform: translate(-15vw, 30vh) scale(0.9); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                @keyframes fog-float-2 {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-25vw, -15vh) scale(1.25); }
                    66% { transform: translate(15vw, -30vh) scale(0.75); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                @keyframes fog-float-3 {
                    0% { transform: translate(0, 0) scale(1.1); }
                    33% { transform: translate(15vw, -25vh) scale(0.9); }
                    66% { transform: translate(25vw, 25vh) scale(1.25); }
                    100% { transform: translate(0, 0) scale(1.1); }
                }
                @keyframes fog-float-4 {
                    0% { transform: translate(0, 0) scale(0.9); }
                    33% { transform: translate(-30vw, 25vh) scale(1.15); }
                    66% { transform: translate(-10vw, -25vh) scale(1.05); }
                    100% { transform: translate(0, 0) scale(0.9); }
                }
                @keyframes fog-float-5 {
                    0% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(20vw, -20vh) scale(1.3); }
                    100% { transform: translate(0, 0) scale(1); }
                }
            `}} />

            <div className="absolute inset-0 filter blur-[70px] md:blur-[90px] opacity-90 transform scale-125">
                {/* Deep Blue / Sky */}
                <div
                    className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vh] rounded-full mix-blend-multiply"
                    style={{
                        background: "radial-gradient(circle, rgba(60,160,255,0.7) 0%, rgba(60,160,255,0) 75%)",
                        animation: "fog-float-1 20s infinite ease-in-out"
                    }}
                />

                {/* Vibrant Coral / Peach */}
                <div
                    className="absolute top-[20%] right-[-10%] w-[80vw] h-[90vh] rounded-full mix-blend-multiply"
                    style={{
                        background: "radial-gradient(circle, rgba(255,140,100,0.65) 0%, rgba(255,140,100,0) 75%)",
                        animation: "fog-float-2 25s infinite ease-in-out"
                    }}
                />

                {/* Luminous Lilac */}
                <div
                    className="absolute bottom-[-20%] left-[10%] w-[90vw] h-[80vh] rounded-full mix-blend-multiply"
                    style={{
                        background: "radial-gradient(circle, rgba(180,100,255,0.6) 0%, rgba(180,100,255,0) 75%)",
                        animation: "fog-float-3 22s infinite ease-in-out"
                    }}
                />

                {/* Bright Amber / Gold */}
                <div
                    className="absolute top-[30%] left-[30%] w-[70vw] h-[70vh] rounded-full mix-blend-multiply"
                    style={{
                        background: "radial-gradient(circle, rgba(255,200,80,0.6) 0%, rgba(255,200,80,0) 75%)",
                        animation: "fog-float-4 28s infinite ease-in-out"
                    }}
                />

                {/* Cool Cyan / Mint */}
                <div
                    className="absolute bottom-[0%] right-[0%] w-[75vw] h-[75vh] rounded-full mix-blend-multiply"
                    style={{
                        background: "radial-gradient(circle, rgba(40,220,180,0.65) 0%, rgba(40,220,180,0) 75%)",
                        animation: "fog-float-5 26s infinite ease-in-out"
                    }}
                />
            </div>
        </div>
    )
}
