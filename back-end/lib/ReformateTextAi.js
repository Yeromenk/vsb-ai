import { getUserModelConfig } from './modelConfig.js';
import { createResponseWithMetadata } from './metadataHelper.js';
import { getAIClient } from './aiConfig.js';
import { handleAIRequest, formatProviderMessages } from './aiProviderHandler.js';

export async function ReformateText(message, style, tone, userId = null) {
  try {
    const config = await getUserModelConfig(userId, 1000);
    const provider = getAIClient(config.model);

    const prompt = `Please rewrite the following text in a ${style} style and a ${tone} tone:\n\n"${message}"`;

    // Format messages for the specific provider
    const messages = formatProviderMessages(provider, prompt);

    // Make the request using the centralized handler
    const { content, tokensUsed } = await handleAIRequest(config, provider, messages);

    console.log(`Text reformatted using model: ${config.model}`);
    return createResponseWithMetadata(content, config.model, tokensUsed);
  } catch (error) {
    console.error('error fetching completion(formating):', error);
    throw error;
  }
}
