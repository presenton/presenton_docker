import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import MiniTypeWriter from "./MiniTypeWriter";
import { getStaticFileUrl } from "../../utils/others";

interface Type8MiniProps {
  title: string;
  description: string;
  body: Array<{
    heading: string;
    description: string;
  }>;
  icons: string[];
}

const Type8Mini = ({ title, description, body, icons }: Type8MiniProps) => {
  const { currentColors } = useSelector((state: RootState) => state.theme);
  const updatedIcons = icons.map((icon) => {
    return getStaticFileUrl(icon);
  });

  return (
    <div className="slide-container w-full aspect-video bg-white p-2 flex flex-col justify-center items-center rounded-lg text-[6px] border shadow-xl">
      <div className="grid grid-cols-2 gap-2 items-center h-full">
        <div className="space-y-1">
          <div className="font-semibold text-[10px] slide-title">
            <MiniTypeWriter text={title} />
          </div>
          <div className="text-gray-600 text-[8px] line-clamp-3 slide-description">
            <MiniTypeWriter text={description} />
          </div>
        </div>
        <div className="space-y-1">
          {body.map((item, index) => (
            <div
              key={index}
              className="flex gap-1 bg-gray-50 rounded-sm p-1 slide-box"
            >
              <div
                className="w-2 h-2 rounded-sm flex items-center justify-center"
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
              <div>
                <div className="truncate font-medium slide-heading">
                  <MiniTypeWriter text={item.heading} />
                </div>
                <div className="text-gray-600 text-[4px] slide-description">
                  <MiniTypeWriter text={item.description} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Type8Mini;
