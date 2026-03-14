/**
 * Recommendation Templates - Maps categories to recommended actions
 */

const actionTemplates = {
  "Billing Issue": "Direct the customer to the billing portal to review charges. If the issue involves a failed payment or unexpected charge, loop in the billing team directly.",
  "Technical Problem": "Ask the customer for steps to reproduce the issue and any error messages or screenshots. If it's a production outage (app/server down), escalate immediately to the engineering team.",
  "General Inquiry": "Respond with the relevant FAQ link or answer directly. Follow up to confirm the question was fully addressed.",
  "Feature Request": "Thank the customer for the suggestion and log it in the product feedback tracker. Set expectations that the team reviews feature requests on a regular basis.",
  "Positive Feedback": "Send a genuine thank-you reply. Consider flagging this customer to the success team as a potential testimonial or case study.",
  "Unknown": "Review manually and route to the appropriate team."
}

/**
 * Get recommended action for a given category
 *
 * @param {string} category - The message category
 * @param {string} urgency - The urgency level
 * @returns {string} - Recommended next step
 */
export function getRecommendedAction(category, urgency) {
  return actionTemplates[category] || actionTemplates["Unknown"];
}

/**
 * Get all available categories
 *
 * @returns {string[]} - List of categories
 */
export function getAvailableCategories() {
  return Object.keys(actionTemplates);
}

/**
 * Determines if message should be escalated
 *
 * @param {string} category - The message category
 * @param {string} urgency - The urgency level
 * @param {string} message - The original message
 * @returns {boolean} - Whether to escalate
 */
export function shouldEscalate(category, urgency, message) {
  return urgency === "High" || category === "Technical Problem" && urgency !== "Low";
}
