import { setLLMConfig } from "@/store/slices/userConfig";
import { store } from "@/store/store";

export const handleSaveLLMConfig = async (llmConfig: LLMConfig) => {
  if (!hasValidLLMConfig(llmConfig)) {
    throw new Error('API key cannot be empty');
  }

  await fetch('/api/user-config', {
    method: 'POST',
    body: JSON.stringify(llmConfig)
  });

  store.dispatch(setLLMConfig(llmConfig));
}

export const hasValidLLMConfig = (llmConfig: LLMConfig) => {
  if (!llmConfig.LLM) return false;
  const OPENAI_API_KEY = llmConfig.OPENAI_API_KEY;
  const GOOGLE_API_KEY = llmConfig.GOOGLE_API_KEY;
  const OLLAMA_MODEL = llmConfig.OLLAMA_MODEL;
  const PEXELS_API_KEY = llmConfig.PEXELS_API_KEY;
  return llmConfig.LLM === 'openai' ?
    OPENAI_API_KEY !== '' && OPENAI_API_KEY !== null && OPENAI_API_KEY !== undefined :
    llmConfig.LLM === 'google' ?
      GOOGLE_API_KEY !== '' && GOOGLE_API_KEY !== null && GOOGLE_API_KEY !== undefined :
      llmConfig.LLM === 'ollama' ?
        PEXELS_API_KEY !== '' && PEXELS_API_KEY !== null && PEXELS_API_KEY !== undefined && OLLAMA_MODEL !== '' && OLLAMA_MODEL !== null && OLLAMA_MODEL !== undefined :
        false;
}