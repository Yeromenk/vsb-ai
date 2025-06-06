export function createResponseWithMetadata(content, model, tokens, costPerToken) {
  // Calculate cost based on a model if not provided
  if (!costPerToken) {
    switch (model) {
      case 'gpt-4o':
        costPerToken = 0.00001; // $10 per 1M tokens
        break;
      case 'gpt-4o-mini':
        costPerToken = 0.000003; // $3 per 1M tokens
        break;
      case 'gpt-3.5-turbo':
        costPerToken = 0.000001; // $1 per 1M tokens
        break;
      default:
        costPerToken = 0.000005;
    }
  }

  const estimatedCost = tokens * costPerToken;

  return {
    content,
    metadata: {
      model,
      tokens,
      cost: estimatedCost,
    },
  };
}
