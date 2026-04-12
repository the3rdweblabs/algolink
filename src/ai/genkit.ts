import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

let aiInstance: ReturnType<typeof genkit> | null = null;

export const getAi = () => {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }
  if (!aiInstance) {
    aiInstance = genkit({
      plugins: [googleAI()],
      model: 'googleai/gemini-2.0-flash',
    });
  }
  return aiInstance;
};

// For backward compatibility or if used at top level, but it's better to use getAi()
export const ai = getAi();
