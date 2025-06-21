'use client';
import React, { useState, useEffect } from "react";
import Header from "../dashboard/components/Header";
import Wrapper from "@/components/Wrapper";
import { Settings, Key, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { handleSaveLLMConfig } from "@/utils/storeHelpers";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
    openai: {
        title: "OpenAI API Key",
        description: "Required for using OpenAI services",
        placeholder: "Enter your OpenAI API key",
    },
    google: {
        title: "Google API Key",
        description: "Required for using Google services",
        placeholder: "Enter your Google API key",
    },
    ollama: {
        title: "Ollama API Key",
        description: "Required for using Ollama services",
        placeholder: "Choose a model",
    }
};

interface ProviderConfig {
    title: string;
    description: string;
    placeholder: string;
}

const SettingsPage = () => {
    const router = useRouter();

    const userConfigState = useSelector((state: RootState) => state.userConfig);
    const [llmConfig, setLlmConfig] = useState(userConfigState.llm_config);
    const canChangeKeys = userConfigState.can_change_keys;
    const [ollamaModels, setOllamaModels] = useState<{
        label: string;
        value: string;
        description: string;
        size: string;
    }[]>([]);
    const [downloadingModel, setDownloadingModel] = useState({
        name: '',
        size: null,
        downloaded: null,
        status: '',
        done: false,
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const api_key_changed = (apiKey: string) => {
        if (llmConfig.LLM === 'openai') {
            setLlmConfig({ ...llmConfig, OPENAI_API_KEY: apiKey });
        } else if (llmConfig.LLM === 'google') {
            setLlmConfig({ ...llmConfig, GOOGLE_API_KEY: apiKey });
        } else if (llmConfig.LLM === 'ollama') {
            setLlmConfig({ ...llmConfig, PEXELS_API_KEY: apiKey });
        }
    }

    const handleSaveConfig = async () => {
        if (llmConfig.LLM === 'ollama') {
            try {
                setIsLoading(true);
                await pullOllamaModels();
                toast({
                    title: 'Success',
                    description: 'Model downloaded successfully',
                });
            } catch (error) {
                console.error('Error pulling model:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to download model. Please try again.',
                    variant: 'destructive',
                });
                setIsLoading(false);
                return;
            }
        }
        try {
            await handleSaveLLMConfig(llmConfig);
            toast({
                title: 'Success',
                description: 'Configuration saved successfully',
            });
            setIsLoading(false);
            router.back();
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: 'Error',
                description: 'Failed to save configuration',
                variant: 'destructive',
            });
            setIsLoading(false);
        }
    };

    const changeProvider = (provider: string) => {
        setLlmConfig({ ...llmConfig, LLM: provider });
        if (provider === 'ollama') {
            fetchOllamaModels();
        }
    }

    const pullOllamaModels = async (): Promise<void> => {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const response = await fetch(`/api/v1/ppt/ollama/pull-model?name=${llmConfig.OLLAMA_MODEL}`);
                    if (response.status === 200) {

                        const data = await response.json();

                        if (data.done) {
                            clearInterval(interval);
                            setDownloadingModel(data);
                            resolve();
                        } else {
                            setDownloadingModel(data);
                        }
                    } else {
                        clearInterval(interval);
                        reject(new Error('Model pulling failed'));
                    }
                } catch (error) {

                    console.log('Error fetching ollama models:', error);
                    clearInterval(interval);
                    reject(error);
                }
            }, 1000);

        });
    }

    const fetchOllamaModels = async () => {
        try {
            const response = await fetch('/api/v1/ppt/ollama/list-supported-models');
            const data = await response.json();
            setOllamaModels(data.models);
        } catch (error) {
            console.error('Error fetching ollama models:', error);
        }
    }

    useEffect(() => {

        if (!canChangeKeys) {
            router.push("/dashboard");
        }
        if (userConfigState.llm_config.LLM === 'ollama') {
            fetchOllamaModels();
        }
    }, [userConfigState.llm_config.LLM]);

    if (!canChangeKeys) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#E9E8F8] font-instrument_sans">
            <Header />
            <Wrapper className="lg:w-[80%]">
                <div className="py-8 space-y-6">
                    {/* Settings Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <Settings className="w-8 h-8 text-blue-600" />
                        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
                    </div>

                    {/* API Configuration Section */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Key className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-medium text-gray-900">API Configuration</h2>
                        </div>

                        {/* Provider Selection */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Select AI Provider
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.keys(PROVIDER_CONFIGS).map((provider) => (
                                    <button
                                        key={provider}
                                        onClick={() => changeProvider(provider)}
                                        className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${llmConfig.LLM === provider
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-3">
                                            <span
                                                className={`font-medium text-center ${llmConfig.LLM === provider
                                                    ? "text-blue-700"
                                                    : "text-gray-700"
                                                    }`}
                                            >
                                                {provider.charAt(0).toUpperCase() + provider.slice(1)}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* API Key Input */}
                        {llmConfig.LLM !== 'ollama' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {PROVIDER_CONFIGS[llmConfig.LLM!].title}
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={llmConfig.LLM === 'openai' ? llmConfig.OPENAI_API_KEY || '' : llmConfig.GOOGLE_API_KEY || ''}
                                            onChange={(e) => api_key_changed(e.target.value)}
                                            className="flex-1 px-4 py-2.5 border border-gray-300 outline-none rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                            placeholder={PROVIDER_CONFIGS[llmConfig.LLM!].placeholder}
                                        />
                                        <button
                                            onClick={handleSaveConfig}
                                            disabled={isLoading}
                                            className={`px-4 py-2 rounded-lg transition-colors ${isLoading
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                                } text-white`}
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Saving...
                                                </div>
                                            ) : (
                                                'Save'
                                            )}
                                        </button>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">{PROVIDER_CONFIGS[llmConfig.LLM!].description}</p>
                                </div>
                            </div>
                        )}

                        {/* Ollama Configuration */}
                        {llmConfig.LLM === 'ollama' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Choose a supported model
                                    </label>
                                    <div className="w-full">
                                        {ollamaModels.length > 0 ? (
                                            <Select value={llmConfig.OLLAMA_MODEL} onValueChange={(value) => setLlmConfig({ ...llmConfig, OLLAMA_MODEL: value })}>
                                                <SelectTrigger className="w-full px-4 py-6 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors">
                                                    {llmConfig.OLLAMA_MODEL || 'Select a model'}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ollamaModels.map((model, index) => (
                                                        <SelectItem key={index} value={model.value} className="capitalize mt-1">
                                                            <span className="text-base font-medium">{model.label}  ({model.size})</span>
                                                            <span className="text-sm text-gray-500 block mt-1">{model.description}</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div className="w-full h-10 bg-gray-200 rounded-lg"></div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pexels API Key (required for images)
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter your Pexels API key"
                                            className="flex-1 px-4 py-2.5 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                            value={llmConfig.PEXELS_API_KEY || ''}
                                            onChange={(e) => api_key_changed(e.target.value)}
                                        />
                                        <button
                                            onClick={handleSaveConfig}
                                            disabled={isLoading || !llmConfig.OLLAMA_MODEL}
                                            className={`px-4 py-2 rounded-lg transition-colors ${isLoading || !llmConfig.OLLAMA_MODEL
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                                } text-white`}
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    {downloadingModel.downloaded || 0 > 0
                                                        ? `Downloading (${(((downloadingModel.downloaded || 0) / (downloadingModel.size || 1)) * 100).toFixed(0)}%)`
                                                        : 'Saving...'
                                                    }
                                                </div>
                                            ) : (
                                                !llmConfig.OLLAMA_MODEL ? 'Select Model' : 'Save'
                                            )}
                                        </button>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">Required for using Ollama services with image generation</p>
                                </div>
                                {downloadingModel.status && downloadingModel.status !== 'pulled' && (
                                    <div className="text-sm text-center text-gray-600">
                                        {downloadingModel.status}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Wrapper>
        </div>
    );
};

export default SettingsPage;
