import { useSelector } from "react-redux";
import MiniCharts from "./MiniCharts";
import { RootState } from "@/store/store";
import MiniTypeWriter from "./MiniTypeWriter";

interface Type9MiniProps {
    title: string;
    body: Array<{
        heading: string;
        description: string;
    }>;
    chartData: any;
    slideIndex: number;
}

const Type9Mini = ({ title, body, chartData, slideIndex }: Type9MiniProps) => {
    const { currentColors } = useSelector((state: RootState) => state.theme);
    return (
        <div className="slide-container w-full aspect-video bg-white p-2 overflow-hidden flex flex-col justify-center items-center rounded-lg text-[6px] border shadow-xl">
            <div className="grid grid-cols-2 gap-2 h-full items-center">
                <div className="space-y-1">
                    <div className="font-semibold text-[10px] slide-title">
                        <MiniTypeWriter text={title} />
                    </div>
                    <MiniCharts chartData={chartData} />
                </div>
                <div className="space-y-1">
                    {body && body.length > 0 && body.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-sm p-1 slide-box">
                            <div
                                style={{
                                    color: currentColors.iconBg
                                }}
                                className=" text-[5px] font-semibold">0{index + 1}</div>
                            <div className="truncate font-medium slide-heading">
                                <MiniTypeWriter text={item.heading} />
                            </div>
                            <div className="text-gray-600 line-clamp-1 text-[4px] slide-description">
                                <MiniTypeWriter text={item.description} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Type9Mini; 