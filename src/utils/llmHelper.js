import Groq from 'groq-sdk';

/**
 * LLM Helper for categorizing customer support messages
 * Using Groq API for AI-powered categorization
 */

// Initialize Groq client
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // Required for browser-based calls (not recommended for production!)
});

/**
 * System prompt gives the model a clear role, valid output categories,
 * and a strict JSON format. This replaces the original approach of parsing
 * free-form text with keyword matching, which produced "Unknown" whenever
 * the model used different wording than expected.
 */
const SYSTEM_PROMPT = `You are a customer support triage assistant for a SaaS platform called Relay AI.
Your job is to read incoming customer messages and classify them into exactly one of the following categories:

- "Billing Issue": Questions or problems related to payments, invoices, charges, subscriptions, refunds, or account billing.
- "Technical Problem": Reports of bugs, errors, outages, crashes, slow performance, or any feature that is not working correctly.
- "Feature Request": Suggestions or requests for new features, improvements, or enhancements to the product.
- "Positive Feedback": Compliments, thank-you messages, or expressions of satisfaction where no support action is needed.
- "General Inquiry": Questions about how the product works, pricing, business hours, or any other informational request.

You MUST respond with valid JSON only — no explanation outside the JSON object. Use this exact format:
{
  "category": "<one of the five categories listed above>",
  "reasoning": "<1-2 sentences explaining why this category was chosen>",
  "confidence": "<high | medium | low>"
}`;

/**
 * Categorize a customer support message using Groq AI
 *
 * @param {string} message - The customer support message
 * @returns {Promise<{category: string, reasoning: string, confidence: string}>}
 */
export async function categorizeMessage(message) {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
      temperature: 0, // Deterministic output for consistent classification
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    const validCategories = [
      "Billing Issue",
      "Technical Problem",
      "Feature Request",
      "Positive Feedback",
      "General Inquiry"
    ];

    return {
      category: validCategories.includes(parsed.category) ? parsed.category : "General Inquiry",
      reasoning: parsed.reasoning || content,
      confidence: parsed.confidence || "medium"
    };
  } catch (error) {
    console.warn('Groq API failed, using mock response:', error.message);
    return getMockCategorization(message);
  }
}

/**
 * Mock categorization for when API is unavailable
 */
function getMockCategorization(message) {
  const lower = message.toLowerCase();

  if (lower.includes('bill') || lower.includes('payment') ||
      lower.includes('charge') || lower.includes('invoice') ||
      lower.includes('credit card') || lower.includes('subscription') ||
      lower.includes('refund') || (lower.includes('cancel') && lower.includes('account'))) {
    return {
      category: "Billing Issue",
      reasoning: "The message contains billing or payment-related keywords, indicating a billing concern.",
      confidence: "high"
    };
  }

  if (lower.includes('bug') || lower.includes('error') ||
      lower.includes('broken') || lower.includes('not working') ||
      lower.includes('crash') || lower.includes('down') ||
      lower.includes('server') || lower.includes('loading') ||
      lower.includes('slow') || (lower.includes('issue') && !lower.includes('no issue')) ||
      (lower.includes('problem') && !lower.includes('no problem'))) {
    return {
      category: "Technical Problem",
      reasoning: "The message describes a technical malfunction, outage, or error that requires investigation.",
      confidence: "high"
    };
  }

  if (lower.includes('feature') || lower.includes('improve') ||
      lower.includes('would like to see') || lower.includes('suggestion') ||
      lower.includes('wish') || lower.includes('enhancement') ||
      lower.includes('would be great') || lower.includes('could you add') ||
      (lower.includes('add') && (lower.includes('please') || lower.includes('could')))) {
    return {
      category: "Feature Request",
      reasoning: "The message requests new functionality or an improvement to the product.",
      confidence: "high"
    };
  }

  if ((lower.includes('thank') || lower.includes('thanks') || lower.includes('appreciate') ||
       lower.includes('amazing') || lower.includes('love') || lower.includes('great job')) &&
      !lower.includes('but') && !lower.includes('however') && !lower.includes('issue')) {
    return {
      category: "Positive Feedback",
      reasoning: "The message expresses satisfaction or gratitude without any support request.",
      confidence: "high"
    };
  }

  if (lower.includes('how') || lower.includes('what') ||
      lower.includes('when') || lower.includes('where') ||
      lower.includes('can i') || lower.includes('is there') ||
      lower.includes('?')) {
    return {
      category: "General Inquiry",
      reasoning: "The message appears to be a question or information request rather than a specific support issue.",
      confidence: "medium"
    };
  }

  return {
    category: "General Inquiry",
    reasoning: "The message did not match a specific support category and has been flagged for manual review.",
    confidence: "low"
  };
}
