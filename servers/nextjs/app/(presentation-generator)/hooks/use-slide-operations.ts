import { useDispatch } from "react-redux";

import {
  addSlideBodyItem,
  deleteSlideBodyItem,
  updateSlideVariant,
  updateSlideImage,
  deleteSlideImage,

  // Import other slide operation actions as needed
} from "@/store/slices/presentationGeneration";

export const useSlideOperations = (slideIndex: number) => {
  const dispatch = useDispatch();

  const handleAddItem = ({ item }: { item: any }) => {
    dispatch(addSlideBodyItem({ index: slideIndex, item }));
  };

  const handleDeleteItem = ({ itemIndex }: { itemIndex: number }) => {
    dispatch(deleteSlideBodyItem({ index: slideIndex, itemIdx: itemIndex }));
  };

  const handleVariantChange = ({ variant }: { variant: number }) => {
    dispatch(updateSlideVariant({ index: slideIndex, variant }));
  };

  const handleImageChange = ({
    imageUrl,
    imageIndex,
  }: {
    imageUrl: string;
    imageIndex: number;
  }) => {
    dispatch(
      updateSlideImage({
        index: slideIndex,
        imageIdx: imageIndex,
        image: imageUrl,
      })
    );
  };
  const handleDeleteImage = ({ imageIndex }: { imageIndex: number }) => {
    dispatch(deleteSlideImage({ index: slideIndex, imageIdx: imageIndex }));
  };

  // Add other common slide operations here

  return {
    handleAddItem,
    handleDeleteItem,
    handleVariantChange,
    handleImageChange,
    handleDeleteImage,
  };
};
