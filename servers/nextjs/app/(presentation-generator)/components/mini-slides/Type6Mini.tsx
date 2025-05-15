import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import MiniTypeWriter from "./MiniTypeWriter";

interface Type6MiniProps {
    title: string;
    description: string;
    body: Array<{
        heading: string;
        description: string;
    }>;
}

const Type6Mini = ({ title, description, body }: Type6MiniProps) => {
    const { currentColors } = useSelector((state: RootState) => state.theme);
    return (
        <div className="slide-container w-full flex items-center aspect-video  bg-white p-2 rounded-lg text-[6px] border shadow-xl">
            <div className="grid grid-cols-2 gap-2 items-center h-full">
                <div className="space-y-1">
                    <div className="font-semibold text-[10px] slide-title">
                        <MiniTypeWriter text={title} />
                    </div>
                    <div className="text-gray-600 text-[8px] line-clamp-3 slide-description">
                        <MiniTypeWriter text={description} />
                    </div>
                </div>
                <div className="space-y-[3px]">
                    {body.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-sm p-[2px] slide-box">
                            <div
                                style={{
                                    color: currentColors.iconBg
                                }}
                                className=" text-[5px] font-semibold">0{index + 1}</div>
                            <div className="truncate font-medium slide-heading">
                                <MiniTypeWriter text={item.heading} />
                            </div>
                            <div className="text-gray-600 text-[4px] slide-description">
                                <MiniTypeWriter text={item.description} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Type6Mini; 