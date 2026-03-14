/**
 * Urgency Scorer - Rule-based urgency calculation
 *
 * Scoring logic:
 *  - Critical keywords (outage, down, crash, etc.) raise urgency significantly
 *  - Positive/satisfied sentiment lowers urgency (these are likely feedback, not emergencies)
 *  - ALL CAPS raises urgency (users shout when panicking)
 *  - Exclamation marks alone are not reliable urgency signals; they appear in both
 *    "SERVER IS DOWN!!!" and "Thank you so much!!!" so they are intentionally ignored
 *  - Time-of-day and day-of-week are NOT factored in: production outages happen at 2am
 *    on Saturday just as often as Monday at noon
 */

const CRITICAL_KEYWORDS = [
  'down', 'outage', 'crash', 'crashed', 'broken', 'not working',
  'cannot', "can't", 'cant', 'unable', 'lost access', 'locked out',
  'urgent', 'asap', 'immediately', 'emergency', 'critical',
  'error', 'failed', 'failure', 'blocked', 'stuck',
  'production', 'data loss', 'deleted', 'missing data',
  'server', 'database', 'login', 'cannot log in', 'cant log in'
];

const POSITIVE_KEYWORDS = [
  'thank', 'thanks', 'appreciate', 'appreciated', 'happy',
  'love', 'great', 'excellent', 'wonderful', 'amazing',
  'awesome', 'perfect', 'fantastic', 'brilliant', 'satisfied'
];

export function calculateUrgency(message) {
  const lower = message.toLowerCase();
  let urgencyScore = 50;

  // Critical keywords strongly raise urgency
  CRITICAL_KEYWORDS.forEach(keyword => {
    if (lower.includes(keyword)) urgencyScore += 20;
  });

  // Positive/satisfied language lowers urgency — these are likely feedback, not crises
  POSITIVE_KEYWORDS.forEach(keyword => {
    if (lower.includes(keyword)) urgencyScore -= 15;
  });

  // ALL CAPS signals the user is panicking — raise urgency
  // (original code decreased urgency for ALL CAPS, which was backwards)
  const lettersOnly = message.replace(/[^a-zA-Z]/g, '');
  if (lettersOnly.length > 3 && message === message.toUpperCase()) {
    urgencyScore += 25;
  }

  if (urgencyScore > 80) return "High";
  if (urgencyScore < 30) return "Low";
  return "Medium";
}
