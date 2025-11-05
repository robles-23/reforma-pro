import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/config/env';
import { logger } from '@/config/logger';

const anthropic = new Anthropic({
  apiKey: env.CLAUDE_API_KEY,
  timeout: 60000, // 60 second timeout
  maxRetries: 2, // Retry twice on network errors
});

export class AIService {
  /**
   * Enhance project description using Claude AI
   */
  async enhanceDescription(
    originalDescription: string,
    projectTitle: string,
    imageCount: { before: number; after: number }
  ): Promise<string> {
    try {
      const systemPrompt = `Eres un experto en redacción profesional para empresas de construcción y renovación.
Tu tarea es transformar descripciones informales de trabajos de renovación en textos profesionales y atractivos para clientes.

Directrices:
- Mantén un tono profesional pero cercano
- Destaca las mejoras y transformaciones realizadas
- Organiza la información con viñetas cuando sea apropiado
- Enfócate en los beneficios para el cliente
- Usa un español claro y profesional
- Incluye detalles técnicos solo si son relevantes
- Crea una descripción de 2-4 párrafos máximo
- Empieza con una frase impactante sobre la transformación`;

      const userPrompt = `Proyecto: "${projectTitle}"

Descripción informal del trabajador:
"${originalDescription}"

Información adicional:
- ${imageCount.before} fotos del estado original
- ${imageCount.after} fotos del resultado final

Por favor, transforma esta descripción en un texto profesional y atractivo para presentar al cliente.`;

      // Create a promise that will timeout after 20 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Claude API timeout after 20 seconds')), 20000);
      });

      // Race between API call and timeout
      const message = await Promise.race([
        anthropic.messages.create({
          model: env.CLAUDE_MODEL_FAST,
          max_tokens: env.CLAUDE_MAX_TOKENS,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ],
        }),
        timeoutPromise
      ]) as Anthropic.Message;

      const enhancedDescription = message.content[0].type === 'text'
        ? message.content[0].text
        : originalDescription;

      logger.info('Description enhanced successfully', {
        inputLength: originalDescription.length,
        outputLength: enhancedDescription.length,
        tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
      });

      return enhancedDescription;
    } catch (error) {
      logger.error('Error enhancing description:', error);
      // Fallback: return original description if AI fails
      return originalDescription;
    }
  }

  /**
   * Analyze images (optional - future feature)
   */
  async analyzeImages(imageUrls: string[]): Promise<string> {
    try {
      // This would use Claude Vision to analyze renovation images
      // For Phase 1, we'll skip this and focus on description enhancement
      return 'Image analysis coming in Phase 2';
    } catch (error) {
      logger.error('Error analyzing images:', error);
      throw error;
    }
  }

  /**
   * Generate project suggestions based on images (future feature)
   */
  async generateSuggestions(projectData: any): Promise<string[]> {
    // Future feature: AI-generated improvement suggestions
    return [];
  }
}

export const aiService = new AIService();
