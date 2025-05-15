'use client'
import React, { useEffect, useState, useRef } from 'react';
import anime from 'animejs';

interface ProgressBarProps {
    duration: number;
    onComplete?: () => void;
}

export const ProgressBar = ({ duration, onComplete }: ProgressBarProps) => {
    const [progress, setProgress] = useState(0);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);
    const startTime = useRef<number>(Date.now());
    const progressBarRef = useRef<HTMLDivElement>(null);
    const gradientRef = useRef<anime.AnimeInstance | null>(null);

    useEffect(() => {
        // Animate gradient
        if (progressBarRef.current) {
            gradientRef.current = anime({
                targets: progressBarRef.current,
                backgroundPosition: ['0% 50%', '100% 50%'],
                duration: 2000,
                loop: true,
                direction: 'alternate',
                easing: 'linear'
            });
        }

        const updateProgress = () => {
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime.current;
            const calculatedProgress = (elapsedTime / (duration * 1000)) * 100;

            if (calculatedProgress >= 95) {
                setProgress(95);
                if (progressInterval.current) {
                    clearInterval(progressInterval.current);
                }
                onComplete?.();
                return;
            }

            // Slow down progress after 90%
            if (calculatedProgress > 90) {
                const remainingProgress = Math.min(99 - progress, 0.1);
                setProgress(prev => prev + remainingProgress);
            } else {
                setProgress(Math.min(calculatedProgress, 90));
            }
        };

        progressInterval.current = setInterval(updateProgress, 50);

        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
            if (gradientRef.current) {
                gradientRef.current.pause();
            }
        };
    }, [duration, onComplete]);

    return (
        <div className="w-full space-y-2">
            <div className="flex justify-end items-center text-white/80 text-sm">
                {/* <span>Processing...</span> */}
                <span className='font-inter  text-end font-medium text-xs'>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                <div
                    ref={progressBarRef}
                    className="h-full bg-gradient-to-r from-[#9034EA] via-[#5146E5] to-[#9034EA] rounded-full"
                    style={{
                        width: `${progress}%`,
                        backgroundSize: '200% 100%',
                        transition: 'width 0.3s ease-out'
                    }}
                />
            </div>

        </div>
    );
}; 