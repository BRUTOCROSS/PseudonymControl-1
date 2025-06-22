import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ComplaintCategorization {
  category: "hr" | "infrastructure" | "management" | "cafeteria" | "security" | "other";
  similarityGroup: string;
  confidence?: number;
}

export async function categorizeComplaint(text: string): Promise<ComplaintCategorization> {
  try {
    const systemPrompt = `You are a workplace complaint categorization expert. 
Analyze the complaint text and categorize it into one of these categories:
- hr: Human resources issues (harassment, discrimination, benefits, compensation, workplace culture)
- infrastructure: Building, equipment, furniture, facilities issues  
- management: Leadership, decision-making, communication, resource allocation issues
- cafeteria: Food quality, service, cleanliness, menu variety issues
- security: Safety, threats, access control, monitoring, incidents
- other: Any other workplace concerns

Also provide a similarity group that describes the specific type of issue within the category.

Respond with JSON in this exact format:
{
  "category": "category_name",
  "similarityGroup": "specific_issue_type",
  "confidence": 0.95
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            category: { 
              type: "string",
              enum: ["hr", "infrastructure", "management", "cafeteria", "security", "other"]
            },
            similarityGroup: { type: "string" },
            confidence: { type: "number" }
          },
          required: ["category", "similarityGroup"]
        }
      },
      contents: `Categorize this workplace complaint: ${text}`
    });

    const rawJson = response.text;
    if (rawJson) {
      const result: ComplaintCategorization = JSON.parse(rawJson);
      return result;
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Gemini categorization failed:", error);
    
    // Fallback to rule-based categorization
    return await fallbackCategorizeComplaint(text);
  }
}

// Rule-based fallback categorization
async function fallbackCategorizeComplaint(text: string): Promise<ComplaintCategorization> {
  const lowerText = text.toLowerCase();
  
  const topics = {
    hr: {
      keywords: ['hr', 'human resources', 'harassment', 'discrimination', 'salary', 'pay', 'benefits', 'manager', 'employee'],
      groups: {
        'workplace-culture': ['harassment', 'discrimination', 'hostile', 'bullying', 'unfair'],
        'compensation-benefits': ['salary', 'pay', 'wage', 'bonus', 'benefits', 'insurance'],
        'employee-relations': ['manager', 'supervisor', 'colleague', 'staff', 'treatment']
      }
    },
    infrastructure: {
      keywords: ['building', 'office', 'desk', 'chair', 'computer', 'equipment', 'ac', 'air conditioning', 'heating'],
      groups: {
        'office-equipment': ['computer', 'laptop', 'monitor', 'printer', 'phone'],
        'furniture': ['desk', 'chair', 'table', 'seating'],
        'facilities': ['bathroom', 'elevator', 'parking', 'building']
      }
    },
    cafeteria: {
      keywords: ['food', 'cafeteria', 'lunch', 'menu', 'meal', 'taste', 'quality'],
      groups: {
        'food-quality': ['taste', 'quality', 'fresh', 'stale', 'cold'],
        'menu-options': ['variety', 'options', 'vegetarian', 'vegan'],
        'service': ['service', 'staff', 'line', 'wait']
      }
    },
    security: {
      keywords: ['security', 'safety', 'lock', 'access', 'card', 'theft', 'danger'],
      groups: {
        'access-control': ['lock', 'access', 'card', 'badge', 'entry'],
        'safety-concerns': ['danger', 'unsafe', 'hazard', 'emergency'],
        'incidents': ['theft', 'stolen', 'break-in', 'assault']
      }
    },
    management: {
      keywords: ['management', 'leadership', 'decision', 'policy', 'director', 'ceo'],
      groups: {
        'leadership-issues': ['management', 'leadership', 'supervisor'],
        'decision-making': ['decision', 'strategy', 'policy'],
        'communication': ['communication', 'transparency', 'information']
      }
    }
  };

  // Find matching category
  for (const [category, data] of Object.entries(topics)) {
    if (data.keywords.some(keyword => lowerText.includes(keyword))) {
      // Find specific group within category
      for (const [group, groupKeywords] of Object.entries(data.groups)) {
        if (groupKeywords.some(keyword => lowerText.includes(keyword))) {
          return {
            category: category as any,
            similarityGroup: group,
            confidence: 0.7
          };
        }
      }
      
      // Default group for category
      return {
        category: category as any,
        similarityGroup: `${category}-general`,
        confidence: 0.6
      };
    }
  }

  // Default fallback
  return {
    category: 'other',
    similarityGroup: 'general-concerns',
    confidence: 0.5
  };
}
