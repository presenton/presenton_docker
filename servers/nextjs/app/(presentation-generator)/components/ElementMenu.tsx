import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import React from "react";

interface ElementMenuProps {
  index: number;
  handleDeleteItem: (index: number) => void;
}

const ElementMenu = ({ index, handleDeleteItem }: ElementMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="absolute hidden md:block top-0 left-1/2 -translate-x-1/2 p-1 rounded-md bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 z-50"
          data-index={index}
        >
          <MoreHorizontal className="w-4 h-4 text-black" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[180px] p-2">
        <DropdownMenuItem
          onClick={() => handleDeleteItem(index)}
          className="px-3 py-2 cursor-pointer"
        >
          Delete Item {index + 1}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Prevent unnecessary re-renders
export default React.memo(ElementMenu, (prevProps, nextProps) => {
  return (
    prevProps.index === nextProps.index && prevProps.index === nextProps.index
  );
});
