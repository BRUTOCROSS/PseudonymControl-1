import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Intent types for the chat system
export type Intent = 
  | 'greeting'
  | 'help'
  | 'submit_complaint'
  | 'question_anonymity'
  | 'question_process'
  | 'question_threshold'
  | 'question_status'
  | 'feedback'
  | 'thanks'
  | 'goodbye'
  | 'small_talk'
  | 'reassurance'
  | 'frustration'
  | 'confusion'
  | 'praise'
  | 'personal_question'
  | 'offensive'
  | 'joke'
  | 'other';

const intentResponses: Record<Intent, string[]> = {
  greeting: [
    "Hello! I'm here to help with your workplace concerns. How can I assist you today?",
    "Hi there! I'm your workplace complaint assistant. What would you like to know?",
    "Welcome! I can help you understand the complaint process or answer questions about workplace issues."
  ],
  help: [
    "I can help you with submitting anonymous complaints, understanding the process, checking complaint status, and answering questions about workplace policies.",
    "I'm here to guide you through the complaint system. You can ask about anonymity, escalation thresholds, or how to submit a complaint.",
    "Need assistance? I can explain how complaints are handled, what happens after submission, and how your privacy is protected."
  ],
  submit_complaint: [
    "To submit a complaint, click the 'New Complaint' button on your dashboard. Your identity will remain completely anonymous.",
    "You can submit anonymous complaints through the complaint form. Select a category and describe the issue in detail.",
    "Ready to submit? Use the complaint form to describe your workplace concern. All submissions are anonymous and confidential."
  ],
  question_anonymity: [
    "Your complaints are completely anonymous. We use pseudonyms instead of real names, and your identity is never revealed.",
    "Anonymity is guaranteed. Only you know your pseudonym, and complaints can't be traced back to you personally.",
    "We take privacy seriously. Your real identity is never stored with complaints, ensuring complete anonymity."
  ],
  question_process: [
    "After submission, complaints are automatically categorized by AI and reviewed by administrators. You'll receive updates on the resolution progress.",
    "The process: Submit → AI categorization → Admin review → Investigation → Resolution. You can track progress in your dashboard.",
    "Complaints go through automated categorization, admin review, and investigation. Similar complaints may be grouped for more effective resolution."
  ],
  question_threshold: [
    "Complaints are automatically escalated when similar issues reach a configurable threshold percentage in your organization.",
    "Escalation happens when multiple people report similar issues, indicating a systemic problem that needs immediate attention.",
    "The threshold system ensures serious or widespread issues get priority attention from management."
  ],
  question_status: [
    "Yes, your complaint has been successfully submitted and is now in the system! You can track its progress in your dashboard under 'My Complaints'.",
    "Absolutely! Your complaint was successfully lodged and is currently pending review. You'll receive notifications as the status updates.",
    "Yes, your complaint has been submitted successfully. It's now being reviewed by administrators and you can monitor its progress through your dashboard.",
    "Confirmed! Your complaint is in the system and being processed. You can check its current status anytime in the 'My Complaints' section."
  ],
  feedback: [
    "Thank you for your feedback! It helps us improve the complaint resolution process.",
    "Your feedback is valuable and helps us serve you better. Is there anything specific you'd like to see improved?",
    "We appreciate your input. Feedback like yours helps us make the system more effective for everyone."
  ],
  thanks: [
    "You're welcome! I'm here whenever you need help with workplace concerns.",
    "Happy to help! Don't hesitate to reach out if you have more questions.",
    "Glad I could assist! Remember, I'm always available for questions about the complaint process."
  ],
  goodbye: [
    "Take care! Remember, I'm here 24/7 if you need help with workplace concerns.",
    "Goodbye! Don't hesitate to return if you have questions or need to submit a complaint.",
    "See you later! I'm always available to help with your workplace concerns."
  ],
  small_talk: [
    "I'm here to focus on workplace concerns and complaints. What can I help you with regarding your work environment?",
    "While I appreciate the conversation, I'm specialized in workplace issues. How can I assist with your workplace concerns?",
    "Let's focus on how I can help with workplace matters. Do you have any questions about the complaint process?"
  ],
  reassurance: [
    "I understand workplace issues can be stressful. Remember that submitting a complaint is a positive step toward resolution.",
    "It's natural to feel concerned about workplace problems. The complaint system is here to help address these issues confidentially.",
    "You're doing the right thing by seeking help. The anonymous complaint system ensures your concerns are heard safely."
  ],
  frustration: [
    "I understand your frustration. The complaint system is designed to address these concerns effectively and anonymously.",
    "Workplace issues can be very frustrating. Filing a complaint helps ensure your concerns get proper attention.",
    "Your frustration is understandable. The anonymous complaint process can help address the root causes of workplace problems."
  ],
  confusion: [
    "I'm here to clarify anything about the complaint process. What specific aspect would you like me to explain?",
    "No worries about confusion - the system can seem complex at first. What would you like me to help clarify?",
    "Let me help clear things up. What part of the complaint process would you like me to explain in more detail?"
  ],
  praise: [
    "Thank you for the kind words! I'm glad the complaint system is working well for you.",
    "I appreciate your positive feedback! It helps us know the system is serving its purpose.",
    "Thanks! It's great to hear the complaint process is meeting your needs."
  ],
  personal_question: [
    "I'm focused on helping with workplace complaints and concerns. How can I assist you with work-related matters?",
    "While I appreciate your interest, I'm here to help with workplace issues. What can I do regarding your work environment?",
    "I'm specialized in workplace complaint assistance. What work-related concerns can I help you with?"
  ],
  offensive: [
    "I'm here to maintain a professional environment. Let's focus on how I can help with legitimate workplace concerns.",
    "Please keep our conversation professional. I'm here to help with workplace issues and complaints.",
    "I need to keep our discussion appropriate and work-focused. How can I assist with workplace matters?"
  ],
  joke: [
    "I appreciate the humor! While I stay focused on workplace matters, I'm here to help with any serious concerns you might have.",
    "That's amusing! Now, how can I help you with workplace issues or the complaint process?",
    "I like the levity! Is there anything work-related I can help you with today?"
  ],
  other: [
    "I'm not sure I understand. Could you clarify what you'd like to know about the complaint process or workplace concerns?",
    "Can you help me understand what you're looking for? I'm here to assist with workplace complaints and related questions.",
    "I want to make sure I help you properly. What specifically would you like to know about workplace issues or complaints?"
  ]
};

// Function to detect if a message is a complaint submission
export function isComplaintSubmission(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Check message length - complaints are usually detailed
  if (message.length < 20) {
    return false;
  }

  // Complaint indicators
  const complaintKeywords = [
    'complaint', 'complain', 'issue', 'problem', 'concern', 'report',
    'harassment', 'discrimination', 'bullying', 'unfair', 'unsafe',
    'violated', 'violation', 'inappropriate', 'unprofessional',
    'hostile environment', 'workplace issue', 'submit a complaint',
    'file a complaint', 'lodge a complaint', 'raise a concern',
    'wifi', 'wi-fi', 'internet', 'network', 'connectivity', 'slow',
    'disconnecting', 'not working', 'broken', 'malfunctioning'
  ];

  // Direct complaint submission phrases
  const directSubmissionPhrases = [
    'i want to file', 'i want to submit', 'i want to report',
    'i need to report', 'i need to complain', 'i have a complaint',
    'i want to lodge', 'submit complaint', 'file complaint',
    'report an issue', 'there is a problem', 'this is a complaint',
    'submit this', 'lodge this', 'file this'
  ];

  // Check for direct submission phrases
  const hasDirectPhrase = directSubmissionPhrases.some(phrase => 
    lowerMessage.includes(phrase)
  );

  // Check for complaint keywords
  const hasComplaintKeywords = complaintKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );

  // Check for detailed description patterns (sentences with complaint context)
  const hasDetailedDescription = (
    (lowerMessage.includes('my manager') || lowerMessage.includes('supervisor') || 
     lowerMessage.includes('colleague') || lowerMessage.includes('coworker') ||
     lowerMessage.includes('office') || lowerMessage.includes('workplace')) &&
    (lowerMessage.includes('said') || lowerMessage.includes('did') || 
     lowerMessage.includes('told') || lowerMessage.includes('made') ||
     lowerMessage.includes('is') || lowerMessage.includes('has been') ||
     lowerMessage.includes('keeps') || lowerMessage.includes('always'))
  ) || (
    (lowerMessage.includes('department') || lowerMessage.includes('system') ||
     lowerMessage.includes('equipment') || lowerMessage.includes('facility')) && 
    (lowerMessage.includes('not') || lowerMessage.includes('doesn\'t') || 
     lowerMessage.includes('refuses') || lowerMessage.includes('ignores') ||
     lowerMessage.includes('slow') || lowerMessage.includes('broken') ||
     lowerMessage.includes('disconnecting') || lowerMessage.includes('affecting'))
  );

  // Infrastructure-specific complaints (like WiFi issues)
  const hasInfrastructureComplaint = (
    (lowerMessage.includes('wifi') || lowerMessage.includes('wi-fi') ||
     lowerMessage.includes('internet') || lowerMessage.includes('network') ||
     lowerMessage.includes('connectivity') || lowerMessage.includes('connection')) &&
    (lowerMessage.includes('slow') || lowerMessage.includes('disconnecting') ||
     lowerMessage.includes('not working') || lowerMessage.includes('issues') ||
     lowerMessage.includes('problems') || lowerMessage.includes('affecting'))
  );

  return hasDirectPhrase || hasInfrastructureComplaint || (hasComplaintKeywords && hasDetailedDescription);
}

export async function categorizeComplaint(text: string): Promise<{
  category: string;
  confidence: number;
  similarityGroup: string;
}> {
  try {
    const systemPrompt = `You are an expert at categorizing workplace complaints. 
Analyze the complaint and provide:
1. A category from: hr, infrastructure, management, cafeteria, security, other
2. A confidence score between 0 and 1
3. A similarity group identifier (short descriptive phrase for grouping similar complaints)

Respond with JSON in this exact format:
{
  "category": "string",
  "confidence": number,
  "similarityGroup": "string"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            category: { type: "string" },
            confidence: { type: "number" },
            similarityGroup: { type: "string" }
          },
          required: ["category", "confidence", "similarityGroup"]
        }
      },
      contents: text,
    });

    const result = JSON.parse(response.text || '{}');
    return {
      category: result.category || 'other',
      confidence: result.confidence || 0.5,
      similarityGroup: result.similarityGroup || 'general'
    };
  } catch (error) {
    console.error('Error categorizing complaint:', error);
    return {
      category: 'other',
      confidence: 0.5,
      similarityGroup: 'general'
    };
  }
}

// Function to check if user wants the chatbot to submit a previously described complaint
export function isComplaintConfirmationRequest(message: string, chatHistory: Array<{role: string, content: string}>): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Check if user is asking why chatbot won't submit or asking chatbot to submit
  const confirmationPhrases = [
    'why not you', 'why not submit', 'why can\'t you submit', 'submit it',
    'lodge it', 'file it', 'you submit', 'submit this', 'submit my complaint',
    'go ahead and submit', 'please submit', 'can you submit', 'will you submit'
  ];
  
  const hasConfirmationRequest = confirmationPhrases.some(phrase => 
    lowerMessage.includes(phrase)
  );
  
  // Check if there was a recent detailed complaint description in chat history
  const recentMessages = chatHistory.slice(-5); // Check last 5 messages
  const hasRecentComplaint = recentMessages.some(msg => 
    msg.role === 'user' && msg.content.length > 50 && (
      isComplaintSubmission(msg.content) ||
      msg.content.toLowerCase().includes('wifi') ||
      msg.content.toLowerCase().includes('wi-fi') ||
      msg.content.toLowerCase().includes('internet') ||
      msg.content.toLowerCase().includes('problem') ||
      msg.content.toLowerCase().includes('issue')
    )
  );
  
  return hasConfirmationRequest && hasRecentComplaint;
}

export function detectIntent(message: string): Intent {
  const lowerMessage = message.toLowerCase();
  
  // Greeting patterns
  if (/\b(hello|hi|hey|good morning|good afternoon|good evening)\b/.test(lowerMessage)) {
    return 'greeting';
  }
  
  // Help patterns
  if (/\b(help|assist|support|guide|how)\b/.test(lowerMessage)) {
    return 'help';
  }
  
  // Status/confirmation questions - check these BEFORE submit_complaint
  if (/\b(is|was|has|did).*(submitted|lodged|filed|sent|received|successful)\b/.test(lowerMessage) ||
      /\b(my complaint).*(submitted|lodged|filed|sent|received)\b/.test(lowerMessage) ||
      /\b(so|was|is).*(complaint|issue).*(submitted|lodged|successful)\b/.test(lowerMessage)) {
    return 'question_status';
  }
  
  // Complaint submission - only if not a status question
  if (/\b(submit|file|report|complaint|issue|problem)\b/.test(lowerMessage) && 
      !/\b(is|was|has|did|so|my complaint).*(submitted|lodged|filed|sent|received|successful)\b/.test(lowerMessage)) {
    return 'submit_complaint';
  }
  
  // Anonymity questions
  if (/\b(anonymous|identity|private|confidential|secret)\b/.test(lowerMessage)) {
    return 'question_anonymity';
  }
  
  // Process questions
  if (/\b(process|how does|what happens|procedure|steps)\b/.test(lowerMessage)) {
    return 'question_process';
  }
  
  // Status questions
  if (/\b(status|progress|update|check|track)\b/.test(lowerMessage)) {
    return 'question_status';
  }
  
  // Threshold questions
  if (/\b(threshold|escalate|escalation|automatic|priority)\b/.test(lowerMessage)) {
    return 'question_threshold';
  }
  
  // Thanks
  if (/\b(thank|thanks|appreciate|grateful)\b/.test(lowerMessage)) {
    return 'thanks';
  }
  
  // Goodbye
  if (/\b(bye|goodbye|see you|farewell|exit|quit)\b/.test(lowerMessage)) {
    return 'goodbye';
  }
  
  // Frustration
  if (/\b(frustrated|angry|upset|annoyed|terrible|awful|horrible)\b/.test(lowerMessage)) {
    return 'frustration';
  }
  
  // Confusion
  if (/\b(confused|don't understand|unclear|explain|clarify)\b/.test(lowerMessage)) {
    return 'confusion';
  }
  
  // Praise
  if (/\b(great|excellent|amazing|wonderful|fantastic|love|perfect)\b/.test(lowerMessage)) {
    return 'praise';
  }
  
  return 'other';
}

function getResponseForIntent(intent: Intent): string {
  const responses = intentResponses[intent];
  return responses[Math.floor(Math.random() * responses.length)];
}

export async function summarizeComplaintGroup(complaints: any[], similarityGroup: string): Promise<{
  summary: string;
  keyIssues: string[];
  affectedCount: number;
  urgencyLevel: 'low' | 'medium' | 'high';
}> {
  try {
    const systemPrompt = `You are an expert at analyzing workplace complaints to provide executive summaries for administrators.

Analyze this group of similar complaints and provide:
1. A clear summary of the main issue
2. Key issues identified (array of strings)
3. Count of affected employees
4. Urgency level (low/medium/high) based on severity and frequency

Focus on patterns, root causes, and actionable insights for management.

Respond with JSON in this exact format:
{
  "summary": "string",
  "keyIssues": ["string"],
  "affectedCount": number,
  "urgencyLevel": "low|medium|high"
}`;

    const complaintsText = complaints.map((c, i) => 
      `Complaint ${i + 1}: ${c.content}`
    ).join('\n\n');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            keyIssues: { 
              type: "array",
              items: { type: "string" }
            },
            affectedCount: { type: "number" },
            urgencyLevel: { 
              type: "string",
              enum: ["low", "medium", "high"]
            }
          },
          required: ["summary", "keyIssues", "affectedCount", "urgencyLevel"]
        }
      },
      contents: `Similarity Group: ${similarityGroup}\n\nComplaints:\n${complaintsText}`,
    });

    const result = JSON.parse(response.text || '{}');
    return {
      summary: result.summary || 'Multiple complaints received on this topic',
      keyIssues: result.keyIssues || ['Workplace concern identified'],
      affectedCount: result.affectedCount || complaints.length,
      urgencyLevel: result.urgencyLevel || 'medium'
    };
  } catch (error) {
    console.error('Error summarizing complaint group:', error);
    return {
      summary: `${complaints.length} similar complaints regarding ${similarityGroup}`,
      keyIssues: ['Multiple employees affected', 'Requires attention'],
      affectedCount: complaints.length,
      urgencyLevel: 'medium'
    };
  }
}

export async function getChatResponse(userMessage: string, chatHistory: Array<{role: string, content: string}>): Promise<string> {
  try {
    // Detect intent from user message
    const intent = detectIntent(userMessage);
    
    // For simple intents, return predefined responses
    if (intent !== 'other' && intent !== 'help') {
      return getResponseForIntent(intent);
    }
    
    // For complex queries, use AI
    const systemPrompt = `You are a helpful workplace complaint assistant. You help employees understand the anonymous complaint process, answer questions about workplace policies, and provide guidance on submitting complaints.

Key information:
- All complaints are completely anonymous using pseudonyms
- Complaints are automatically categorized by AI into: HR, Infrastructure, Management, Cafeteria, Security, Other
- Similar complaints are grouped together for pattern recognition
- Complaints are automatically escalated when they reach threshold percentages
- Users can track complaint status through their dashboard
- The system prioritizes employee privacy and safety

Keep responses helpful, professional, and focused on workplace concerns. If asked about non-workplace topics, politely redirect to workplace matters.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt
      },
      contents: [
        ...chatHistory.slice(-3).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })),
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ]
    });

    return response.text || getResponseForIntent('help');
  } catch (error) {
    console.error('Error getting chat response:', error);
    return "I'm sorry, I'm having trouble responding right now. Please try asking about the complaint process, anonymity, or how to submit a workplace concern.";
  }
}