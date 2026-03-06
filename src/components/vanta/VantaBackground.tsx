import React from 'react'

export default function VantaBackground() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#FDFBF7] pointer-events-none">
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fog-float-1 {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(15vw, 10vh) scale(1.1); }
                    66% { transform: translate(-10vw, 20vh) scale(0.9); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                @keyframes fog-float-2 {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-15vw, -10vh) scale(1.2); }
                    66% { transform: translate(10vw, -20vh) scale(0.8); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                @keyframes fog-float-3 {
                    0% { transform: translate(0, 0) scale(1.1); }
                    33% { transform: translate(10vw, -15vh) scale(0.9); }
                    66% { transform: translate(15vw, 15vh) scale(1.2); }
                    100% { transform: translate(0, 0) scale(1.1); }
                }
                @keyframes fog-float-4 {
                    0% { transform: translate(0, 0) scale(0.9); }
                    33% { transform: translate(-20vw, 15vh) scale(1.1); }
                    66% { transform: translate(-5vw, -15vh) scale(1.0); }
                    100% { transform: translate(0, 0) scale(0.9); }
                }
            `}} />

            <div className="absolute inset-0 filter blur-[100px] opacity-100 transform scale-125">
                {/* Highlight Layer (#D1C3B4) */}
                <div
                    className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vh] rounded-full mix-blend-multiply"
                    style={{
                        background: "radial-gradient(circle, rgba(209,195,180,0.8) 0%, rgba(209,195,180,0) 70%)",
                        animation: "fog-float-1 30s infinite ease-in-out"
                    }}
                />

                {/* Midtone Layer (#E8DDD5) */}
                <div
                    className="absolute top-[20%] right-[-10%] w-[60vw] h-[80vh] rounded-full mix-blend-multiply"
                    style={{
                        background: "radial-gradient(circle, rgba(232,221,213,0.9) 0%, rgba(232,221,213,0) 70%)",
                        animation: "fog-float-2 35s infinite ease-in-out"
                    }}
                />

                {/* Lowlight Layer (#FFFFFF) */}
                <div
                    className="absolute bottom-[-20%] left-[20%] w-[80vw] h-[60vh] rounded-full mix-blend-screen"
                    style={{
                        background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%)",
                        animation: "fog-float-3 32s infinite ease-in-out"
                    }}
                />

                {/* Additional Midtone Layer for Depth/Volume */}
                <div
                    className="absolute top-[30%] left-[30%] w-[60vw] h-[60vh] rounded-full mix-blend-multiply"
                    style={{
                        background: "radial-gradient(circle, rgba(232,221,213,0.7) 0%, rgba(232,221,213,0) 70%)",
                        animation: "fog-float-4 40s infinite ease-in-out"
                    }}
                />

                {/* Another Highlight for Balance */}
                <div
                    className="absolute bottom-[10%] right-[10%] w-[50vw] h-[50vh] rounded-full mix-blend-multiply"
                    style={{
                        background: "radial-gradient(circle, rgba(209,195,180,0.6) 0%, rgba(209,195,180,0) 70%)",
                        animation: "fog-float-1 38s infinite ease-in-out reverse"
                    }}
                />
            </div>
        </div>
    )
}
