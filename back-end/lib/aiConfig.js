export const availableModels = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Powerful latest version of GPT-4',
    maxTokens: 4096,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Fast and economical version',
    maxTokens: 4096,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Optimal balance of price and quality',
    maxTokens: 4096,
  },
];

// Function to create a request configuration
export function createModelConfig(modelId, temperature, maxTokens, options = {}) {
  return {
    model: modelId || 'gpt-4o-mini', // Default model
    temperature: parseFloat(temperature || 0.7),
    max_tokens: parseInt(maxTokens || 1000),
    top_p: options.top_p || 1,
    frequency_penalty: options.frequency_penalty || 0,
    presence_penalty: options.presence_penalty || 0,
  };
}
