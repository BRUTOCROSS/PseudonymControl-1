// This file contains simplified versions of AI functions
// that work without requiring external API keys

// Advanced rule-based complaint categorization with context understanding
export async function categorizeComplaint(text: string): Promise<{
  category: "hr" | "infrastructure" | "management" | "cafeteria" | "security" | "other";
  similarityGroup: string;
}> {
  // Convert text to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Dictionary of topics and their related keywords for more accurate matching
  const topics = {
    // HR related keywords with subcategories
    hr: {
      general: ['hr', 'human resources', 'manager', 'employee', 'colleague', 'staff', 'hiring', 'fired', 'personnel'],
      compensation: ['salary', 'pay', 'wage', 'bonus', 'compensation', 'raise', 'promotion', 'increment', 'paycheck'],
      workEnvironment: ['harassment', 'discrimination', 'hostile', 'bullying', 'unfair', 'treatment', 'favoritism', 'bias'],
      benefits: ['benefits', 'insurance', 'healthcare', 'retirement', 'leave', 'vacation', 'sick day', 'time off', 'pto'],
      career: ['growth', 'opportunity', 'career', 'advancement', 'development', 'training', 'mentor', 'performance review']
    },
    
    // Infrastructure related keywords with subcategories
    infrastructure: {
      general: ['building', 'facility', 'office', 'infrastructure', 'premises', 'workplace'],
      furniture: ['desk', 'chair', 'furniture', 'ergonomic', 'seating', 'workstation', 'table', 'cubicle'],
      equipment: ['equipment', 'computer', 'laptop', 'monitor', 'keyboard', 'mouse', 'phone', 'printer', 'scanner'],
      facilities: ['bathroom', 'restroom', 'elevator', 'stairs', 'parking', 'lobby', 'entrance', 'exit', 'hallway'],
      comfort: ['ac', 'air conditioning', 'heating', 'temperature', 'ventilation', 'air quality', 'lighting', 'noise']
    },
    
    // Management related keywords with subcategories
    management: {
      general: ['management', 'leadership', 'administration', 'executive', 'board', 'supervisor'],
      decisions: ['decision', 'strategy', 'plan', 'direction', 'policy', 'initiative', 'change'],
      communication: ['communication', 'transparency', 'information', 'announcement', 'meeting', 'clarity'],
      hierarchy: ['director', 'ceo', 'cfo', 'cto', 'executive', 'vice president', 'vp', 'chain of command'],
      resources: ['budget', 'resources', 'allocation', 'staffing', 'headcount', 'funding', 'investment', 'cost cutting']
    },
    
    // Cafeteria related keywords with subcategories
    cafeteria: {
      general: ['food', 'cafeteria', 'lunch', 'menu', 'meal', 'canteen', 'dining', 'catering'],
      quality: ['taste', 'quality', 'fresh', 'stale', 'cold', 'hot', 'undercooked', 'overcooked', 'flavor'],
      variety: ['variety', 'option', 'choice', 'selection', 'alternative', 'vegetarian', 'vegan', 'allergy', 'dietary'],
      service: ['service', 'staff', 'server', 'cashier', 'line', 'wait time', 'slow', 'fast', 'efficient'],
      environment: ['cleanliness', 'hygiene', 'clean', 'dirty', 'seating', 'table', 'chair', 'space', 'crowded']
    },
    
    // Security related keywords with subcategories
    security: {
      general: ['security', 'safety', 'protection', 'secure', 'safeguard', 'protocol', 'procedure'],
      threats: ['danger', 'threat', 'risk', 'unsafe', 'hazard', 'emergency', 'alarm', 'warning', 'incident'],
      access: ['lock', 'access', 'card', 'badge', 'key', 'entry', 'exit', 'door', 'gate', 'authorization'],
      monitoring: ['guard', 'camera', 'surveillance', 'monitor', 'patrol', 'watch', 'observe', 'detect'],
      incidents: ['theft', 'stolen', 'missing', 'break-in', 'assault', 'attack', 'injury', 'accident', 'fire']
    },
    
    // Other common workplace topics
    other: {
      workload: ['workload', 'overwork', 'overwhelmed', 'stress', 'pressure', 'deadline', 'burnout', 'overtime'],
      teamwork: ['team', 'collaboration', 'cooperation', 'coordination', 'project', 'group', 'teamwork'],
      technology: ['software', 'system', 'application', 'platform', 'network', 'internet', 'wifi', 'connectivity'],
      remote: ['remote', 'work from home', 'wfh', 'telework', 'virtual', 'zoom', 'teams', 'hybrid'],
      customers: ['customer', 'client', 'user', 'consumer', 'service', 'support', 'satisfaction', 'experience']
    }
  };
  
  // Function to check if text contains any keywords from a list with threshold
  function containsKeywords(text: string, keywords: string[], threshold: number = 1): boolean {
    let count = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        count++;
        if (count >= threshold) return true;
      }
    }
    return false;
  }
  
  // HR category detection with subcategories
  if (containsKeywords(lowerText, [...topics.hr.general, ...topics.hr.workEnvironment], 1)) {
    if (containsKeywords(lowerText, topics.hr.workEnvironment, 1)) {
      return {
        category: 'hr',
        similarityGroup: 'workplace-culture'
      };
    }
    return {
      category: 'hr',
      similarityGroup: 'employee-relations'
    };
  }
  
  if (containsKeywords(lowerText, topics.hr.compensation, 1)) {
    return {
      category: 'hr',
      similarityGroup: 'compensation-benefits'
    };
  }
  
  if (containsKeywords(lowerText, topics.hr.benefits, 1)) {
    return {
      category: 'hr',
      similarityGroup: 'employee-benefits'
    };
  }
  
  if (containsKeywords(lowerText, topics.hr.career, 1)) {
    return {
      category: 'hr',
      similarityGroup: 'career-development'
    };
  }
  
  // Infrastructure category detection with subcategories
  if (containsKeywords(lowerText, [...topics.infrastructure.general, ...topics.infrastructure.furniture], 1)) {
    if (containsKeywords(lowerText, topics.infrastructure.furniture, 1)) {
      return {
        category: 'infrastructure',
        similarityGroup: 'office-furniture'
      };
    }
    return {
      category: 'infrastructure',
      similarityGroup: 'facility-issues'
    };
  }
  
  if (containsKeywords(lowerText, topics.infrastructure.equipment, 1)) {
    return {
      category: 'infrastructure',
      similarityGroup: 'office-equipment'
    };
  }
  
  if (containsKeywords(lowerText, topics.infrastructure.facilities, 1)) {
    return {
      category: 'infrastructure',
      similarityGroup: 'building-facilities'
    };
  }
  
  if (containsKeywords(lowerText, topics.infrastructure.comfort, 1)) {
    return {
      category: 'infrastructure',
      similarityGroup: 'workplace-comfort'
    };
  }
  
  // Management category detection with subcategories
  if (containsKeywords(lowerText, [...topics.management.general, ...topics.management.decisions], 1)) {
    if (containsKeywords(lowerText, topics.management.decisions, 1)) {
      return {
        category: 'management',
        similarityGroup: 'decision-making'
      };
    }
    return {
      category: 'management',
      similarityGroup: 'leadership-issues'
    };
  }
  
  if (containsKeywords(lowerText, topics.management.communication, 1)) {
    return {
      category: 'management',
      similarityGroup: 'communication-transparency'
    };
  }
  
  if (containsKeywords(lowerText, topics.management.resources, 1)) {
    return {
      category: 'management',
      similarityGroup: 'resource-allocation'
    };
  }
  
  // Cafeteria category detection with subcategories
  if (containsKeywords(lowerText, [...topics.cafeteria.general, ...topics.cafeteria.quality], 1)) {
    if (containsKeywords(lowerText, topics.cafeteria.quality, 1)) {
      return {
        category: 'cafeteria',
        similarityGroup: 'food-quality'
      };
    }
    return {
      category: 'cafeteria',
      similarityGroup: 'cafeteria-general'
    };
  }
  
  if (containsKeywords(lowerText, topics.cafeteria.variety, 1)) {
    return {
      category: 'cafeteria',
      similarityGroup: 'menu-options'
    };
  }
  
  if (containsKeywords(lowerText, topics.cafeteria.service, 1)) {
    return {
      category: 'cafeteria',
      similarityGroup: 'cafeteria-service'
    };
  }
  
  if (containsKeywords(lowerText, topics.cafeteria.environment, 1)) {
    return {
      category: 'cafeteria',
      similarityGroup: 'cafeteria-environment'
    };
  }
  
  // Security category detection with subcategories
  if (containsKeywords(lowerText, [...topics.security.general, ...topics.security.threats], 1)) {
    if (containsKeywords(lowerText, topics.security.threats, 1)) {
      return {
        category: 'security',
        similarityGroup: 'safety-threats'
      };
    }
    return {
      category: 'security',
      similarityGroup: 'safety-concerns'
    };
  }
  
  if (containsKeywords(lowerText, topics.security.access, 1)) {
    return {
      category: 'security',
      similarityGroup: 'access-control'
    };
  }
  
  if (containsKeywords(lowerText, topics.security.monitoring, 1)) {
    return {
      category: 'security',
      similarityGroup: 'security-monitoring'
    };
  }
  
  if (containsKeywords(lowerText, topics.security.incidents, 1)) {
    return {
      category: 'security',
      similarityGroup: 'security-incidents'
    };
  }
  
  // Other common workplace topics
  if (containsKeywords(lowerText, topics.other.workload, 1)) {
    return {
      category: 'other',
      similarityGroup: 'workload-stress'
    };
  }
  
  if (containsKeywords(lowerText, topics.other.teamwork, 1)) {
    return {
      category: 'other',
      similarityGroup: 'team-collaboration'
    };
  }
  
  if (containsKeywords(lowerText, topics.other.technology, 1)) {
    return {
      category: 'other',
      similarityGroup: 'technology-issues'
    };
  }
  
  if (containsKeywords(lowerText, topics.other.remote, 1)) {
    return {
      category: 'other',
      similarityGroup: 'remote-work'
    };
  }
  
  if (containsKeywords(lowerText, topics.other.customers, 1)) {
    return {
      category: 'other',
      similarityGroup: 'customer-service'
    };
  }
  
  // If we got here, use a more sophisticated extraction of main topic
  // Count words related to each main category
  const categoryCounts: Record<string, number> = {
    hr: 0,
    infrastructure: 0,
    management: 0,
    cafeteria: 0,
    security: 0,
    other: 0
  };
  
  // Count occurrences of all keywords for each category
  for (const [category, subcategories] of Object.entries(topics)) {
    for (const [, keywords] of Object.entries(subcategories)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          categoryCounts[category]++;
        }
      }
    }
  }
  
  // Find the category with the most matches
  let maxCount = 0;
  let maxCategory: string = 'other';
  
  for (const [category, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxCategory = category;
    }
  }
  
  // If we found a clear category but it wasn't caught in the specific rules
  if (maxCount > 0) {
    return {
      category: maxCategory as any,
      similarityGroup: `${maxCategory}-related`
    };
  }
  
  // Fallback to default category
  return {
    category: 'other',
    similarityGroup: 'general-concerns'
  };
}

// Enhanced chat system with context-aware responses

// Define different types of user queries and intents
import { Intent, intentResponses, complaintConfirmation } from './chatResponses';

// Intent detection patterns with greatly expanded language patterns for more natural recognition
const intentPatterns: Record<Intent, string[]> = {
  greeting: [
    'hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 
    'good evening', 'morning', 'afternoon', 'evening', 'howdy', 'hiya', 
    'yo', "g'day", 'sup', 'bonjour', 'ciao', 'namaste', 'what\'s up', 
    'how are you', 'how\'s it going', 'how have you been', 'nice to see you',
    'pleasure to meet you', 'glad to meet you', 'good to see you'
  ],
  
  help: [
    'help', 'guide', 'assist', 'support', 'how do i', 'how can i', 
    'what can you do', 'what should i do', 'what do i do', 'assist me',
    'i need assistance', 'i need guidance', 'can you guide me', 
    'can you show me', 'can you help', 'need help', 'want help',
    'explain how to', 'explain to me', 'looking for help', 'seeking help',
    'would like help', 'could use some help', 'directions', 'steps to',
    'give me information about', 'tell me how to', 'walk me through',
    'advice', 'advise', 'suggestions', 'tips', 'hint', 'need your advice',
    'need your input', 'need some direction', 'lost and need', 'struggling with',
    'confused about how', 'not sure how', 'assistance with', 'guidance on',
    'direction with', 'can you assist'
  ],
  
  submit_complaint: [
    'complaint', 'issue', 'problem', 'concern', 'report', 'submit', 'file',
    'log a complaint', 'raise an issue', 'bring up a concern', 'flag a problem',
    'document an issue', 'register a complaint', 'make a complaint', 'complain about',
    'inform about a problem', 'notify about an issue', 'bring attention to',
    'highlight a concern', 'escalate an issue', 'need to report', 'want to report',
    'would like to report', 'have to report', 'facing a problem', 'dealing with an issue',
    'struggling with a situation', 'having trouble with', 'concerned about',
    'worried about', 'frustrated with', 'upset about', 'bothered by',
    'not happy with', 'dissatisfied with', 'uncomfortable with',
    'this situation is', 'there is a problem', 'something is wrong',
    'things aren\'t right', 'this isn\'t acceptable', 'this can\'t continue',
    'this has to stop', 'I can\'t tolerate', 'I won\'t stand for'
  ],
  
  question_anonymity: [
    'anonymous', 'anonymity', 'identity', 'private', 'privacy', 'confidential', 
    'secret', 'trace', 'track', 'identify me', 'know who i am', 'find out who',
    'reveal my name', 'keep me anonymous', 'protect my identity', 'keep my details private',
    'how private is', 'level of privacy', 'confidentiality guarantee', 'remain nameless',
    'stay unknown', 'without my name', 'without identifying', 'hidden identity',
    'conceal my identity', 'mask who i am', 'disguise my name', 'keep me incognito',
    'pseudonym', 'anonymous reporting', 'privacy protection', 'identity protection',
    'secrecy', 'discreet', 'under the radar', 'behind the scenes', 'in the shadows',
    'unidentified', 'unnamed', 'will they know', 'can they find out', 'will my boss know',
    'will management know', 'will it be traced', 'can it be traced back', 'will i be exposed',
    'could i be identified', 'risk of identification', 'chance of being found out'
  ],
  
  question_process: [
    'process', 'handled', 'deal', 'work', 'happen', 'procedure', 'protocol', 'steps',
    'workflow', 'system', 'mechanism', 'operation', 'method', 'approach', 'strategy',
    'how does it work', 'how it works', 'what happens next', 'what happens after',
    'what is the procedure', 'what\'s the process', 'walk me through the process',
    'explain the steps', 'describe how it works', 'elaborate on the process',
    'detail the procedure', 'tell me how it goes', 'how are complaints processed',
    'who handles the complaints', 'who deals with reports', 'who receives the complaints',
    'where do complaints go', 'what\'s the workflow', 'steps in the process',
    'stages of handling', 'timeline for processing', 'typical procedure',
    'standard process', 'usual steps', 'how long does it take', 'timeframe for',
    'what to expect', 'what should i expect', 'after submitting', 'once reported',
    'after filing', 'submission process'
  ],
  
  question_threshold: [
    'threshold', 'escalate', 'escalation', 'trigger', 'similar', 'multiple', 'many', 'count',
    'how many complaints', 'how many reports', 'how many issues', 'number of complaints',
    'criteria for escalation', 'when does it escalate', 'what triggers escalation',
    'escalation criteria', 'escalation threshold', 'report threshold', 'complaint count',
    'escalation process', 'tipping point', 'critical mass', 'enough complaints',
    'sufficient reports', 'adequate number', 'volume of complaints', 'quantity of reports',
    'critical number', 'escalation mechanism', 'triggers action', 'leads to action',
    'prompts response', 'forces intervention', 'necessitates attention',
    'warrants action', 'justifies escalation', 'merits intervention',
    'how do you decide', 'what determines', 'when do you act', 'accumulation of',
    'collection of similar', 'gathering of related', 'cluster of issues'
  ],
  
  question_status: [
    'status', 'update', 'progress', 'track', 'follow', 'resolution', 'resolved',
    'what\'s happening with', 'what\'s the status of', 'how\'s my complaint',
    'any progress on', 'updates about', 'developments on', 'news regarding',
    'information about my report', 'where are we with', 'what stage is',
    'current status', 'has anything happened', 'any action taken',
    'any movement on', 'anything being done', 'resolution timeline',
    'when will it be resolved', 'time to resolution', 'resolution date',
    'expect resolution', 'completion timeframe', 'conclusion estimate',
    'finalizing the matter', 'resolving the issue', 'closing the case',
    'follow up on', 'following up about', 'checking on', 'inquiring about',
    'asking about', 'requesting update', 'seeking information'
  ],
  
  feedback: [
    'feedback', 'suggestion', 'improve', 'better', 'enhancement', 'upgrade',
    'recommendation', 'propose', 'propose a change', 'recommend', 'advise',
    'share my thoughts', 'offer my opinion', 'provide input', 'give my take',
    'share my view', 'express my ideas', 'contribute suggestions',
    'constructive criticism', 'positive feedback', 'negative feedback',
    'areas of improvement', 'room for improvement', 'could be better',
    'should be improved', 'needs work', 'could be enhanced',
    'might be upgraded', 'should consider', 'would benefit from',
    'would improve with', 'enhancement opportunity', 'improvement potential',
    'development area', 'growth opportunity', 'optimization suggestion'
  ],
  
  thanks: [
    'thank', 'thanks', 'appreciate', 'grateful', 'much appreciated',
    'thank you', 'thank you so much', 'thanks a lot', 'thanks a ton',
    'really appreciate it', 'appreciate your help', 'grateful for your assistance',
    'thank you for your time', 'thanks for listening', 'thanks for understanding',
    'appreciate your support', 'thanks for being there', 'thank you for explaining',
    'greatly appreciated', 'deeply grateful', 'means a lot', 'that helps',
    'you\'ve been helpful', 'you\'ve been a great help', 'couldn\'t have done it without you',
    'appreciate your guidance', 'value your help', 'thankful for your input'
  ],
  
  goodbye: [
    'bye', 'goodbye', 'see you', 'farewell', 'exit', 'quit', 'close',
    'leaving now', 'have to go', 'talk to you later', 'catch you later',
    'until next time', 'signing off', 'logging off', 'disconnecting',
    'ending chat', 'finishing up', 'wrapping up', 'concluding',
    'that\'s all for now', 'gotta run', 'need to leave', 'time to go',
    'heading out', 'taking off', 'calling it a day', 'bye for now',
    'see you around', 'later', 'adios', 'ciao', 'au revoir', 'cheerio'
  ],
  
  small_talk: [
    'weather', 'weekend', 'vacation', 'holiday', 'sports', 'movie', 'music',
    'tv show', 'book', 'food', 'lunch', 'dinner', 'family', 'kids', 'pet',
    'hobby', 'interest', 'what do you think about', 'how about that',
    'did you see', 'have you heard', 'how\'s your day', 'nice day', 'busy day',
    'rough day', 'crazy day', 'good week', 'bad week', 'plans for',
    'doing anything', 'what\'s new', 'what\'s up', 'how\'s life',
    'how\'s everything', 'how\'s it going', 'how are things', 'how have you been'
  ],
  
  reassurance: [
    'nervous', 'worried', 'scared', 'afraid', 'anxious', 'concerned',
    'unsure', 'hesitant', 'reluctant', 'uncertain', 'doubtful',
    'will i be safe', 'is it safe', 'is it secure', 'can i trust',
    'will it work', 'i hope this works', 'this makes me nervous',
    'i\'m not sure about this', 'not convinced', 'need reassurance',
    'need confidence', 'feeling apprehensive', 'bit worried',
    'slightly concerned', 'what if something goes wrong',
    'what if it backfires', 'fear of reprisal', 'fear of consequences',
    'worried about outcome', 'concerned about results'
  ],
  
  frustration: [
    'frustrated', 'annoyed', 'upset', 'angry', 'mad', 'irritated',
    'infuriated', 'exasperated', 'fed up', 'had enough', 'at my wit\'s end',
    'losing patience', 'tired of this', 'sick of this', 'this is ridiculous',
    'this is absurd', 'this is outrageous', 'unbelievable', 'unacceptable',
    'can\'t believe', 'seriously?', 'are you kidding', 'you\'ve got to be kidding',
    'for real?', 'oh come on', 'give me a break', 'not again', 'still waiting',
    'wasting my time', 'going in circles', 'getting nowhere', 'pointless',
    'makes no sense', 'doesn\'t work', 'isn\'t working', 'failed to'
  ],
  
  confusion: [
    'confused', 'don\'t understand', 'not sure what you mean', 'what do you mean',
    'unclear', 'ambiguous', 'vague', 'lost', 'puzzled', 'perplexed',
    'bewildered', 'baffled', 'not following', 'didn\'t get that',
    'doesn\'t make sense', 'hard to follow', 'i\'m lost', 'you lost me',
    'come again?', 'run that by me again', 'could you clarify',
    'could you explain', 'need clarification', 'what exactly',
    'in simpler terms', 'in plain english', 'explain like i\'m five',
    'too complicated', 'too complex', 'i don\'t get it', 'i\'m confused'
  ],
  
  praise: [
    'great', 'awesome', 'amazing', 'excellent', 'fantastic', 'wonderful',
    'brilliant', 'outstanding', 'exceptional', 'impressive', 'remarkable',
    'superb', 'terrific', 'phenomenal', 'magnificent', 'splendid',
    'love it', 'love what you\'re doing', 'love this system',
    'really good', 'very good', 'extremely good', 'quite good',
    'well done', 'good job', 'nice work', 'that\'s perfect',
    'that\'s exactly what i needed', 'that\'s exactly right',
    'you\'re very helpful', 'you\'re so helpful', 'couldn\'t ask for better',
    'impressive system', 'clever design', 'smart approach'
  ],
  
  personal_question: [
    'who are you', 'what are you', 'are you human', 'are you a bot',
    'are you ai', 'are you real', 'your name', 'what\'s your name',
    'where are you', 'where are you from', 'what do you do',
    'your job', 'your role', 'your purpose', 'how old are you',
    'your age', 'your creator', 'who made you', 'who designed you',
    'your experience', 'your background', 'your education',
    'how long have you', 'how many', 'tell me about yourself',
    'about yourself', 'your interests', 'your hobbies',
    'do you like', 'do you enjoy', 'your favorite'
  ],
  
  offensive: [
    'stupid', 'idiot', 'dumb', 'useless', 'waste of time',
    'terrible', 'horrible', 'awful', 'pathetic', 'incompetent',
    'worthless', 'garbage', 'trash', 'junk', 'bullshit',
    'don\'t work', 'doesn\'t work', 'never works', 'always fails',
    'ridiculous', 'joke', 'laughable', 'embarrassing', 'shameful',
    'disgraceful', 'hate this', 'hate you', 'despise', 'loathe',
    'can\'t stand', 'worst', 'sucks', 'lame', 'disgrace'
  ],
  
  joke: [
    'joke', 'funny', 'humor', 'laugh', 'hilarious', 'amuse',
    'entertain', 'tell me a joke', 'know any jokes',
    'make me laugh', 'say something funny', 'humorous',
    'witty', 'comedic', 'lighten the mood', 'lighten up',
    'cheer me up', 'amusing story', 'heard the one about'
  ],
  
  other: []
};

// This file is deprecated - Please use openai-enhanced.ts instead
// Import the enhanced chat system
import { Intent, intentResponses, complaintConfirmation } from './chatResponses';

// This file is kept for historical reference only
// All new improvements and features should go into openai-enhanced.ts

// Advanced function to detect user intent with better context understanding
function detectIntent(message: string): Intent {
  const lowerMessage = message.toLowerCase();
  
  // Expanded patterns with more contextual understanding
  // Enhanced regex patterns for more precise intent matching with natural language variations
  const contextPatterns = {
    greeting: [
      /^(hi|hello|hey|greetings|howdy|hiya|yo|sup|bonjour|ciao|namaste|morning|afternoon|evening)/i,  // Messages that start with greetings
      /^good (morning|afternoon|evening|day)/i,
      /^(what's|whats) up/i,
      /^how('s| is| are) (you|it going|things|your day)/i,
      /^nice to (see|meet|talk to) you/i
    ],
    
    help: [
      /how (can|do|could|would|might|should) (i|you|we|one)/i,  // Questions about capabilities
      /what (can|could|should|do|does|would) (i|you|we|one)/i,
      /(show|guide|tell|walk|help) me/i,
      /^(can|could) you (help|assist|guide|show|tell|explain)/i,
      /^(i|we) need (help|assistance|guidance|support|advice)/i,
      /^(help|assist|support|guide) (me|us)/i,
      /^(looking|searching) for help/i,
      /^(not sure|don't know) (how|what) to do/i
    ],
    
    submit_complaint: [
      // Phrases indicating desire to submit a complaint with natural variations
      /I (want|need|would like|have|wish) to (report|submit|file|log|register|make|raise)/i,
      /I('m| am) (having|experiencing|facing|dealing with) (an issue|a problem|a concern|a complaint|difficulties|trouble|difficulties)/i,
      /I have (an issue|a problem|a concern|a complaint|something|a matter|a situation)/i,
      /There('s| is) (an issue|a problem|a concern|a situation|something|a matter)/i,
      /(I'd|I would) like to (report|discuss|talk about|mention|bring up) (an issue|a problem|a concern)/i,
      /I need to (tell|talk|speak) (to someone|about something)/i,
      /I('m| am) (unhappy|dissatisfied|upset|concerned|worried|troubled) (about|with|because of)/i,
      /I don't (like|appreciate|agree with|want) (how|what|the way)/i,
      /Something (is wrong|isn't right|doesn't feel right|bothers me)/i,
      /This (is|isn't|hasn't been|wasn't) (acceptable|okay|appropriate|right|good)/i
    ],
    
    question_anonymity: [
      /how (anonymous|private|confidential|secret) (is|are|will) (this|it|my|the|these|reports|complaints)/i,
      /(can|will|could) (anyone|someone|they|management|my boss|others) (know|find out|discover|see|trace|track) (who|that|it was|it's|that it's) (me|I|my)/i,
      /is (my (identity|name|information|report|complaint)|this|it) (really|truly|actually|completely|totally|fully) (anonymous|private|confidential|secret)/i,
      /how do you (protect|secure|guarantee|ensure|maintain) (my (identity|privacy|anonymity|confidentiality)|anonymity|privacy|confidentiality)/i,
      /(what|which) (privacy|security|confidentiality|anonymity) (measures|protections|guarantees|safeguards) (are there|do you have|are in place)/i,
      /will (my name|my identity|who I am|my details|my information) be (revealed|exposed|shown|visible|known|disclosed)/i
    ],
    
    question_process: [
      /how (does|do|will) (this|it|the system|the process|the complaint|the report|the mechanism) (work|function|operate|proceed|go)/i,
      /what (happens|will happen|occurs|will occur) (after|when|once|if) (I|someone) (submit|submits|file|files|send|sends|report|reports)/i,
      /(can|could) you (explain|describe|outline|detail|walk me through) (the|your|this|that) (process|procedure|system|mechanism|workflow|approach)/i,
      /what (are|is) the (steps|process|procedure|protocol|stages|phases) (for|of|in|to)/i,
      /who (handles|manages|deals with|processes|receives|reviews) (the|these|my|our) (complaints|reports|issues|concerns)/i
    ],
    
    question_threshold: [
      /how (many|much|often) (complaints|reports|issues|concerns|problems) (do you need|are needed|does it take|are required|are necessary)/i,
      /what('s| is) the (threshold|criteria|limit|number|count|quantity) (for|to|before|needed for)/i,
      /when (do|does|will) (it|this|the system|a complaint|an issue) (escalate|trigger|get elevated|get raised|move up)/i,
      /what (triggers|causes|prompts|leads to|results in) (escalation|elevation|raising|management attention)/i
    ],
    
    question_status: [
      /what('s| is) (the|happening with|going on with) (status|progress|update|state|situation) (of|with|regarding|concerning|about)/i,
      /(any|are there|have there been) (updates|progress|developments|news|changes|movement) (on|about|regarding|concerning|with|to)/i,
      /has (anything|something|my complaint|my report|my issue|this matter) (happened|progressed|changed|moved forward|been addressed|been resolved)/i,
      /when (will|can|could|might|should) (this|it|my complaint|my report|my issue|the problem) (be resolved|be addressed|be fixed|be handled|end|complete)/i
    ],
    
    feedback: [
      /I (have|would like to give|want to share|want to offer|would like to provide) (feedback|thoughts|suggestions|ideas|comments|input)/i,
      /could (this|it|the system|the process|the platform) be (improved|better|enhanced|upgraded|optimized)/i,
      /it would be (better|nice|helpful|useful|great) if you (could|would)/i,
      /I (think|believe|feel) (this|it|the system|the process|the platform) (needs|could use|should have|would benefit from)/i,
      /have you (considered|thought about|tried|looked into)/i
    ],
    
    thanks: [
      /^(thank you|thanks|thank you so much|thanks a lot|thanks a bunch|many thanks)/i,
      /^I (appreciate|am grateful for) (that|this|it|your help|your assistance|your time|your support)/i,
      /^(that|this|it) (helps|was helpful|is helpful|was useful|is useful)/i,
      /^you('ve| have) been (helpful|great|fantastic|wonderful|excellent|amazing)/i
    ],
    
    goodbye: [
      /^(bye|goodbye|farewell|see you|talk to you later|catch you later|until next time)/i,
      /^(I('m| am) (leaving|going|heading out|signing off|done))/i,
      /^(have to|need to|going to|got to) (go|leave|run|head out)/i,
      /^(that's|that is) (all|it|everything) (for now|for today)/i
    ],
    
    small_talk: [
      /how('s| is) (the weather|your day|your week|your weekend|your family)/i,
      /what (are you|are your) (doing|plans|thinking)/i,
      /did you (see|watch|hear about|know about)/i,
      /have you (heard|seen|watched|been to|visited|tried)/i,
      /I (like|love|enjoy|prefer) (movies|books|music|sports|food|traveling|reading|watching)/i
    ],
    
    reassurance: [
      /^(I('m| am)|I feel) (nervous|worried|scared|afraid|anxious|concerned|unsure|hesitant)/i,
      /^(is|will) (it|this|that|my report|my complaint) (safe|secure|okay|alright|protected)/i,
      /^(can|could|should|will) I (trust|believe|rely on|depend on|count on)/i,
      /^what if (they|someone|my boss|management|colleagues|coworkers) (finds out|discovers|learns|realizes|knows)/i,
      /^I('m| am) (not sure|not confident|not convinced|doubtful) (about|that|if)/i
    ],
    
    frustration: [
      /^(this is|that's|that is) (frustrating|annoying|ridiculous|absurd|outrageous|unbelievable|unacceptable)/i,
      /^I('m| am) (frustrated|annoyed|upset|angry|mad|irritated|fed up|tired of|sick of)/i,
      /^(I can't|I cannot) (believe|understand|accept|tolerate|stand|take)/i,
      /^(seriously|are you kidding|you've got to be kidding|for real|come on|give me a break)/i,
      /^(this|that|it) (doesn't|isn't|won't|can't) (work|make sense|help|function|operate)/i
    ],
    
    confusion: [
      /^I (don't|do not|didn't|did not) (understand|get|follow|comprehend)/i,
      /^(what|which|how) (do you|does that|does this) (mean|imply|suggest|indicate)/i,
      /^I('m| am) (confused|lost|puzzled|perplexed|bewildered|baffled)/i,
      /^(could|can|would) you (clarify|explain|elaborate|specify|simplify)/i,
      /^(that|this|it) (doesn't|isn't) (clear|obvious|straightforward|making sense)/i,
      /^(I need|I'd like|I would like) (clarification|explanation|elaboration|more details|more information)/i
    ],
    
    praise: [
      /^(that's|that is|this is) (great|awesome|amazing|excellent|fantastic|wonderful|brilliant|perfect)/i,
      /^I (love|really like|appreciate|admire) (that|this|it|what you|how you)/i,
      /^(well done|good job|nice work|excellent work|great work|fantastic job)/i,
      /^you('re| are) (very|really|incredibly|extremely|amazingly) (helpful|good|great|excellent|efficient)/i
    ],
    
    personal_question: [
      /^(who|what) are you/i,
      /^are you (human|real|a person|a bot|an AI|a chatbot|a program)/i,
      /^what('s| is) your (name|job|role|purpose|function|goal)/i,
      /^where are you (from|located|based)/i,
      /^(how long|how many|when|why) (have you|did you|are you|were you)/i,
      /^(tell|talk to) me about (yourself|your background|your experience|your training)/i,
      /^do you (like|enjoy|prefer|have|want)/i
    ],
    
    offensive: [
      /^(this|that|it|you) (is|are) (stupid|dumb|useless|terrible|horrible|awful|pathetic|worthless)/i,
      /^(this|that|it) (doesn't|won't|can't|never) (work|helps|function|operates|succeeds)/i,
      /^I (hate|despise|can't stand|loathe) (this|that|it|you)/i,
      /^(waste of|complete waste of) (time|effort|energy)/i,
      /^(this|that|it) (sucks|is garbage|is trash|is junk|is crap)/i
    ],
    
    joke: [
      /^(tell|say|give) me a joke/i,
      /^(do you know|know) any jokes/i,
      /^(make|get) me (laugh|smile)/i,
      /^(say|tell me) something funny/i,
      /^I need (a laugh|something funny|some humor|to laugh)/i
    ],
    
    question_anonymity: [
      /how (do you|does this|is my) .* anonym/i,  // Questions about anonymity mechanics
      /can.*(trace|track|identify)/i,  // Questions about traceability
      /who (can|will) (see|know)/i,  // Questions about visibility
      /is.*(private|confidential)/i  // Questions about privacy
    ]
  };
  
  // Check for complaint submission - longer messages with specific keywords and context
  if (message.length > 50) {
    // Check for contextual complaint submission indicators
    if (lowerMessage.includes('complaint') || 
        lowerMessage.includes('issue') || 
        lowerMessage.includes('problem') || 
        lowerMessage.includes('concern') ||
        lowerMessage.includes('report') ||
        lowerMessage.includes('unhappy') ||
        lowerMessage.includes('dissatisfied') ||
        lowerMessage.includes('upset') ||
        lowerMessage.includes('frustrated') ||
        lowerMessage.includes('disappointed')) {
      
      return 'submit_complaint';
    }
  }
  
  // Check for contextual patterns using regular expressions for better intent matching
  for (const [intent, regexPatterns] of Object.entries(contextPatterns)) {
    for (const pattern of regexPatterns) {
      if (pattern.test(lowerMessage)) {
        return intent as Intent;
      }
    }
  }
  
  // If no match with regex patterns, fallback to keyword matching
  // Check each intent pattern for matches, with scoring for multiple keyword matches
  const intentScores: Record<string, number> = {};
  
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    intentScores[intent] = 0;
    for (const pattern of patterns) {
      if (lowerMessage.includes(pattern)) {
        intentScores[intent]++;
        
        // Boost score for exact matches or matches at the beginning
        if (lowerMessage === pattern || lowerMessage.startsWith(pattern + ' ')) {
          intentScores[intent] += 2;
        }
      }
    }
  }
  
  // Find the intent with the highest score
  let maxScore = 0;
  let maxIntent: Intent = 'other';
  
  for (const [intent, score] of Object.entries(intentScores)) {
    if (score > maxScore) {
      maxScore = score;
      maxIntent = intent as Intent;
    }
  }
  
  // If we have a clear winner with a score > 0
  if (maxScore > 0) {
    return maxIntent;
  }
  
  // Handle special cases that might not match patterns
  if (message.length < 10) {
    // Very short messages like "hi" or "thanks" that might not match patterns
    if (/^(hi|hey|hello|thx|ty)$/i.test(lowerMessage)) {
      return 'greeting';
    }
    if (/^(thanks|thank you|thx|ty)$/i.test(lowerMessage)) {
      return 'thanks';
    }
    if (/^(bye|goodbye|cya|later)$/i.test(lowerMessage)) {
      return 'goodbye';
    }
  }
  
  // Default to 'other' if no specific intent is detected
  return 'other';
}

// Function to get random response based on intent
function getResponseForIntent(intent: Intent): string {
  const responses = intentResponses[intent];
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}

// Check if a message is likely a complaint submission
function isComplaintSubmission(message: string): boolean {
  return message.length > 80 && (
    detectIntent(message) === 'submit_complaint' || 
    detectIntent(message) === 'other'
  );
}

// Advanced chat assistant that provides context-aware responses with natural human-like conversation flow
export async function getChatResponse(userMessage: string, chatHistory: Array<{role: string, content: string}>): Promise<string> {
  // For complaint submissions, provide a confirmation response
  if (isComplaintSubmission(userMessage)) {
    const randomIndex = Math.floor(Math.random() * complaintConfirmation.length);
    return complaintConfirmation[randomIndex];
  }
  
  // Get the current intent
  const currentIntent = detectIntent(userMessage);
  
  // Look at recent message history for context (up to 6 recent messages)
  const recentHistory = chatHistory.slice(-6);
  const conversationContext = analyzeConversationContext(recentHistory);
  
  // Get assistant's last message if it exists
  let lastAssistantMessage = "";
  for (let i = recentHistory.length - 1; i >= 0; i--) {
    if (recentHistory[i].role === "assistant") {
      lastAssistantMessage = recentHistory[i].content;
      break;
    }
  }
  
  // Handle follow-up questions with more natural conversation flow
  if (conversationContext.followUpQuestion && currentIntent === 'other') {
    // This seems like a follow-up to a previous topic
    if (conversationContext.lastIntent === 'question_anonymity') {
      // Add reference to the previous conversation about anonymity
      return "To elaborate on the anonymity protection we just discussed - our system is designed with multiple safeguards to ensure your identity remains completely protected. Your reports can never be traced back to you personally. Does that help clarify things?";
    } else if (conversationContext.lastIntent === 'question_process') {
      // Add natural follow-up about the process
      return "Regarding the process we were discussing - one thing I didn't mention is that you'll receive updates on the status of your reports through your secure dashboard. This lets you track progress while maintaining your anonymity. Is there something specific about the process you'd like me to explain in more detail?";
    } else if (conversationContext.lastIntent === 'question_threshold') {
      // Add deeper context about thresholds
      return "About those thresholds we were discussing - they're actually customized for each organization based on size and reporting patterns. This ensures that even in smaller teams, important issues don't get overlooked. Does that additional context help with your question?";
    } else if (conversationContext.lastIntent === 'submit_complaint') {
      // Personalized follow-up after complaint submission
      return "I see you have more to share about your situation. Please feel free to add any additional details that might help provide context. Everything we discuss remains completely confidential, and adding specific information often helps when addressing the underlying issues.";
    }
  }
  
  // Handle sequential interactions more naturally
  if (userMessage.length < 15 && currentIntent === 'other') {
    // Short, ambiguous responses often need contextual handling
    
    // If the last assistant message asked a question, this might be an answer
    if (lastAssistantMessage.endsWith("?")) {
      // Detect likely yes/no/maybe responses
      if (/\b(yes|yeah|yep|sure|ok|okay|fine|definitely|absolutely)\b/i.test(userMessage)) {
        return "Great! I'm glad that helps. Is there anything else specific about our system you'd like to know more about?";
      } else if (/\b(no|nope|not really|not at all)\b/i.test(userMessage)) {
        return "I understand. If you have any other questions or concerns you'd like to discuss, I'm here to help. What else can I assist you with today?";
      } else if (/\b(maybe|perhaps|not sure|kind of|somewhat)\b/i.test(userMessage)) {
        return "I understand you're not completely sure. Would it help if I explained things from a different perspective, or is there something else you'd prefer to discuss?";
      }
    }
  }
  
  // Enhanced handling of repeated questions or topics - provide more detailed and varied answers
  if (conversationContext.repeatCount > 1 && conversationContext.lastIntent === currentIntent) {
    // First check if we've already given a detailed response
    let hasGivenDetailed = false;
    const assistantMessages = recentHistory.filter(msg => msg.role === "assistant").map(msg => msg.content);
    
    // Look for signs that we've already provided a detailed response
    if (assistantMessages.some(msg => 
        msg.includes("step-by-step") || 
        msg.includes("multiple layers") || 
        msg.includes("in more detail") || 
        msg.length > 300)) {
      hasGivenDetailed = true;
    }
    
    if (hasGivenDetailed) {
      // We've already given a detailed answer, so offer to address a specific aspect
      return `I notice we're discussing ${currentIntent.replace('question_', '')} again. Is there a specific aspect of this topic you'd like me to clarify further? Sometimes it helps to focus on one particular element that might still be unclear.`;
    } else {
      // First time needing more detail - provide comprehensive answer
      return getDetailedResponse(currentIntent);
    }
  }
  
  // Improved conversation continuity with more natural transitions
  if (conversationContext.lastIntent === 'greeting' && currentIntent === 'other') {
    // After greeting, user said something general - respond with helpful guidance
    return "It's nice to connect with you! I'm here to help with any workplace concerns you might have. You can submit a confidential complaint, ask about how our anonymity system works, or check on previous reports you've made. What would be most helpful for you right now?";
  }
  
  // After thanks, provide a natural continuation
  if (conversationContext.lastIntent === 'thanks' && currentIntent === 'other') {
    return "You're welcome! While we're chatting, is there anything else about our anonymous reporting system I can help you understand? Many people ask about how we protect identity or how the escalation process works.";
  }
  
  // Adapt to conversation shifts more naturally
  if (conversationContext.lastIntent !== currentIntent && 
      conversationContext.lastIntent !== 'other' && 
      currentIntent !== 'other') {
    // User has shifted topics - acknowledge the shift
    return `I see you're asking about ${currentIntent.replace('question_', '')} now. ${getResponseForIntent(currentIntent)}`;
  }
  
  // Personalized response based on user's communication style
  if (conversationContext.userStyle === 'formal') {
    return getFormalResponse(currentIntent);
  } else if (conversationContext.userStyle === 'casual') {
    return getCasualResponse(currentIntent);
  }
  
  // Default: detect intent and provide appropriate response
  return getResponseForIntent(currentIntent);
}

// Analyze the conversation context to improve responses
function analyzeConversationContext(recentHistory: Array<{role: string, content: string}>): {
  lastIntent: Intent;
  repeatCount: number;
  followUpQuestion: boolean;
  userStyle: 'formal' | 'casual' | 'neutral';
} {
  // Default context
  const context = {
    lastIntent: 'other' as Intent,
    repeatCount: 0,
    followUpQuestion: false,
    userStyle: 'neutral' as 'formal' | 'casual' | 'neutral'
  };
  
  // Extract user messages
  const userMessages = recentHistory
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content);
  
  if (userMessages.length === 0) return context;
  
  // Determine the last intent (excluding the current message)
  if (userMessages.length > 1) {
    context.lastIntent = detectIntent(userMessages[userMessages.length - 2]);
  }
  
  // Count repeats of the same intent
  const currentIntent = detectIntent(userMessages[userMessages.length - 1]);
  let repeatCount = 0;
  
  for (let i = userMessages.length - 1; i >= 0; i--) {
    const msgIntent = detectIntent(userMessages[i]);
    if (msgIntent === currentIntent) {
      repeatCount++;
    } else {
      break;
    }
  }
  context.repeatCount = repeatCount;
  
  // Detect if this is likely a follow-up question
  if (userMessages.length > 1) {
    const lastMessage = userMessages[userMessages.length - 1];
    // Check if message is short and doesn't have clear intent
    if (lastMessage.length < 50 && currentIntent === 'other') {
      // Check if it contains question words or is phrased as a question
      if (lastMessage.match(/\b(what|how|why|when|where|who|can|could|would|will|is|are)\b/i) || 
          lastMessage.endsWith('?')) {
        context.followUpQuestion = true;
      }
    }
  }
  
  // Analyze user's conversation style
  let formalMarkers = 0;
  let casualMarkers = 0;
  
  userMessages.forEach(msg => {
    // Formal style markers
    if (msg.match(/\b(would you|could you|please|kindly|appreciate|regard|should you|thank you)\b/i)) {
      formalMarkers++;
    }
    
    // Check for complete sentences and punctuation (formal)
    if (msg.match(/^[A-Z].*[.!?]$/)) {
      formalMarkers++;
    }
    
    // Casual style markers
    if (msg.match(/\b(hey|hi there|thanks|cool|awesome|yeah|ok|yep|nope|sure|lol|haha)\b/i)) {
      casualMarkers++;
    }
    
    // Check for abbreviations, contractions, slang (casual)
    if (msg.match(/\b(u|r|ur|btw|thx|gonna|wanna|kinda|sorta)\b/i)) {
      casualMarkers += 2;
    }
    
    // Check for common emoji representations
    if (msg.includes(':)') || msg.includes(':-)') || msg.includes(':D') || 
        msg.includes(';)') || msg.includes('<3') || msg.includes('XD') || 
        msg.includes('=)') || msg.includes('^^') || 
        msg.includes('⭐') || msg.includes('🙂')) {
      casualMarkers += 2;
    }
  });
  
  // Determine overall style
  if (formalMarkers > casualMarkers + 2) {
    context.userStyle = 'formal';
  } else if (casualMarkers > formalMarkers + 1) {
    context.userStyle = 'casual';
  } else {
    context.userStyle = 'neutral';
  }
  
  return context;
}

// Provide more detailed responses for repeated questions
function getDetailedResponse(intent: Intent): string {
  switch (intent) {
    case 'question_anonymity':
      return "Let me explain our anonymity system in more detail. We use multiple layers of protection: 1) Your real identity is replaced with a pseudonym that can't be traced back to you, 2) All identifying details in your reports are automatically filtered out, 3) When complaints reach a threshold for escalation, they're presented as a group pattern rather than individual reports, and 4) Our database encryption ensures even system administrators can't connect reports to specific users. Does this address your concerns about anonymity?";
    
    case 'question_process':
      return "Here's a step-by-step breakdown of our process: First, your complaint is submitted and encrypted with your pseudonym (not your real identity). Next, our advanced categorization system analyzes the content and places it in the appropriate category and similarity group. The system then checks if similar complaints have been reported. If the number of similar complaints reaches the threshold for that category, the issue is escalated to management as a pattern, not as individual reports. Throughout this process, your identity remains completely protected. Management only sees that multiple employees have reported a similar issue, which helps address systemic problems without exposing any individual.";
    
    case 'question_threshold':
      return "Our threshold system works on multiple levels: For high-priority concerns like safety issues or harassment, the threshold is very low - sometimes just 2-3 similar reports will trigger escalation. For moderate concerns like facility issues, the threshold might be 5-7 reports. For lower-priority items, it might take 8-10 similar reports. The system also considers the timeframe - multiple reports in a short period are escalated faster than the same number spread over months. This balanced approach ensures serious issues get attention quickly while still protecting everyone's anonymity. The exact thresholds are regularly adjusted based on organizational needs and patterns.";
    
    default:
      // Fall back to regular response if we don't have a detailed version
      return getResponseForIntent(intent);
  }
}

// Provide more formal responses for users with a formal communication style
function getFormalResponse(intent: Intent): string {
  switch (intent) {
    case 'greeting':
      return "Good day. I'm pleased to assist you with the Pseudonymous Control Resolve System. How may I be of service to you today?";
    
    case 'help':
      return "I would be happy to provide assistance. The system offers several functions, including anonymous complaint submission, status tracking, and information on our processes. Please let me know which area you require guidance with.";
      
    case 'question_anonymity':
      return "Regarding anonymity, I can assure you that our system employs robust pseudonymization protocols. Your identity is protected through multiple security layers, ensuring that submissions cannot be traced back to individual employees.";
    
    default:
      // Fall back to regular response if we don't have a formal version
      return getResponseForIntent(intent);
  }
}

// Provide more casual responses for users with a casual communication style
function getCasualResponse(intent: Intent): string {
  switch (intent) {
    case 'greeting':
      return "Hey there! 👋 What's up? I'm your PCRS buddy here to help out!";
    
    case 'help':
      return "No worries, I got you! Need to vent about work stuff? Want to know how I keep your identity secret? Or just curious how things work around here? I'm all ears!";
      
    case 'question_anonymity':
      return "Your secret's totally safe with me! 🤐 Think of it like having an invisible cloak - you can say what you need to say, and no one will ever know it was you. Pretty cool, right?";
    
    default:
      // Fall back to regular response if we don't have a casual version
      return getResponseForIntent(intent);
  }
}

// Advanced text similarity for complaint analysis with improved context understanding
export async function analyzeSimilarComplaints(newComplaint: string, existingComplaints: string[]): Promise<number[]> {
  if (existingComplaints.length === 0) return [];
  
  const similarIndices: number[] = [];
  
  // Preprocess the new complaint
  const processedNewComplaint = preprocessText(newComplaint);
  const newWords = extractKeywords(processedNewComplaint);
  
  // Get category of new complaint for improved matching
  const { category, similarityGroup } = await categorizeComplaint(newComplaint);
  
  // For each existing complaint, analyze similarity
  for (let i = 0; i < existingComplaints.length; i++) {
    const complaint = existingComplaints[i];
    
    // Higher similarity score for complaints in the same category/group
    let similarityBoost = 0;
    
    // Get category of existing complaint
    const existingCategory = await categorizeComplaint(complaint);
    if (existingCategory.category === category) {
      similarityBoost += 0.2; // Boost for same category
      
      if (existingCategory.similarityGroup === similarityGroup) {
        similarityBoost += 0.1; // Additional boost for same similarity group
      }
    }
    
    // Process the existing complaint
    const processedComplaint = preprocessText(complaint);
    const complaintKeywords = extractKeywords(processedComplaint);
    
    // Calculate similarity based on overlap
    const newWordsArray = Array.from(newWords);
    const complaintKeywordsArray = Array.from(complaintKeywords);
    
    const commonKeywords = newWordsArray.filter(x => complaintKeywords.has(x));
    const unionKeywords = [...newWordsArray, ...complaintKeywordsArray.filter(x => !newWords.has(x))];
    
    let similarityScore = commonKeywords.length / unionKeywords.length;
    
    // Apply the category/group boost
    similarityScore += similarityBoost;
    
    // Add keyword-based scoring
    similarityScore += calculateKeywordImportanceScore(newWords, complaintKeywords);
    
    // Consider similar if score is above threshold
    if (similarityScore > 0.25) { // Lower threshold with the enhanced algorithm
      similarIndices.push(i);
    }
  }
  
  return similarIndices;
}

// Text preprocessing to improve matching quality
function preprocessText(text: string): string {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .trim();
}

// Extract significant keywords from text
function extractKeywords(text: string): Set<string> {
  // Common words to exclude (stopwords)
  const stopwords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall',
    'should', 'can', 'could', 'may', 'might', 'must', 'this', 'that', 'these',
    'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us',
    'them', 'my', 'your', 'his', 'its', 'our', 'their', 'mine', 'yours', 'hers',
    'ours', 'theirs', 'who', 'whom', 'whose', 'which', 'what', 'where', 'when',
    'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
    'very', 'just', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against',
    'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'to', 'from', 'up', 'down', 'of', 'off', 'over', 'under', 'again', 'further',
    'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how'
  ]);
  
  // Get all words (excluding stopwords and requiring minimum length)
  const words = text.split(/\s+/)
    .filter(word => !stopwords.has(word) && word.length > 3);
  
  // Count word frequencies to identify key terms
  const wordCounts: Record<string, number> = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Get unique significant words (filtering out low frequency if we have many words)
  const keywords = new Set<string>();
  const entries = Object.entries(wordCounts);
  
  // If we have many words, only keep those that appear multiple times or seem significant
  if (entries.length > 20) {
    entries.forEach(([word, count]) => {
      // Include words that appear multiple times or contain important substrings
      if (count > 1 || isSignificantWord(word)) {
        keywords.add(word);
      }
    });
  } else {
    // For shorter texts, include all words
    entries.forEach(([word]) => keywords.add(word));
  }
  
  return keywords;
}

// Check if a word seems significant based on common complaint-related terms
function isSignificantWord(word: string): boolean {
  const significantTerms = [
    'problem', 'issue', 'concern', 'complaint', 'broken', 'failed', 'error',
    'wrong', 'bad', 'poor', 'terrible', 'horrible', 'awful', 'unacceptable',
    'disappointed', 'frustrat', 'annoy', 'upset', 'angry', 'furious',
    'management', 'supervisor', 'manager', 'boss', 'colleague', 'coworker',
    'harassment', 'discriminat', 'unfair', 'bias', 'inappropriate',
    'salary', 'payment', 'money', 'wage', 'compensation', 'benefit',
    'office', 'building', 'facility', 'equipment', 'software', 'hardware',
    'security', 'safety', 'danger', 'threat', 'risk', 'hazard',
    'cafeteria', 'food', 'meal', 'lunch', 'quality', 'service'
  ];
  
  return significantTerms.some(term => word.includes(term));
}

// Calculate additional similarity score based on shared important keywords
function calculateKeywordImportanceScore(set1: Set<string>, set2: Set<string>): number {
  let score = 0;
  const importantKeywords = [
    'problem', 'issue', 'broken', 'error', 'wrong', 'bad', 'poor',
    'disappointed', 'frustrat', 'manager', 'supervisor', 'harassment', 
    'discriminat', 'unfair', 'bias', 'salary', 'payment', 'security', 
    'safety', 'danger', 'threat'
  ];
  
  // Helper function to check if a set contains any word that includes the keyword
  function setHasKeyword(setToCheck: Set<string>, keyword: string): boolean {
    // Use a for...of loop manually since we can't use Set.prototype directly for iteration
    let result = false;
    // Convert to a regular array to avoid Set iteration issues
    const wordsArray: string[] = [];
    setToCheck.forEach(word => wordsArray.push(word.toLowerCase()));
    
    for (let i = 0; i < wordsArray.length; i++) {
      if (wordsArray[i].includes(keyword)) {
        result = true;
        break;
      }
    }
    return result;
  }
  
  // Check for important keywords
  for (let i = 0; i < importantKeywords.length; i++) {
    const keyword = importantKeywords[i];
    const set1HasKeyword = setHasKeyword(set1, keyword);
    const set2HasKeyword = setHasKeyword(set2, keyword);
    
    if (set1HasKeyword && set2HasKeyword) {
      score += 0.05; // Boost score for each shared important keyword
    }
  }
  
  return score;
}