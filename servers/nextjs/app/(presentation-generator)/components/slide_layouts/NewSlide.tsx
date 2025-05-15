import { Trash2 } from 'lucide-react';
import React from 'react'

interface NewSlideProps {
    onSelectLayout: (type: number) => void;
    setShowNewSlideSelection: (show: boolean) => void;
}

const LayoutPreview = ({ type }: { type: string }) => {
    switch (type) {
        case 'type1':
            return (
                <div className="w-full h-[120px] bg-white p-3 flex items-center gap-2">
                    <div className="w-1/2 space-y-1.5">
                        <div className="h-3 bg-gray-200 w-3/4"></div>
                        <div className="h-2 bg-gray-100 w-3/4"></div>
                    </div>
                    <div className="w-1/2 h-full bg-gray-100 flex items-center justify-center">
                        <p className='text-gray-500 text-sm'>image</p>
                    </div>
                </div>
            )
        case 'type2':
            return (
                <div className="w-full h-[120px] bg-white p-3 flex flex-col gap-2">
                    <div className="h-3 bg-gray-200 w-1/2 mx-auto"></div>
                    <div className="flex gap-2 flex-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex-1 bg-gray-100 p-1.5">
                                <div className="h-2 bg-gray-200 w-3/4 mb-1"></div>
                                <div className="h-1.5 bg-gray-50 w-full"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        case 'type4':
            return (
                <div className="w-full h-[120px] bg-white p-3 flex flex-col gap-2">
                    <div className="h-3 bg-gray-200 w-1/2 mx-auto"></div>
                    <div className="grid grid-cols-3 gap-2 flex-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-gray-100 p-1.5">
                                <div className="h-8 bg-gray-200 mb-1 flex items-center justify-center">
                                    <p className='text-gray-500 text-xs'>image</p>
                                </div>
                                <div className="h-1.5 bg-gray-50 w-3/4"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        case 'type5':
            return (
                <div className="w-full h-[120px] bg-white p-3 flex flex-col  gap-2">
                    <div className="h-2 bg-gray-200 w-1/2 "></div>
                    <div className="w-full grid grid-cols-2 h-full items-center gap-2">
                        <div className=" bg-gray-100 h-full w-full flex items-center justify-center">
                            <p className='text-gray-500 text-xs'>chart</p>
                        </div>
                        <div className="h-4 bg-gray-100 w-full"></div>
                    </div>
                </div>
            )
        case 'type6':
            return (
                <div className="w-full h-[120px] bg-white p-3 flex gap-2">
                    <div className="w-1/2 space-y-1.5">
                        <div className="h-3 bg-gray-200 w-3/4"></div>
                        <div className="h-2 bg-gray-100 w-full"></div>
                    </div>
                    <div className="w-1/2 space-y-1.5">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex gap-1.5 bg-gray-50 p-1.5">
                                <div className="w-4 h-4 bg-gray-200 rounded-full flex-shrink-0"></div>
                                <div className="flex-1">
                                    <div className="h-1.5 bg-gray-200 w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        case 'type7':
            return (
                <div className="w-full h-[120px] bg-white p-3 flex flex-col gap-2">
                    <div className="h-3 bg-gray-200 w-1/2 mx-auto"></div>
                    <div className="flex justify-between px-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="text-center bg-gray-100 h-full flex flex-col items-center justify-center">
                                <div className="w-4 h-4 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-1">
                                    <p className='text-gray-500 text-xs'>Icon</p>
                                </div>
                                <div className="h-1.5 bg-gray-200 w-12 mb-1"></div>
                                <div className="h-5 bg-gray-200 w-12"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        case 'type8':
            return (
                <div className="w-full h-[120px] bg-white p-3 flex gap-2">
                    <div className="w-1/2 space-y-1.5">
                        <div className="h-3 bg-gray-200 w-3/4"></div>
                        <div className="h-2 bg-gray-100 w-full"></div>
                    </div>
                    <div className="w-1/2 space-y-2">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex gap-1.5 bg-gray-50 p-1.5">
                                <div className="w-6 h-6 bg-gray-200 flex-shrink-0 flex items-center justify-center">
                                    <p className='text-gray-500 text-[10px]'>Icon</p>
                                </div>
                                <div className="flex-1">
                                    <div className="h-1.5 bg-gray-200 w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        case 'type9':
            return (
                <div className="w-full h-[120px] bg-white p-3 flex  gap-2">
                    <div className="w-1/2 space-y-1.5">
                        <div className="h-2 bg-gray-200 w-3/4"></div>
                        <div className="flex-1 bg-gray-100 h-full flex items-center justify-center">
                            <p className='text-gray-500 text-sm'>chart</p>
                        </div>
                    </div>
                    <div className="w-1/2 space-y-1.5">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-1.5 bg-gray-50 p-1.5">
                                <div className="w-4 h-4 bg-gray-200 rounded-full flex-shrink-0"></div>
                                <div className="flex-1">
                                    <div className="h-1.5 bg-gray-200 w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )

        default:
            return null
    }
}

const NewSlide = ({ onSelectLayout, setShowNewSlideSelection }: NewSlideProps) => {
    return (
        <div className='my-6 w-full bg-gray-50 p-8 max-w-[1280px]'>
            <div className='flex justify-between items-center  mb-8'>

                <h2 className="text-2xl font-semibold">Select a Slide Layout</h2>
                <Trash2 onClick={() => setShowNewSlideSelection(false)} className='text-gray-500 text-2xl cursor-pointer' />
            </div>
            <div className='grid grid-cols-4 gap-4'>
                {['type1', 'type2', 'type4', 'type5', 'type6', 'type7', 'type8', 'type9'].map((type) => (
                    <div
                        key={type}
                        className="transform hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => onSelectLayout(parseInt(type.replace('type', '')))}
                    >
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="p-2 border-b">
                                <h3 className="text-xs font-medium">Layout {type.replace('type', '')}</h3>
                            </div>
                            <div className="p-2">
                                <LayoutPreview type={type} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default NewSlide
