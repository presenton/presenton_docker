import { cn } from "@/lib/utils"
import { Loader } from "./loader"
import { ProgressBar } from "./progress-bar"
import { useEffect, useRef } from "react"
import anime from "animejs"
import Image from "next/image"
interface OverlayLoaderProps {
    text?: string
    className?: string
    show: boolean
    showProgress?: boolean
    duration?: number
    extra_info?: string
    onProgressComplete?: () => void
}

export const OverlayLoader = ({
    text,
    className,
    show,
    showProgress = false,
    duration = 10,
    onProgressComplete,
    extra_info
}: OverlayLoaderProps) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (show && overlayRef.current && contentRef.current) {
            // Animate overlay fade in
            anime({
                targets: overlayRef.current,
                opacity: [0, 1],
                duration: 300,
                easing: 'easeInOutQuad'
            });

            // Animate content scale and fade in
            anime({
                targets: contentRef.current,
                scale: [0.9, 1],
                opacity: [0, 1],
                duration: 400,
                easing: 'easeOutQuad'
            });
        }
    }, [show]);

    if (!show) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center opacity-0"
        >
            <div
                ref={contentRef}
                className={cn(
                    "flex flex-col items-center justify-center px-6  pt-0 pb-8 rounded-xl bg-[#030303] shadow-2xl",
                    "min-w-[280px] sm:min-w-[330px] border border-white/10 opacity-0",
                    className
                )}

            >
                <img loading="eager" src={'/loading.gif'} alt="loading" width={250} height={250} />
                {showProgress ? (
                    <div className="w-full space-y-6 pt-4">
                        <ProgressBar
                            duration={duration}
                            onComplete={onProgressComplete}
                        />
                        {text && (
                            <div className="space-y-1">
                                <p className="text-white text-base text-center font-semibold font-inter">
                                    {text}
                                </p>
                                {extra_info && <p className="text-white/80 text-xs text-center font-semibold font-inter">{extra_info}</p>}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <p className="text-white text-base text-center font-semibold font-inter">
                            {text}
                        </p>
                        {extra_info && <p className="text-white/80 text-xs text-center font-semibold font-inter">{extra_info}</p>}
                    </>
                    // <div className="flex flex-col items-center gap-4">
                    //     <div className="relative">
                    //         <div className="absolute inset-0 bg-gradient-to-r from-[#9034EA] to-[#5146E5] blur-xl opacity-20" />
                    //         <Loader text={text} />
                    //     </div>

                    // </div>
                )}
            </div>
        </div>
    )
} 