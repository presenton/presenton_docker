import { useTypewriter } from "@/hooks/useTypeWriter";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

const MiniTypeWriter = ({ text }: { text: string }) => {
  const { isStreaming } = useSelector(
    (state: RootState) => state.presentationGeneration
  );

  // Pass the isStreaming value directly to the hook as the enabled parameter
  const { displayText } = useTypewriter(text, 20, isStreaming || false);

  // Since the hook now handles both states, we can simply return displayText
  return <span>{displayText}</span>;
};

export default MiniTypeWriter;
