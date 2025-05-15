'use client';
import React, { useState, useEffect } from "react";
import Header from "../dashboard/components/Header";
import Wrapper from "@/components/Wrapper";
import { Settings, Key } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserConfig {
    LLM?: string;
    OPENAI_API_KEY?: string;
    GOOGLE_API_KEY?: string;
}

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
};

interface ProviderConfig {
    title: string;
    description: string;
    placeholder: string;
}

const SettingsPage = () => {
    const [config, setConfig] = useState<UserConfig>({});
    const [selectedProvider, setSelectedProvider] = useState<string>("openai");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                // @ts-ignore
                const config = await window.electron.getUserConfig();
                setConfig(config);
                if (config.LLM) {
                    setSelectedProvider(config.LLM);
                }
            } catch (error) {
                console.error("Error loading config:", error);
                toast({
                    title: 'Error',
                    description: 'Failed to load configuration',
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadConfig();
    }, []);

    const handleSaveConfig = async (provider: string, apiKey: string) => {
        if (apiKey === '') {
            toast({
                title: 'Error',
                description: 'API key cannot be empty',
            });
            return;
        }

        try {
            const newConfig = {
                LLM: provider,
                OPENAI_API_KEY: provider === 'openai' ? apiKey : config.OPENAI_API_KEY,
                GOOGLE_API_KEY: provider === 'google' ? apiKey : config.GOOGLE_API_KEY
            };

            // @ts-ignore
            await window.electron.setUserConfig(newConfig);
            setConfig(newConfig);

            toast({
                title: 'Success',
                description: 'Configuration saved successfully',
            });
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: 'Error',
                description: 'Failed to save configuration',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#E9E8F8]">
                <Header />
                <Wrapper className="lg:w-[60%]">
                    <div className="py-8">
                        <div className="text-center">Loading configuration...</div>
                    </div>
                </Wrapper>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#E9E8F8] font-instrument_sans">
            <Header />
            <Wrapper className="lg:w-[60%]">
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
                                        onClick={() => setSelectedProvider(provider)}
                                        className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${selectedProvider === provider
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-3">
                                            <span
                                                className={`font-medium text-center ${selectedProvider === provider
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
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {PROVIDER_CONFIGS[selectedProvider].title}
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={selectedProvider === 'openai' ? config.OPENAI_API_KEY || '' : config.GOOGLE_API_KEY || ''}
                                        onChange={(e) => setConfig(prev => ({
                                            ...prev,
                                            [selectedProvider === 'openai' ? 'OPENAI_API_KEY' : 'GOOGLE_API_KEY']: e.target.value
                                        }))}
                                        className="flex-1 px-4 py-2.5 border border-gray-300 outline-none rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                        placeholder={PROVIDER_CONFIGS[selectedProvider].placeholder}
                                    />
                                    <button
                                        onClick={() => handleSaveConfig(
                                            selectedProvider,
                                            selectedProvider === 'openai' ? config.OPENAI_API_KEY || '' : config.GOOGLE_API_KEY || ''
                                        )}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Save
                                    </button>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">{PROVIDER_CONFIGS[selectedProvider].description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Wrapper>
        </div>
    );
};

export default SettingsPage;
