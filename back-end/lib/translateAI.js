import { getUserModelConfig } from './modelConfig.js';
import { createResponseWithMetadata } from './metadataHelper.js';
import { getAIClient } from './aiConfig.js';
import { handleAIRequest, formatProviderMessages } from './aiProviderHandler.js';

export async function getTranslation(message, sourceLanguage, targetLanguage, userId = null) {
  try {
    const config = await getUserModelConfig(userId, 1000);
    const provider = getAIClient(config.model);

    const prompt = `Please translate the following text from ${sourceLanguage} to ${targetLanguage}:\n\n"${message}". Write only the translation, without the quotation marks`;

    // Format messages for the specific provider
    const messages = formatProviderMessages(provider, prompt);

    // Make the request using the centralized handler
    const { content, tokensUsed } = await handleAIRequest(config, provider, messages);

    console.log(`Translation generated using model: ${config.model}`);
    return createResponseWithMetadata(content, config.model, tokensUsed);
  } catch (error) {
    console.error('error fetching completion(translate):', error);
    throw error;
  }
}
