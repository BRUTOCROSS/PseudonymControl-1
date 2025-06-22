// Intent types for the chat system
export type Intent = 'greeting' | 'help' | 'complaint_status' | 'submit_complaint' | 'feedback' | 'escalation' | 'unknown';

// Response templates for different intents
export const intentResponses: Record<Intent, string[]> = {
  greeting: [
    "Hello! I'm here to help you with your workplace complaints. How can I assist you today?",
    "Hi there! I can help you submit complaints, check their status, or answer questions about the process.",
    "Welcome! I'm your anonymous complaint assistant. What would you like to know?"
  ],
  
  help: [
    "I can help you with:\n- Submitting new complaints\n- Checking complaint status\n- Understanding the resolution process\n- Providing feedback on resolved complaints",
    "Here's what I can do:\n- Guide you through complaint submission\n- Explain our escalation process\n- Help track your complaints\n- Answer questions about anonymity"
  ],
  
  complaint_status: [
    "Let me check the status of your complaints. You can view all your submissions in the 'My Complaints' section.",
    "To check your complaint status, visit the complaints dashboard where you'll see real-time updates."
  ],
  
  submit_complaint: [
    "I'd be happy to help you submit a complaint. Click the 'Submit Complaint' button to start the anonymous process.",
    "To submit a new complaint, use our secure form. Your identity will remain completely anonymous."
  ],
  
  feedback: [
    "Your feedback helps improve our workplace. You can rate resolved complaints and provide additional comments.",
    "After a complaint is resolved, you'll be able to provide feedback on the resolution quality."
  ],
  
  escalation: [
    "Complaints are automatically escalated when they meet certain thresholds or remain unresolved for extended periods.",
    "Our escalation system ensures urgent issues receive appropriate attention from management."
  ],
  
  unknown: [
    "I'm not sure I understand. Could you rephrase your question?",
    "Can you provide more details about what you'd like help with?",
    "I'm here to help with complaints and workplace issues. What specific assistance do you need?"
  ]
};

// Confirmation messages for complaint submission
export const complaintConfirmation = {
  success: "Your complaint has been submitted successfully! You'll receive notifications about any status updates.",
  processing: "Your complaint is being processed and categorized. This usually takes a few minutes.",
  error: "There was an issue submitting your complaint. Please try again or contact support."
};
