import { useTypewriter } from "@/hooks/useTypeWriter";

const Typewriter = ({ text, speed }: { text: string; speed: number }) => {
  const { displayText, isCursorVisible } = useTypewriter(text, speed, true);

  return (
    <p>
      {displayText}
      {isCursorVisible && <span className="slide-title">|</span>}
    </p>
  );
};

export default Typewriter;
