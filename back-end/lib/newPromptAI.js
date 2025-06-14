import { getUserModelConfig } from './modelConfig.js';
import { createResponseWithMetadata } from './metadataHelper.js';
import { getAIClient } from './aiConfig.js';
import { handleAIRequest, formatProviderMessages } from './aiProviderHandler.js';

export async function getNewPrompt(instructions, message, userId = null) {
  try {
    const config = await getUserModelConfig(userId, 1000);
    const provider = getAIClient(config.model);

    const systemPrompt = `${instructions || 'You are a helpful assistant.'}

    Format your responses using proper markdown:
    - Use headings (# ## ###) to organize your content
    - Use **bold** and *italic* for emphasis
    - Create lists with - or 1. when appropriate
    - Always wrap code in proper \`\`\`language ... \`\`\` blocks with the language specified
    - Use tables when presenting structured data
    - Use > for important notes or quotes
    - Break your response into clear sections with headings

    Keep your explanations clear and comprehensive.`;

    const prompt = message || 'Hello';

    // Format messages for the specific provider
    const messages = formatProviderMessages(provider, prompt, systemPrompt);

    // Make the request using the centralized handler
    const { content, tokensUsed } = await handleAIRequest(config, provider, messages);

    console.log(`AI response generated using model: ${config.model}`);
    return createResponseWithMetadata(content, config.model, tokensUsed);
  } catch (error) {
    console.error('error generating prompt:', error);
    throw error;
  }
}
