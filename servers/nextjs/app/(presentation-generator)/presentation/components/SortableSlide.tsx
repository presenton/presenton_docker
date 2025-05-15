import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { renderMiniSlideContent } from '../../components/slide_config';
import { Slide } from '../../types/slide';
import { useState } from 'react';

interface SortableSlideProps {
    slide: Slide;
    index: number;
    selectedSlide: number;
    onSlideClick: (index: number) => void;
}

export function SortableSlide({ slide, index, selectedSlide, onSlideClick }: SortableSlideProps) {
    const [mouseDownTime, setMouseDownTime] = useState(0);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: slide.id! });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    };

    const handleMouseDown = () => {
        setMouseDownTime(Date.now());
    };

    const handleMouseUp = () => {
        const mouseUpTime = Date.now();
        const timeDiff = mouseUpTime - mouseDownTime;

        // If the mouse was down for less than 200ms, consider it a click
        if (timeDiff < 200 && !isDragging) {
            onSlideClick(slide.index);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className={`flex justify-center items-center cursor-pointer ${selectedSlide === index
                ? 'ring-2 ring-[#5141e5]'
                : 'hover:ring-2 hover:ring-gray-200'
                } rounded-lg`}
        >
            {renderMiniSlideContent(slide)}
        </div>
    );
} 