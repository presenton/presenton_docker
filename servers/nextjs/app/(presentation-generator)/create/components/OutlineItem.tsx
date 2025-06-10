import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Trash2 } from "lucide-react"
import { RootState } from "@/store/store"
import { useDispatch, useSelector } from "react-redux"
import { deleteSlideOutline, setOutlines, SlideOutline } from "@/store/slices/presentationGeneration"
import ToolTip from "@/components/ToolTip"
import MarkdownEditor from "../../components/MarkdownEditor"


interface OutlineItemProps {
    slideOutline: SlideOutline,
    index: number
}

export function OutlineItem({
    index,
    slideOutline,
}: OutlineItemProps) {
    const {
        presentation_id,
        outlines,
    } = useSelector((state: RootState) => state.presentationGeneration);
    const dispatch = useDispatch()

    const handleSlideChange = (newOutline: SlideOutline) => {

        const newData = outlines?.map((each, idx) => {
            if (idx === index - 1) {
                return newOutline
            }
            return each;
        });

        if (!newData) return;
        dispatch(setOutlines(newData));
    }


    // DnD sortable configuration
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: slideOutline.title })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }


    const handleSlideDelete = () => {
        dispatch(deleteSlideOutline({ index: index - 1 }))

    }

    return (
        <div className="mb-2 bg-[#F9F9F9]">
            {/* Main Title Row */}
            <div
                ref={setNodeRef}
                style={style}
                className={`flex items-start gap-2 md:gap-4 p-2 sm:pr-4 bg-[#F9F9F9] rounded-[8px] ${isDragging ? "opacity-50" : ""}`}
            >
                {/* Drag Handle with Number - Make it smaller on mobile */}
                <div
                    {...attributes}
                    {...listeners}
                    className="min-w-8 sm:min-w-10 w-10 sm:w-14 h-10 sm:h-14 bg-[#E9E8F8] rounded-[8px] flex items-center justify-center relative cursor-grab"
                >
                    <div className="grid grid-cols-2 gap-[2px]">
                        <div className="w-[3px] h-[3px] bg-[#5146E5] rounded-full" />
                        <div className="w-[3px] h-[3px] bg-[#5146E5] rounded-full" />
                        <div className="w-[3px] h-[3px] bg-[#5146E5] rounded-full" />
                        <div className="w-[3px] h-[3px] bg-[#5146E5] rounded-full" />
                    </div>
                    <span className="text-[#5146E5] text-sm sm:text-base font-medium ml-1">{index}</span>
                </div>

                {/* Main Title Input - Add onFocus handler */}
                <div className="flex flex-col basis-full gap-2">

                    <input
                        type="text"
                        value={slideOutline.title}
                        onChange={(e) => handleSlideChange({ ...slideOutline, title: e.target.value })}

                        className="text-md sm:text-lg flex-1 font-semibold bg-transparent outline-none"
                        placeholder="Title goes here"
                    />

                    {/* Editable Markdown Content */}
                    <MarkdownEditor
                        content={slideOutline.body}
                        onChange={(content) => handleSlideChange({ ...slideOutline, body: content })}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1 sm:gap-2 items-center">

                    <ToolTip content="Delete Slide">
                        <button
                            onClick={handleSlideDelete}
                            className="p-1.5 sm:p-2 bg-[#EDEDED] hover:bg-[#E9E8F8] rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                        </button>
                    </ToolTip>
                </div>
            </div>



        </div>
    )
}

