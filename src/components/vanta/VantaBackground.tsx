"use client"
import React, { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
// @ts-ignore
import FOG from 'vanta/dist/vanta.fog.min'

export default function VantaBackground() {
    const [vantaEffect, setVantaEffect] = useState<any>(null)
    const vantaRef = useRef(null)

    useEffect(() => {
        if (!vantaEffect && vantaRef.current) {
            setVantaEffect(FOG({
                el: vantaRef.current,
                THREE: THREE,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                highlightColor: 0xd1c3b4,
                midtoneColor: 0xe8ddd5,
                lowlightColor: 0xffffff,
                baseColor: 0xfdfbf7,
                blurFactor: 0.8,
                zoom: 1.5,
                speed: 1.5
            }))
        }
        return () => {
            if (vantaEffect) vantaEffect.destroy()
        }
    }, [vantaEffect])

    return <div ref={vantaRef} className="absolute inset-0 z-0 pointer-events-none" />
}
