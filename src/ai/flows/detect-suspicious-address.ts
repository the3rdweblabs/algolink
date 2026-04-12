// src/ai/flows/detect-suspicious-address.ts
'use server';
/**
 * @fileOverview Detects potentially 'poisoned' wallet addresses by analyzing the pasted address
 * and comparing it against expected address patterns.
 *
 * - detectSuspiciousAddress - A function that handles the address detection process.
 * - DetectSuspiciousAddressInput - The input type for the detectSuspiciousAddress function.
 * - DetectSuspiciousAddressOutput - The return type for the detectSuspiciousAddress function.
 */

import {getAi} from '@/ai/genkit';
import {z} from 'genkit';

const DetectSuspiciousAddressInputSchema = z.object({
  address: z
    .string()
    .describe('The wallet address to check for suspicious patterns.'),
  userExpectedAddress: z.string().optional().describe('The wallet address the user expects.'),
  userTransactionHistory: z.string().optional().describe('The users transaction history'),
});
export type DetectSuspiciousAddressInput = z.infer<
  typeof DetectSuspiciousAddressInputSchema
>;

const DetectSuspiciousAddressOutputSchema = z.object({
  isSuspicious: z.boolean().describe('Whether or not the address is suspicious.'),
  reason: z.string().describe('The reason why the address is suspicious.'),
  suggestedAddress: z
    .string()
    .optional()
    .describe('The suggested address to use instead.'),
});
export type DetectSuspiciousAddressOutput = z.infer<
  typeof DetectSuspiciousAddressOutputSchema
>;

let promptInstance: any = null;
let flowInstance: any = null;

function getDetectSuspiciousAddressFlow() {
  const ai = getAi();
  if (!ai) return null;

  if (!flowInstance) {
    const prompt = ai.definePrompt({
      name: 'detectSuspiciousAddressPrompt',
      input: {schema: DetectSuspiciousAddressInputSchema},
      output: {schema: DetectSuspiciousAddressOutputSchema},
      prompt: `You are an expert in Algorand wallet security.

You will analyze the provided wallet address and determine if it is suspicious.

Consider the following factors:

*   Does the address match the user's expected address, if provided?
*   Does the address have a history of suspicious activity?
*   Does the address follow the expected format for an Algorand wallet address?
*  Based on the user's transaction history and expected address, what is the most likely valid address they intended to paste?

Address: {{{address}}}
User Expected Address: {{{userExpectedAddress}}}
User Transaction History: {{{userTransactionHistory}}}

Based on this information, determine if the address is suspicious and provide a reason.

Return a suggested address if you believe the user may have intended to paste a different address.

Output should be in JSON format.
`,
    });

    flowInstance = ai.defineFlow(
      {
        name: 'detectSuspiciousAddressFlow',
        inputSchema: DetectSuspiciousAddressInputSchema,
        outputSchema: DetectSuspiciousAddressOutputSchema,
      },
      async (input: DetectSuspiciousAddressInput) => {
        const {output} = await prompt(input);
        return output!;
      }
    );
  }
  return flowInstance;
}

export async function detectSuspiciousAddress(
  input: DetectSuspiciousAddressInput
): Promise<DetectSuspiciousAddressOutput> {
  const flow = getDetectSuspiciousAddressFlow();
  if (!flow) {
      return { isSuspicious: false, reason: "AI features are disabled during build or misconfigured." };
  }
  return flow(input);
}
