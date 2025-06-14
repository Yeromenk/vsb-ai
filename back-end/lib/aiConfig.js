export const availableModels = [
  // OpenAI Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Powerful latest version of GPT-4',
    maxTokens: 4096,
    provider: 'openai',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Fast and economical version',
    maxTokens: 4096,
    provider: 'openai',
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Optimal balance of price and quality',
    maxTokens: 4096,
    provider: 'openai',
  },
  // Google Gemini Models
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: "Google's powerful general-purpose model",
    maxTokens: 8192,
    provider: 'google',
  },
];

// Function to create a request configuration based on provider
export function createModelConfig(modelId, temperature, maxTokens, options = {}) {
  const model =
    availableModels.find(m => m.id === modelId) ||
    availableModels.find(m => m.id === 'gpt-4o-mini'); // Default fallback

  const provider = model.provider;
  const baseConfig = {
    temperature: parseFloat(temperature || 0.7),
    max_tokens: parseInt(maxTokens || 1000),
  };

  // Provider-specific configurations
  switch (provider) {
    case 'google':
      return {
        model: modelId,
        ...baseConfig,
        topK: options.topK || 40,
        topP: options.top_p || 0.95,
      };

    case 'openai':
    default:
      return {
        model: modelId || 'gpt-4o-mini',
        ...baseConfig,
        top_p: options.top_p || 1,
        frequency_penalty: options.frequency_penalty || 0,
        presence_penalty: options.presence_penalty || 0,
      };
  }
}

// Helper function to determine which client to use based on a model
export function getAIClient(modelId) {
  const model =
    availableModels.find(m => m.id === modelId) ||
    availableModels.find(m => m.id === 'gpt-4o-mini');

  return model.provider;
}
