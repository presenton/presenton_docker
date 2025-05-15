import MiniCharts from "./MiniCharts";
import MiniTypeWriter from "./MiniTypeWriter";

interface Type5MiniProps {
    title: string;
    description: string;
    chartData: any;
    slideIndex: number;
    isFullSizeGraph: boolean;
}

const Type5Mini = ({ title, description, chartData, slideIndex, isFullSizeGraph }: Type5MiniProps) => {
    return (
        <div className="slide-container w-full aspect-video bg-white p-2 flex flex-col  justify-center rounded-lg text-[6px] border shadow-xl">
            <div className="text-center mb-2">
                <div className="font-semibold text-[10px] text-start slide-title truncate">
                    <MiniTypeWriter text={title} />
                </div>
            </div>
            <div className={`flex  gap-2  w-full items-center  ${isFullSizeGraph ? ' flex-col ' : ''} `}>
                <div className={` w-[80%]`}>

                    <MiniCharts chartData={chartData} />
                </div>
                {/* <div className="w-full h-full">

                </div> */}
                <div className="w-full text-gray-600 text-[8px] line-clamp-6 slide-description">
                    <MiniTypeWriter text={description} />
                </div>
            </div>
            {/* <div className="grid grid-cols-2 gap-2">
             
                

                <div className="text-gray-600 text-[8px] line-clamp-6 slide-description">{description}</div>
            </div> */}
        </div>
    );
};

export default Type5Mini; 