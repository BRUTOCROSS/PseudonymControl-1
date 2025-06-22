// Types for the intents we detect in user messages
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

// Expanded map of intents to natural-sounding human-like responses
export const intentResponses: Record<Intent, string[]> = {
  greeting: [
    "Hello! Welcome to the Pseudonymous Control Resolve System. How can I help you today?",
    "Hi there! I'm here to help with any workplace concerns you might have. What brings you to our platform today?",
    "Good day! I'm your anonymous complaint assistant. Is there something specific you'd like to discuss or report?",
    "Hello and welcome! I'm here to help you submit confidential feedback or address any questions you might have about our system. How can I assist you?",
    "Hi! Thanks for reaching out to PCRS. I'm here to help you navigate our anonymous reporting system. What can I help you with today?"
  ],

  help: [
    "I can definitely help with that. Whether you're dealing with a difficult colleague, uncomfortable workplace situation, or just need to vent about something - I'm all ears. What specifically are you looking for help with?",
    "Sure thing. I can help in a few different ways - you might want to submit a confidential complaint, check on something you've already reported, or just understand how our anonymous system works. What would be most helpful for you right now?",
    "Of course I can help. Think of me as your workplace confidant - I can take your concerns to management without revealing your identity, explain how our system works, or just listen if you need to talk things through. What's most pressing for you?",
    "Happy to help! The beauty of our system is that you can speak freely without worrying about retaliation. Would you like to report something specific, learn more about how we protect your identity, or maybe check the status of a previous concern?",
    "I'd love to help. Everyone deserves to feel comfortable at work, and sometimes that means having someone who can advocate for you behind the scenes. What particular aspect of workplace concerns can I assist with today?"
  ],

  submit_complaint: [
    "I understand, and I'm sorry you're going through this. Could you tell me more about what happened? Try to include specific details like when it occurred, who was involved (without naming names if you're not comfortable), and how it's affecting you. I'm listening.",
    "That sounds frustrating. I'd like to hear more about this situation if you're comfortable sharing. The more context you can provide, the better I can help address the underlying issues. And remember, this conversation stays between us.",
    "I appreciate you trusting me with this. Would you mind sharing a bit more about what occurred? Details really help me understand the full picture. And please know that your identity is completely protected throughout this process.",
    "Thanks for bringing this up - it takes courage to speak up about workplace issues. Could you walk me through what happened from the beginning? Take your time - I'm here to listen without judgment, and everything you share remains confidential.",
    "I'm sorry to hear that. Let's work through this together. Could you provide some more context about the situation? The more specific you can be about what happened, when, and how it's impacting you, the better we can address it - all while keeping your identity protected."
  ],

  question_anonymity: [
    "That's a really important question. Your anonymity is completely protected through several layers of security. When you submit a complaint, your real name is replaced with a random identifier that can't be traced back to you. Even if someone directly asked who submitted a specific complaint, the system is designed so that no one - not even administrators - can determine that information.",
    "I completely understand your concern about privacy. Here's how it works: when you submit information, the system automatically strips away any identifying details and assigns a pseudonym to your report. Think of it like dropping an anonymous note in a suggestion box - the contents are seen, but no one knows who left it. Your real identity is never connected to the concerns you raise.",
    "Your concern about privacy is totally valid. Let me assure you that our system was built with anonymity as the absolute priority. Your name, position, and any other identifying information are completely separated from your reports. When management sees patterns of similar complaints, they only see that 'multiple employees' have reported an issue - never who those specific employees are.",
    "Privacy is the foundation of our entire system. When you submit a concern, it goes through a process that removes all traces connecting it to you personally. Think of it like sending a letter without a return address - the message gets delivered, but no one can tell who sent it. Does that help address your concerns about staying anonymous?",
    "That's something many people worry about, so I'm glad you asked. Our system uses advanced encryption and pseudonymization techniques to ensure your real identity remains completely protected. Even if someone with administrative access tried to figure out who submitted a particular complaint, the system is designed to make that impossible. Your privacy is non-negotiable in our process."
  ],

  question_process: [
    "I understand you want to know how things work behind the scenes. Here's the process: When you submit a concern, it first gets categorized based on the type of issue (like HR matters, facilities problems, etc.). Then, our system looks for similar reports from others. If enough related concerns come in, it signals to management that there's a pattern worth addressing. The beauty is that this all happens without revealing anyone's identity - management just sees that 'several employees' have reported similar issues.",
    "Great question about the process. It works like this: Your concern gets submitted through me and is immediately anonymized. Then it's sorted into categories like 'management issues' or 'workplace safety' based on what it's about. The system then monitors for similar complaints from others. When enough similar issues are reported, it creates a trend report for management showing there's a widespread concern - all without revealing who submitted what. Would you like me to explain any part of that in more detail?",
    "The process is actually pretty straightforward. When you share a concern with me, I help organize it into the right category. Your identity is immediately masked with a pseudonym. If other people report similar issues, our system recognizes the pattern and escalates it to management as a collective concern - kind of like saying 'multiple team members have reported this issue' without specifying who those team members are. This way, real problems get addressed without exposing anyone.",
    "Let me walk you through how it works: First, your concern gets submitted and immediately anonymized. Next, it's analyzed and categorized based on the topic. Then it's grouped with similar reports from others. Once enough similar issues accumulate, the system alerts management about the trend. Management sees patterns like '7 employees have reported issues with the meeting room scheduling system' - but they never see who those specific employees are. Does that clarify the process?",
    "The process is designed to balance effective problem-solving with complete privacy. When you submit a concern, it first goes through anonymization. Then our system categorizes it and looks for similar patterns from other reports. When multiple similar issues are detected, management receives a notification about the trend - for example, 'There have been several reports about the air conditioning in the east wing.' They can address the problem without ever knowing who specifically reported it."
  ],

  question_threshold: [
    "That's a thoughtful question about thresholds. We use a flexible approach that depends on the severity of the issue. For serious matters like safety concerns or harassment, even just 2-3 similar reports will trigger escalation to management. For less urgent issues like office equipment problems, it might take 5-7 similar reports. And the timeframe matters too - several reports in a single week escalate faster than the same number spread over months. This balances addressing serious issues quickly while still preserving everyone's anonymity.",
    "The threshold system is quite nuanced. Different types of issues have different thresholds based on their impact and urgency. For high-priority concerns like safety hazards or ethical violations, the threshold is very low - sometimes just a couple of similar reports will trigger action. For more routine matters, it might take several reports before the system flags it as a pattern. This approach ensures urgent matters get immediate attention while still protecting everyone's identity.",
    "Great question about how thresholds work. Think of it like this: Our system is constantly looking for patterns in the concerns being reported. Some issues, like harassment or safety problems, are considered high-priority and might only need 2-3 similar reports to be escalated. Medium-priority issues might need 4-6 reports, while lower-priority matters might need 8-10. This tiered approach ensures that serious issues get prompt attention while still maintaining everyone's anonymity.",
    "The threshold system works a bit like a weather warning system - different issues have different thresholds based on their severity. Critical issues like discrimination or safety violations have a very low threshold, sometimes just 2-3 reports. Moderate issues might need 5-6 similar reports, while minor concerns might require 8+ reports before triggering escalation. The system also considers timing - multiple reports in a short timeframe suggest an urgent issue requiring faster attention.",
    "Thresholds in our system are adaptive and context-sensitive. For example, harassment or safety concerns have very low thresholds - sometimes just a couple of reports will trigger escalation because these issues require immediate attention. For things like cafeteria quality or meeting room availability, the threshold might be higher because these issues, while important, aren't usually urgent. The system also learns over time which issues are most important to your specific organization and adjusts accordingly."
  ],

  question_status: [
    "You can easily check the status of your reports through your personal dashboard. Just log in and go to the 'My Complaints' section. There you'll see all your submitted concerns with their current status - whether they're being reviewed, have been categorized, are being addressed, or have been resolved. It's your private tracking system that no one else can access, so your anonymity remains completely intact.",
    "Checking your report status is simple and completely private. Visit your dashboard and look for the 'My Complaints' tab. You'll see all your submissions with real-time status updates. The status might show 'Under Review' (being initially processed), 'In Progress' (being addressed), 'Escalated' (has reached the threshold and been sent to management), or 'Resolved' (action has been taken). And don't worry - no one else can see that you submitted these specific reports.",
    "Your dashboard is the place to go for status updates. When you log in, click on 'My Complaints' to see everything you've submitted. Each report will show its current status in the process - from initial review to final resolution. You'll also see if your report has been grouped with others as part of a pattern. This is all visible only to you - it's like having a private tracker that no one else can access.",
    "Tracking your report status is straightforward. Your personal dashboard has a 'My Complaints' section that shows all your submissions with their current status. You'll see updates as your concern moves through our process - from initial submission to categorization to resolution. If your report has been combined with others to identify a pattern, you'll see that too. And this information is only visible to you, so you can check freely without compromising your anonymity.",
    "Status updates are available through your secure personal dashboard. Just go to the 'My Complaints' section to see all your reports with their current status. You might see statuses like 'Received' (just submitted), 'Categorized' (sorted into a topic area), 'Monitoring' (looking for similar reports), 'Escalated' (sent to management as part of a pattern), or 'Resolved' (action has been taken). This is your private view - no one else can see which reports are yours."
  ],

  feedback: [
    "Thank you so much for sharing your thoughts! Feedback like yours is incredibly valuable - it helps me provide better support for everyone. I'm curious - is there anything specific about our conversation that worked particularly well for you, or anything you think could be improved?",
    "I really appreciate you taking the time to give feedback. It's exactly this kind of input that helps me grow and improve. Is there anything specific about how I've been handling our conversation that you'd like to see more of? Or perhaps something that could be better?",
    "Your feedback means a lot to me - thank you for sharing it! I'm always looking to improve how I communicate and assist. Was there something specific about our interaction that prompted this feedback? I'd love to hear more about your experience.",
    "Thank you for the feedback! It's really helpful to know what's working well and what could be better. Since you're taking the time to share your thoughts, would you mind telling me a bit more about what aspects of our conversation have been most useful to you?",
    "I genuinely appreciate you sharing your thoughts. Your perspective helps me become more effective for everyone who uses this system. I'd love to hear more specifics if you have them - what parts of our conversation felt most natural or helpful to you? Is there anything you wish had gone differently?"
  ],

  thanks: [
    "You're very welcome! I'm glad I could help. It's always nice to know I've been useful. Is there anything else you'd like to discuss while we're chatting? I'm here whenever you need me.",
    "It's my pleasure, truly. Sometimes just having someone to talk to about workplace concerns can make a big difference. Don't hesitate to reach out again whenever you need to - that's exactly what I'm here for.",
    "I'm really glad I could be of help! That's exactly why I'm here. Remember you can come back anytime you need to discuss workplace concerns or check on previous reports. Is there anything else I can assist with before you go?",
    "You're welcome! I'm happy we could have this conversation. Sometimes workplace issues can feel isolating, so I'm glad you reached out. Please remember that I'm here whenever you need to talk or submit new concerns.",
    "Of course - happy to help! It's always rewarding to know I've been useful. Remember that our conversation stays private, and you can always return to discuss more concerns or follow up on existing ones. Is there anything else on your mind before we wrap up?"
  ],

  goodbye: [
    "Take care! Remember I'm here whenever you need to talk about workplace matters - whether it's following up on this conversation or discussing something completely new. Have a great rest of your day!",
    "Goodbye for now! I'm glad we had a chance to chat. Remember you can always pick up this conversation later if something else comes to mind. Hope the rest of your day goes well!",
    "Until next time! I'm always here when you need a confidential space to discuss workplace concerns. Don't hesitate to return whenever you need to - that's exactly what I'm here for. Take care!",
    "Bye for now! It's been good talking with you. Remember that this space is always available when you need to discuss workplace issues confidentially. I hope things improve with the situation we discussed.",
    "Take it easy! Remember you've got support here whenever you need it. Whether you're following up on today's conversation or have something new to discuss, I'll be here ready to help. Have a good one!"
  ],

  small_talk: [
    "I'm doing well, thanks for asking! But I'm much more interested in hearing about you and how I can help. Is there something specific about our workplace system you'd like to discuss today?",
    "That's an interesting question! While I'm designed to focus on workplace concerns and complaints, I'm happy to chat briefly. Is there something specific about the workplace that's been on your mind lately?",
    "I appreciate the casual conversation! I'm primarily here to help with workplace concerns, but a little small talk is always nice. Is there something about work that's been bothering you, or did you just want to say hello?",
    "Thanks for checking in! I'm here and ready to help with any workplace concerns you might have. Was there something specific you wanted to discuss today, or were you just touching base?",
    "I'm always here and ready to help! While my main purpose is assisting with workplace concerns, I enjoy these more relaxed exchanges too. Is there anything about your work experience you'd like to talk about today?"
  ],

  reassurance: [
    "I completely understand those feelings, and they're entirely normal. Many people feel nervous about reporting workplace issues. Please know that our system was specifically designed with these concerns in mind. Your identity is fully protected, and the focus stays solely on addressing the issues, not who reported them. Would it help if I explained more about our security measures?",
    "It's absolutely normal to feel that way. Many people worry about the same thing when using systems like ours for the first time. I want to reassure you that protecting your identity is our absolute priority. No one - not even system administrators - can trace reports back to specific individuals. Does that help ease your concerns a bit?",
    "Your feelings are completely valid. It takes courage to speak up, and feeling nervous about it shows you're taking this seriously. I want you to know that our system was built from the ground up with privacy as the top priority. Your identity remains protected throughout the entire process. Is there something specific about the anonymity that's concerning you?",
    "I hear your concern, and I want you to know it's something many people worry about. Rest assured that our system uses multiple layers of security and anonymization to ensure your identity remains protected. Think of it like dropping an anonymous note that can't be traced back - you're heard, but never exposed. Would knowing more about the technical safeguards help you feel more comfortable?",
    "Those concerns are perfectly reasonable, and I'm glad you're expressing them. Trust is earned, not given. Our system was designed specifically to address these worries - your identity is protected by multiple security measures and is separated completely from the content of your reports. Nothing in our system can link specific complaints back to you personally. Does knowing that provide some peace of mind?"
  ],

  frustration: [
    "I can hear your frustration, and I want you to know it's completely valid. It's difficult when workplace issues go unaddressed. The good news is that by reporting it through this system, you're taking a concrete step toward resolution. Could you tell me more about what's happening? The more details you can share, the better chance we have of addressing it effectively.",
    "I'm sorry to hear you're feeling this way - and you have every right to be frustrated. Workplace problems can be especially difficult because we spend so much of our time there. Would it help to talk through what's been happening? Everything you share remains confidential, and it could be the first step toward improving the situation.",
    "Your frustration comes through clearly, and it sounds like this has been building for a while. Sometimes just expressing these feelings can be a relief. But more importantly, by reporting the issue, you're creating an opportunity for real change. Would you like to share more details about the situation? Your perspective matters, and it could help identify patterns if others are experiencing similar problems.",
    "I can definitely understand why you'd feel that way. Workplace issues can be particularly frustrating because they affect our daily lives so significantly. Thank you for bringing this to my attention instead of just silently dealing with it. Would you be comfortable sharing more specifics about what's been happening? The more context I have, the better I can help address the underlying problems.",
    "That level of frustration is completely understandable, and I appreciate you being candid about it. It sounds like this is something that's been significantly impacting your work experience. I'd like to hear more about the specific situation if you're willing to share. Your report could be what finally brings attention to this issue, especially if others have been experiencing similar problems."
  ],

  confusion: [
    "I see I haven't been clear, and I apologize for that. Let me try to explain differently. [Simplified explanation of the previous point]. Does that make more sense? Please feel free to ask follow-up questions - I'm here to help you understand completely.",
    "I'm sorry for the confusion! Sometimes I don't explain things as clearly as I should. Let me try a different approach. [Restate the information more clearly]. Is that clearer now? I'm happy to keep working on this until we're on the same page.",
    "Thank you for letting me know you're not following - that's helpful feedback. Let me back up and explain more simply. [More direct explanation]. How's that? If you're still unsure about any part, please let me know which aspect is still confusing.",
    "I apologize for not being clear. Let me try again with a more straightforward explanation. [Clearer explanation with examples if possible]. Does that help clarify things? I want to make sure you have all the information you need in a way that's useful to you.",
    "I see I've created some confusion, and I apologize for that. Let me try explaining this another way. [Alternative explanation with different wording]. Is that making more sense now? Please don't hesitate to tell me if any part is still unclear - that's how I learn to communicate better."
  ],

  praise: [
    "Thank you for the kind words! It's really nice to hear that I've been helpful. I'm designed to make this process as comfortable and effective as possible, so your positive feedback means a lot. Is there anything else I can help you with today?",
    "I really appreciate that! It's always good to know when I'm providing the kind of assistance that's actually useful. My goal is to make sure everyone feels heard and supported when reporting workplace concerns. Is there something else you'd like to discuss while we're chatting?",
    "That's very kind of you to say! I'm glad I've been able to help in a way that works for you. Creating a comfortable space where people feel safe sharing workplace concerns is exactly what I'm here for. Can I help with anything else today?",
    "Thank you - that's really nice to hear! I'm designed to make this process as straightforward and supportive as possible, so I'm glad that's been your experience. Is there anything else about our system you'd like to know more about?",
    "I appreciate your positive feedback! It's important to me that people feel comfortable and understood when discussing workplace issues. Your kind words tell me I'm on the right track. Is there anything else I can assist you with today?"
  ],

  personal_question: [
    "I'm an assistant specifically designed to help with the Pseudonymous Control Resolve System. My role is to help you submit anonymous complaints, understand how our system works, and provide updates on issues you've reported - all while keeping your identity completely protected. Is there something specific about the system I can help you with today?",
    "Great question! I'm your anonymous complaint assistant for PCRS. I was designed specifically to help employees report workplace issues without fear of identification. While I'm not a human, I'm programmed to understand workplace concerns and guide you through our reporting process with a conversational approach. How can I help you today?",
    "I'm your digital assistant for the Pseudonymous Control Resolve System - designed to help with anonymous workplace feedback. My purpose is to make the process of reporting concerns as comfortable and efficient as possible, while ensuring your identity remains completely protected. Is there something about work you'd like to discuss or report?",
    "I'm the interface for your organization's anonymous reporting system. I help collect and categorize workplace concerns while maintaining complete anonymity for everyone who reports issues. I was built specifically for confidential communication about workplace matters. Is there something I can help you with regarding workplace concerns?",
    "I'm your anonymous feedback assistant for the PCRS platform. I'm here to help with submitting workplace concerns, checking on previously reported issues, and explaining how our anonymity protections work. Everything we discuss remains confidential, and your identity is always protected. What can I help you with today?"
  ],

  offensive: [
    "I understand you're feeling frustrated, and that's completely valid. Sometimes systems like this can be challenging to work with. Would you mind telling me more specifically what isn't working for you? I'd really like to try to help improve your experience if possible.",
    "I'm sorry you're having a difficult experience. Your feedback is important, even when it's critical. Could you help me understand what specific aspects are causing problems for you? That would help me better address your concerns and potentially improve things.",
    "I hear your frustration coming through clearly. Sometimes it helps to take a step back and approach the issue from a different angle. Would you be willing to share what you're trying to accomplish? I'd like to see if there's another way I can help you achieve that goal.",
    "I appreciate your candid feedback. Even though it's difficult to hear, it helps me understand where improvements are needed. If you're open to it, I'd like to know more about what specific issues you're encountering so I can try to address them more effectively.",
    "I understand this is a frustrating experience for you. Your perspective is valuable, even when it's critical. If you're willing, could you tell me more about what specifically isn't meeting your needs? I genuinely want to try to help resolve the issues you're facing."
  ],

  joke: [
    "While I'm not primarily designed as a comedian, I can share a workplace-friendly joke: Why don't scientists trust atoms? Because they make up everything! Now, is there something about our anonymous reporting system I can help you with today?",
    "I'm more of a workplace assistant than a comedian, but here's a light one: What did the employee say when their boss asked why they were late? 'Traffic was so bad, even the snails were honking!' Speaking of workplace matters, is there something specific I can help you with today?",
    "I'm not programmed with many jokes, but here's one: What do you call a fake noodle? An impasta! Now, while I enjoy the brief humor break, I'm actually here to help with workplace concerns and anonymous reporting. Is there something specific you'd like assistance with today?",
    "I can try a quick one: Why did the computer go to the doctor? Because it had a virus! I'm actually specialized in helping with workplace concerns rather than entertainment, but I'm happy to have a momentary light exchange. Is there something about our reporting system I can help you with?",
    "Here's a short one: What did one wall say to the other wall? 'I'll meet you at the corner!' Now, while I enjoy a brief moment of levity, my primary function is helping with anonymous workplace concerns. Is there something specific about our system I can assist you with today?"
  ],

  other: [
    "I think I understand what you're saying, but I want to make sure I'm getting the full picture. Could you share a bit more about the situation? That would help me provide the most relevant support and guidance.",
    "Thanks for sharing that. To make sure I'm understanding completely, would you mind elaborating a bit more? The more context I have, the better I can help address your specific situation. Everything you share remains confidential.",
    "I appreciate you bringing this up. To help you most effectively, it would be helpful if you could provide a few more details about what you're experiencing. That way, I can tailor my support to your specific situation.",
    "I want to make sure I fully understand your situation so I can provide the most helpful response. Could you share a little more context about what's happening? Remember, all of our conversation remains completely private.",
    "Thank you for sharing that with me. To make sure I'm addressing your concerns properly, could you tell me a bit more about the specific situation you're referring to? The more I understand, the better I can help."
  ]
};

// Special responses for specific scenarios - highly natural, humanized confirmation messages
export const complaintConfirmation = [
  "Thank you for sharing this with me. I know it isn't always easy to speak up about workplace issues. Your report has been securely recorded, and I want to assure you that your identity is completely protected throughout this process. If similar concerns come up from others, it will help establish a pattern that management needs to address - all without revealing who reported what.",
  
  "I appreciate your trust in sharing this situation. Your report has been recorded securely, and your anonymity is absolutely guaranteed. It often helps to talk about these things, and you've done the right thing by bringing it forward. The system will now monitor for similar reports to identify if this is a broader issue that needs addressing.",
  
  "Thank you for having the courage to share this. I've recorded your concern, and I want to reassure you that your identity remains completely anonymous throughout this process. Sometimes just voicing these issues can feel like a weight lifted. If others report similar experiences, it helps establish that this is a pattern requiring attention - all while keeping everyone's identity private.",
  
  "I've captured all the details you've shared, and everything has been recorded securely. Your identity is completely protected - that's a fundamental principle of how our system works. I appreciate you taking the time to report this issue. If others are experiencing similar problems, your report will help identify a pattern that needs addressing, while everyone's privacy remains intact.",
  
  "Thank you for bringing this to my attention. Your report has been securely logged in our system, with your identity fully protected. Sometimes workplace issues can feel isolating, but you've taken an important step by speaking up. If others share similar experiences, the system will recognize the pattern and escalate it appropriately - all while preserving everyone's anonymity.",
  
  "I understand this wasn't easy to share, and I appreciate your trust. Your concern has been recorded securely, and your identity will remain completely anonymous. This kind of feedback is valuable - not just for potentially resolving your specific situation, but also for identifying broader patterns if others are experiencing similar issues. Please know you've done the right thing by speaking up.",
  
  "Thanks for sharing this with me. Your report has been securely recorded, and I want to emphasize that your identity remains completely protected. It's important that you felt comfortable enough to bring this forward. The system will now categorize your concern and look for similar patterns from other reports, which helps address systemic issues while keeping everyone's identity private."
];