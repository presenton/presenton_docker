import { getStaticFileUrl } from "../../utils/others";
import MiniTypeWriter from "./MiniTypeWriter";

interface Type4MiniProps {
  title: string;
  body: Array<{
    heading: string;
    description: string;
  }>;
  images: string[];
}

const Type4Mini = ({ title, body, images }: Type4MiniProps) => {
  const updatedImages = images.map((image) => {
    if (image.startsWith("user")) {
      return getStaticFileUrl(image);
    }
    return getStaticFileUrl(image);
  });
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
    <div className="slide-container w-full aspect-video bg-white p-2 flex flex-col items-center justify-center rounded-lg text-[6px] border shadow-xl">
      <div className="text-center mb-1">
        <div className="font-semibold text-[10px] slide-title truncate">
          <MiniTypeWriter text={title} />
        </div>
      </div>
      <div className={`grid ${getGridCols(body.length)} gap-1`}>
        {body.map((item, index) => (
          <div
            key={index}
            className="bg-gray-50 shadow-md p-1 rounded-sm overflow-hidden slide-box"
          >
            <div className="h-12 w-full">
              {updatedImages && updatedImages[index] && (
                <img
                  src={updatedImages[index]}
                  alt={item.heading}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-[2px]">
              <div className=" text-[8px] font-medium line-clamp-2 leading-3 pb-1 slide-heading">
                <MiniTypeWriter text={item.heading} />
              </div>
              <div className="text-gray-600 text-[5px] slide-description">
                <MiniTypeWriter text={item.description} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Type4Mini;
