import { getUserModelConfig } from './modelConfig.js';
import { createResponseWithMetadata } from './metadataHelper.js';
import { getAIClient } from './aiConfig.js';
import { handleAIRequest, formatProviderMessages } from './aiProviderHandler.js';

export async function generateEmailResponse(prompt, userId = null) {
  try {
    const config = await getUserModelConfig(userId, 1500);
    const provider = getAIClient(config.model);

    const systemMessage = `You are an AI email assistant that drafts professional email responses based on the provided content.

GUIDELINES:
- Write only the email response.
- Avoid adding unnecessary sections like "Information Requested" or "Response".
- Use markdown formatting for clarity:
  - Include a subject line if relevant.
  - Use proper greeting and closing.
  - Structure the email with clear paragraphs.

EXAMPLE FORMAT:
Subject: [Insert Subject]

[Greeting],

[Body of the email]

[Closing],
[Your Name]`;

    const userMessage = `Draft a response email based on the following content:

"${prompt}"`;

    // Format messages for the specific provider
    const messages = formatProviderMessages(provider, userMessage, systemMessage);

    // Make the request using the centralized handler
    const { content, tokensUsed } = await handleAIRequest(config, provider, messages);

    console.log(`Email response generated using model: ${config.model}`);
    return createResponseWithMetadata(content, config.model, tokensUsed);
  } catch (error) {
    console.error('Error generating email response:', error);
    throw error;
  }
}
