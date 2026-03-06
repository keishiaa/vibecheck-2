"use client"
import React, { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function VantaBackground() {
    const [vantaEffect, setVantaEffect] = useState<any>(null)
    const vantaRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let effect: any = null;

        const initVanta = async () => {
            if (!vantaEffect && vantaRef.current) {
                try {
                    // Attach THREE to window so Vanta can find it when importing dynamically
                    if (typeof window !== 'undefined') {
                        // @ts-ignore
                        window.THREE = THREE;
                    }

                    // Import vanta dynamically to avoid SSR "window not defined" errors
                    // @ts-ignore
                    const FOG = (await import('vanta/dist/vanta.fog.min')).default

                    effect = FOG({
                        el: vantaRef.current,
                        THREE: THREE,
                        mouseControls: true,
                        touchControls: true,
                        gyroControls: false,
                        minHeight: 200.00,
                        minWidth: 200.00,

                        // Vibrant complimentary colors based on the painting:
                        // Warm Gold, Terra Cotta, Plum, Cream
                        highlightColor: 0xf4a261, // Warm Gold / Amber highlight (brightest spots)
                        midtoneColor: 0xe07a5f,   // Terra Cotta / Orange midtone (body of the mist)
                        lowlightColor: 0x8b7d9e,  // Muted Plum / Lilac lowlight (shadows)
                        baseColor: 0xfdfbf7,      // Cream / Off-white base

                        // "Fog" Parameters
                        blurFactor: 0.85,  // Very high (to keep it from looking like solid blobs)
                        zoom: 0.5,         // Large-scale noise patterns (so the clouds feel massive)
                        speed: 1.5         // Low to Medium (it should feel calming)
                    })
                    setVantaEffect(effect)
                } catch (error) {
                    console.error("Vanta initialization failed:", error);
                }
            }
        }

        initVanta();

        return () => {
            if (effect) effect.destroy()
            if (vantaEffect) vantaEffect.destroy()
        }
    }, [vantaEffect])

    return (
        <div
            ref={vantaRef}
            className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 opacity-90"
        />
    )
}
