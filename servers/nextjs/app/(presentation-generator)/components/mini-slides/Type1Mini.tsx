import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import MiniTypeWriter from "./MiniTypeWriter";

interface Type1MiniProps {
  title: string;
  description: string;
  image: string;
}

const Type1Mini = ({ title, description, image }: Type1MiniProps) => {
  const updatedImage = image.startsWith("user") ? `file://${image}` : `file://${image}`;
  return (
    <div className="slide-container w-full aspect-video bg-white p-2 flex items-center justify-center rounded-lg text-[6px] border shadow-xl">
      <div className="grid grid-cols-2 gap-2 h-full">
        <div className="flex flex-col justify-center space-y-1">
          <div className="font-semibold text-[10px] line-clamp-2 slide-title ">
            <MiniTypeWriter text={title} />
          </div>
          <div className="text-gray-600 text-[8px] line-clamp-3 slide-description">
            <MiniTypeWriter text={description} />
          </div>
        </div>
        <div className="bg-gray-100 rounded-sm overflow-hidden">
          {image && (
            <img
              src={updatedImage}
              alt={title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Type1Mini;
