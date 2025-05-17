import { useSelector } from "react-redux";
import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import { RootState } from "@/store/store";
import MiniTypeWriter from "./MiniTypeWriter";
import { getStaticFileUrl } from "../../utils/others";

interface Type7MiniProps {
  title: string;
  body: Array<{
    heading: string;
    description: string;
  }>;
  icons: string[];
}

const Type7Mini = ({ title, body, icons }: Type7MiniProps) => {
  const { currentColors } = useSelector((state: RootState) => state.theme);
  const isGridLayout = body.length === 4;
  const updatedIcons = icons.map((icon) => {

    return getStaticFileUrl(icon);
  });

  return (
    <div className="slide-container w-full aspect-video bg-white p-2 flex flex-col justify-center items-center rounded-lg text-[6px] border shadow-xl">
      <div className="text-center mb-1">
        <div className="font-semibold text-[10px] slide-title truncate">
          <MiniTypeWriter text={title} />
        </div>
      </div>
      <div className={isGridLayout ? "grid grid-cols-2 gap-1" : "flex gap-1"}>
        {body.map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-sm p-1 slide-box">
            <div
              className="w-2 h-2 mb-1 rounded-sm flex items-center justify-center"
              style={{ backgroundColor: currentColors.iconBg }}
            >
              {updatedIcons && updatedIcons[index] && (
                <img
                  src={updatedIcons[index]}
                  alt={item.heading}
                  className="w-1 h-1 object-contain"
                />
              )}
            </div>
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
  );
};

export default Type7Mini;
