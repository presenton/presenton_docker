import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import MiniTypeWriter from "./MiniTypeWriter";

interface Type2MiniProps {
    title: string;
    body: Array<{
        heading: string;
        description: string;
    }>;
    design_index: number;
}

const Type2Mini = ({ title, body, design_index }: Type2MiniProps) => {
    const isGridLayout = body.length === 4;
    const { currentColors } = useSelector((state: RootState) => state.theme);
    const getGridCols = (length: number) => {
        switch (length) {
            case 1: return 'grid-cols-1';
            case 2: return 'grid-cols-2';
            case 3: return 'grid-cols-3';
            case 4: return 'grid-cols-4';
            // Add more cases as needed
            default: return 'grid-cols-1';
        }
    }
    return (
        <div className="slide-container w-full aspect-video flex flex-col justify-center items-center bg-white p-2 rounded-lg text-[6px] border shadow-xl">
            <div className="text-center mb-2">
                <div className="font-semibold text-[10px] line-clamp-2 slide-title">
                    <MiniTypeWriter text={title} />
                </div>
            </div>

            {design_index === 3 ? (
                <div className="flex flex-col mt-2 ">
                    <div className="flex justify-between w-[85%] mx-auto items-center mb-1">
                        <div className="absolute w-[70%] h-[1px] "
                            style={{
                                backgroundColor: currentColors.iconBg
                            }}
                        />
                        {body.map((_, index) => (
                            <div
                                style={{
                                    backgroundColor: currentColors.iconBg
                                }}
                                key={index} className="w-2 h-2 rounded-full  text-white flex items-center justify-center text-[4px] z-10">
                                {index + 1}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between gap-1">
                        {body.map((item, index) => (
                            <div key={index} className="flex-1 text-center">
                                <div className="truncate font-medium slide-heading">
                                    <MiniTypeWriter text={item.heading} />
                                </div>
                                <div className="text-gray-600 line-clamp-2 text-[4px] slide-description">
                                    <MiniTypeWriter text={item.description} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className={isGridLayout ? 'grid grid-cols-2 gap-1 ' : `grid ${getGridCols(body.length)} gap-1  `}>
                    {body.map((item, index) => (
                        <div
                            key={index}
                            className={`w-full ${design_index === 2 ? 'bg-gray-50 rounded-sm p-1 slide-box' : ''} `}
                        >
                            {design_index === 2 && (
                                <div
                                    style={{
                                        color: currentColors.iconBg
                                    }}
                                    className=" text-[5px] font-semibold">0{index + 1}</div>
                            )}
                            <div className="truncate font-medium slide-heading">
                                <MiniTypeWriter text={item.heading} />
                            </div>
                            <div className="text-gray-600 line-clamp-2 text-[4px] slide-description">
                                <MiniTypeWriter text={item.description} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Type2Mini; 