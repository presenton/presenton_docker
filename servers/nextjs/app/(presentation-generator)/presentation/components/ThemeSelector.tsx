import React from "react";

const ThemeSelector = ({
  onSelect,
  selectedTheme,
}: {
  onSelect: (theme: string) => void;
  selectedTheme: string;
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 p-3">
      <button
        onClick={() => onSelect("light")}
        className="group focus:outline-none"
      >
        <ThemePreview
          theme="Light"
          color="#F5F5F5"
          isSelected={selectedTheme === "light"}
        />
      </button>
      <button
        onClick={() => onSelect("dark")}
        className="group focus:outline-none"
      >
        <ThemePreview
          theme="Dark"
          color="#1E1E1E"
          isSelected={selectedTheme === "dark"}
        />
      </button>
      <button
        onClick={() => onSelect("cream")}
        className="group focus:outline-none"
      >
        <ThemePreview
          theme="Cream"
          color="#F9F6F0"
          isSelected={selectedTheme === "cream"}
        />
      </button>
      <button
        onClick={() => onSelect("royal_blue")}
        className="group focus:outline-none"
      >
        <ThemePreview
          theme="Royal Blue"
          color="#091433"
          isSelected={selectedTheme === "royal_blue"}
        />
      </button>
      <button
        onClick={() => onSelect("faint_yellow")}
        className="group focus:outline-none"
      >
        <ThemePreview
          theme="Faint Yellow"
          color="#F8F4E8"
          isSelected={selectedTheme === "faint_yellow"}
        />
      </button>
      <button
        onClick={() => onSelect("light_red")}
        className="group focus:outline-none"
      >
        <ThemePreview
          theme="Light Red"
          color="#FFFAFA"
          isSelected={selectedTheme === "light_red"}
        />
      </button>
      <button
        onClick={() => onSelect("dark_pink")}
        className="group focus:outline-none"
      >
        <ThemePreview
          theme="Dark Pink"
          color="#F9E8FF"
          isSelected={selectedTheme === "dark_pink"}
        />
      </button>

      <button
        onClick={() => onSelect("custom")}
        className="group focus:outline-none"
      >
        <div className="flex flex-col items-center gap-1 w-full">
          <div
            className={`w-full h-16 rounded-lg shadow-sm transition-all p-2 flex flex-col justify-between
                    bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500
                    ${
                      selectedTheme === "custom"
                        ? "ring-2 ring-[#5146E5] scale-95"
                        : "hover:scale-105"
                    }`}
          >
            <div className="w-12 h-1.5 rounded bg-white/20"></div>
            <div className="space-y-1">
              <div className="w-16 h-1.5 rounded bg-white/30"></div>
              <div className="w-12 h-1.5 rounded bg-white/20"></div>
            </div>
          </div>
          <span
            className={`text-xs font-medium ${
              selectedTheme === "custom" ? "text-[#5146E5]" : "text-gray-600"
            }`}
          >
            Custom
          </span>
        </div>
      </button>
    </div>
  );
};

export default ThemeSelector;

const ThemePreview = ({
  theme,
  color,
  isSelected,
}: {
  theme: string;
  color: string;
  isSelected: boolean;
}) => (
  <div
    className={`flex flex-col items-center gap-1  w-full ${
      isSelected ? "scale-95" : ""
    }`}
  >
    <div
      className={`w-full h-16 rounded-t-lg rounded-r-lg border shadow-sm transition-all p-2 flex flex-col justify-between
                ${
                  isSelected
                    ? "ring-2 ring-[#5146E5] scale-95"
                    : "hover:scale-105"
                }`}
      style={{ backgroundColor: color }}
    >
      <div className="w-12 h-1.5 rounded bg-white/20"></div>
      <div className="space-y-1">
        <div className="w-16 h-1.5 rounded bg-white/30"></div>
        <div className="w-12 h-1.5 rounded bg-white/20"></div>
      </div>
    </div>
    <span
      className={`text-xs font-medium ${
        isSelected ? "text-[#5146E5]" : "text-gray-600"
      }`}
    >
      {theme}
    </span>
  </div>
);
