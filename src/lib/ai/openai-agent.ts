import { ProblemUnderstandingAgent, ProblemUnderstandingContext, ProblemUnderstandingMetadata, ProblemUnderstandingResult } from './types.js';
import { OpenAI } from 'openai';
import { supabase } from '@/lib/supabase';
import type { Database } from '../supabase/types';
import { ProcessResponseResult } from './types';

interface KeyInsight {
  insight: string;
  confidence: string;
  source: string;
}

export class OpenAIProblemUnderstandingAgent implements ProblemUnderstandingAgent {
  private context: ProblemUnderstandingContext = {
    id: undefined,
    projectId: '',
    initialStatement: '',
    clarifyingQuestions: [],
    userResponses: [],
    understandingLevel: 0,
    keyInsights: [],
    finalStatement: null,
    metadata: {
      targetMarket: {
        demographics: [],
        regions: [],
        industries: [],
        companySizes: []
      },
      currentSolution: '',
      keyProblems: [],
      desiredOutcomes: []
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  private openai: OpenAI;
  private projectId: string;
  private supabase: typeof supabase;

  constructor(apiKey: string, projectId: string, supabaseClient: typeof supabase) {
    console.log('Initializing OpenAIProblemUnderstandingAgent with projectId:', projectId);
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
    this.projectId = projectId;
    this.context.projectId = projectId;
    this.supabase = supabaseClient;
  }

  async understandProblem(description: string): Promise<ProblemUnderstandingResult> {
    try {
      // IMPORTANT: Always reset the context when starting a new problem understanding session
      // This ensures we're not carrying over questions from previous sessions
      console.log("Starting fresh problem understanding");
      
      this.context.initialStatement = description;
      this.context.understandingLevel = 0;
      this.context.clarifyingQuestions = []; // Reset to empty
      this.context.userResponses = [];      // Reset to empty
      this.context.keyInsights = [];        // Reset to empty
      this.context.finalStatement = null;   // Reset final statement
      this.context.metadata = {
        targetMarket: {
          demographics: [],
          regions: [],
          industries: [],
          companySizes: []
        },
        currentSolution: '',
        keyProblems: [],
        desiredOutcomes: []
      };

      console.log('Sending request to OpenAI with description:', description);
      const result = await this.openai.chat.completions.create({
        model: 'o3-mini',
        max_completion_tokens: 4000,
        reasoning_effort: 'high',
        messages: [
          {
            role: 'system',
            content: `You are a problem understanding assistant helping a startup founder who is building a product/service to solve a problem for other businesses.
            Your goal is to deeply understand the problem that the target customers (other businesses) face.
            
            IMPORTANT RULES:
            1. You will ask ONLY 2 essential questions total
            2. Each question must be high-impact and uncover multiple insights
            3. Focus on understanding:
               - Target customers' businesses (who they are, their industries, regions, sizes)
               - Their current pain points and challenges
               - Their existing solutions and why they're insufficient
            4. Return your response in this JSON format:
            {
              "question": {
                "id": "string",
                "text": "string",
                "context": "string",
                "priority": "high"
              },
              "keyInsights": [
                {
                  "insight": "string",
                  "confidence": "high",
                  "source": "initial_statement|user_response|inferred"
                }
              ],
              "metadata": {
                "targetMarket": {
                  "demographics": ["string"],
                  "regions": ["string"],
                  "industries": ["string"],
                  "companySizes": ["string"]
                },
                "currentSolution": "string",
                "keyProblems": ["string"],
                "desiredOutcomes": ["string"]
              }
            }

            CRITICAL: Remember:
            - You are NOT asking about the founder's business
            - You are asking about the target customers' businesses
            - Use "they/their" when referring to the target customers
            - Focus on understanding their problems, not the founder's
            - Return ONLY the JSON object`
          },
          {
            role: 'user',
            content: `Full Context:
Initial Problem Statement: ${this.context.initialStatement}
Previous Questions and Responses:
${this.context.userResponses.map(r => `Q: ${r.question}\nA: ${r.response}`).join('\n\n')}
Key Insights So Far:
${this.context.keyInsights.map(i => {
  if (typeof i === 'string') {
    try {
      const parsed = JSON.parse(i) as KeyInsight;
      return `- ${parsed.insight} (${parsed.confidence} confidence, source: ${parsed.source})`;
    } catch (e) {
      return `- ${i}`;
    }
  }
  const insight = i as KeyInsight;
  return `- ${insight.insight} (${insight.confidence} confidence, source: ${insight.source})`;
}).join('\n')}
Current Metadata:
- Target Market: ${JSON.stringify(this.context.metadata.targetMarket, null, 2)}
- Current Solution: ${this.context.metadata.currentSolution}
- Key Problems: ${JSON.stringify(this.context.metadata.keyProblems, null, 2)}
- Desired Outcomes: ${JSON.stringify(this.context.metadata.desiredOutcomes, null, 2)}

Current Question: ${description}
Current Response: ${description}

Based on this context, generate the next essential question that will help us understand the target customers' businesses and their problems. Remember we have only 2-3 questions total.`
          }
        ]
      });

      console.log('Raw OpenAI response:', JSON.stringify(result, null, 2));
      const content = result.choices[0].message.content || '';
      
      // Directly parse the JSON response
      const parsedResponse = JSON.parse(content);
      
      // Add the first question to our context
      this.context.clarifyingQuestions = [parsedResponse.question.text];
      console.log("Added first question. Total question count:", this.context.clarifyingQuestions.length);
      
      // Update understanding level based on the new response
      this.context.understandingLevel = 100;
      
      // Add initial insights
      this.context.keyInsights = parsedResponse.keyInsights;
      
      // Set initial metadata
      this.context.metadata = {
        targetMarket: {
          demographics: parsedResponse.metadata.targetMarket.demographics || [],
          regions: parsedResponse.metadata.targetMarket.regions || [],
          industries: parsedResponse.metadata.targetMarket.industries || [],
          companySizes: parsedResponse.metadata.targetMarket.companySizes || []
        },
        currentSolution: parsedResponse.metadata.currentSolution || '',
        keyProblems: parsedResponse.metadata.keyProblems || [],
        desiredOutcomes: parsedResponse.metadata.desiredOutcomes || []
      };
      
      // Save context to Supabase
      await this.saveContext();
      
      // For the first question, isComplete is always false
      // since we need exactly 2 questions
      const isComplete = false;
      console.log("First question added. Force isComplete = false to ensure we ask 2 questions");
      
      return {
        nextQuestion: parsedResponse.question.text,
        isComplete,
        completionMessage: isComplete ? "We've gathered enough information to proceed with the analysis." : null,
        understandingLevel: this.context.understandingLevel,
        keyInsights: this.context.keyInsights,
        context: this.context
      };
    } catch (error) {
      console.error('Error in understandProblem:', error);
      throw error;
    }
  }

  async processUserResponse(question: string, response: string): Promise<ProblemUnderstandingResult> {
    try {
      // Add the new response to the context
      this.context.userResponses.push({ question, response });

      console.log(`Current question count before generating a new question: ${this.context.clarifyingQuestions.length}`);

      // STRICT CHECK: If we already have 2 or more questions, we're done
      if (this.context.clarifyingQuestions.length >= 2) {
        console.log("Reached question limit (2). Completing problem understanding.");
        
        // Generate final statement if not already done
        if (!this.context.finalStatement) {
          this.context.finalStatement = await this.generateFinalStatement().then(result => result.finalStatement);
        }
        
        await this.saveContext();
        
        return {
          nextQuestion: null, // Important: No more questions
          isComplete: true,   // Mark as complete
          completionMessage: "We've gathered enough information to proceed with the analysis.",
          understandingLevel: this.context.understandingLevel,
          keyInsights: this.context.keyInsights,
          context: this.context
        };
      }
      
      // Only proceed with generating a new question if we have fewer than 2 questions
      const result = await this.openai.chat.completions.create({
        model: 'o3-mini',
        max_completion_tokens: 4000,
        reasoning_effort: 'high',
        messages: [
          {
            role: 'system',
            content: `You are a problem understanding assistant helping a startup founder who is building a product/service to solve a problem for other businesses.
            Your goal is to deeply understand the problem that the target customers (other businesses) face.
            
            IMPORTANT RULES:
            1. You will ask ONLY 2-3 essential questions total
            2. Each question must be high-impact and uncover multiple insights
            3. Focus on understanding:
               - Target customers' businesses (who they are, their industries, regions, sizes)
               - Their current pain points and challenges
               - Their existing solutions and why they're insufficient
            4. Return your response in this JSON format:
            {
              "question": {
                "id": "string",
                "text": "string",
                "context": "string",
                "priority": "high"
              },
              "keyInsights": [
                {
                  "insight": "string",
                  "confidence": "high",
                  "source": "initial_statement|user_response|inferred"
                }
              ],
              "metadata": {
                "targetMarket": {
                  "demographics": ["string"],
                  "regions": ["string"],
                  "industries": ["string"],
                  "companySizes": ["string"]
                },
                "currentSolution": "string",
                "keyProblems": ["string"],
                "desiredOutcomes": ["string"]
              }
            }

            CRITICAL: Remember:
            - You are NOT asking about the founder's business
            - You are asking about the target customers' businesses
            - Use "they/their" when referring to the target customers
            - Focus on understanding their problems, not the founder's
            - Return ONLY the JSON object`
          },
          {
            role: 'user',
            content: `Full Context:
Initial Problem Statement: ${this.context.initialStatement}
Previous Questions and Responses:
${this.context.userResponses.map(r => `Q: ${r.question}\nA: ${r.response}`).join('\n\n')}
Key Insights So Far:
${this.context.keyInsights.map(i => {
  if (typeof i === 'string') {
    try {
      const parsed = JSON.parse(i) as KeyInsight;
      return `- ${parsed.insight} (${parsed.confidence} confidence, source: ${parsed.source})`;
    } catch (e) {
      return `- ${i}`;
    }
  }
  const insight = i as KeyInsight;
  return `- ${insight.insight} (${insight.confidence} confidence, source: ${insight.source})`;
}).join('\n')}
Current Metadata:
- Target Market: ${JSON.stringify(this.context.metadata.targetMarket, null, 2)}
- Current Solution: ${this.context.metadata.currentSolution}
- Key Problems: ${JSON.stringify(this.context.metadata.keyProblems, null, 2)}
- Desired Outcomes: ${JSON.stringify(this.context.metadata.desiredOutcomes, null, 2)}

Current Question: ${question}
Current Response: ${response}

Based on this context, generate the next essential question that will help us understand the target customers' businesses and their problems. Remember we have only 2-3 questions total.`
          }
        ]
      });

      const content = result.choices[0].message.content || '';
      
      // Directly parse the JSON response
      const parsedResponse = JSON.parse(content);
      
      // Only add the new question if it won't exceed our limit of 2
      if (this.context.clarifyingQuestions.length < 2) {
        this.context.clarifyingQuestions = [
          ...this.context.clarifyingQuestions,
          parsedResponse.question.text
        ];
      }
      
      // Update understanding level based on the new response
      this.context.understandingLevel = 100;
      
      // Append new insights to existing ones
      this.context.keyInsights = [
        ...this.context.keyInsights,
        ...parsedResponse.keyInsights
      ];
      
      // Merge metadata while preserving existing values
      this.context.metadata = {
        targetMarket: {
          demographics: Array.from(new Set([...this.context.metadata.targetMarket.demographics, ...(parsedResponse.metadata.targetMarket.demographics || [])])),
          regions: Array.from(new Set([...this.context.metadata.targetMarket.regions, ...(parsedResponse.metadata.targetMarket.regions || [])])),
          industries: Array.from(new Set([...this.context.metadata.targetMarket.industries, ...(parsedResponse.metadata.targetMarket.industries || [])])),
          companySizes: Array.from(new Set([...this.context.metadata.targetMarket.companySizes, ...(parsedResponse.metadata.targetMarket.companySizes || [])]))
        },
        currentSolution: parsedResponse.metadata.currentSolution || this.context.metadata.currentSolution,
        keyProblems: Array.from(new Set([...this.context.metadata.keyProblems, ...(parsedResponse.metadata.keyProblems || [])])),
        desiredOutcomes: Array.from(new Set([...this.context.metadata.desiredOutcomes, ...(parsedResponse.metadata.desiredOutcomes || [])]))
      };
      
      // Save context to Supabase
      await this.saveContext();
      
      // Final check: After adding the new question, have we reached our limit?
      const isComplete = this.context.clarifyingQuestions.length >= 2;
      
      console.log(`Question count after response: ${this.context.clarifyingQuestions.length}, isComplete: ${isComplete}`);
      
      if (isComplete) {
        // Generate final statement if not already done
        if (!this.context.finalStatement) {
          this.context.finalStatement = await this.generateFinalStatement().then(result => result.finalStatement);
          await this.saveContext();
        }
      }
      
      console.log(`Returning isComplete=${isComplete}, questionCount=${this.context.clarifyingQuestions.length}`);
      
      return {
        nextQuestion: isComplete ? null : parsedResponse.question.text,
        isComplete,
        completionMessage: isComplete ? "We've gathered enough information to proceed with the analysis." : null,
        understandingLevel: this.context.understandingLevel,
        keyInsights: this.context.keyInsights,
        context: this.context
      };
    } catch (error) {
      console.error('Error in processUserResponse:', error);
      throw error;
    }
  }

  private async extractMarketInfo(response: string): Promise<{
    demographics: string[];
    regions: string[];
    industries: string[];
    companySizes: string[];
  }> {
    try {
      const result = await this.openai.chat.completions.create({
        model: 'o3-mini',
        max_completion_tokens: 3000,
        reasoning_effort: 'high',
        messages: [
          {
            role: 'system',
            content: `Extract market targeting information from the response. 
            Identify demographics, regions, industries, and company sizes.
            Return a JSON object with these fields.`
          },
          {
            role: 'user',
            content: response
          }
        ]
      });

      const content = result.choices[0].message.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          demographics: [],
          regions: [],
          industries: [],
          companySizes: []
        };
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error extracting market info:', error);
      return {
        demographics: [],
        regions: [],
        industries: [],
        companySizes: []
      };
    }
  }

  async generateFinalStatement(): Promise<{ finalStatement: string; metadata: ProblemUnderstandingMetadata; context: ProblemUnderstandingContext }> {
    try {
      const result = await this.openai.chat.completions.create({
        model: 'o3-mini',
        max_completion_tokens: 4000,
        reasoning_effort: 'high',
        messages: [
          {
            role: 'system',
            content: `You are a problem understanding assistant helping to synthesize a comprehensive final statement about the target customers' problems.

            Based on the conversation history, generate a clear, structured final statement that includes:

            1. TARGET CUSTOMERS
               - Who they are (industries, regions, sizes)
               - Their specific roles and responsibilities
               - Their technical capabilities and limitations

            2. CURRENT PAIN POINTS
               - Core problems they face
               - Impact on their business operations
               - Financial and operational costs
               - Compliance and risk factors

            3. EXISTING SOLUTIONS
               - Current tools and processes
               - Why they're insufficient
               - Integration challenges
               - Manual workarounds

            4. DESIRED OUTCOMES
               - What they want to achieve
               - Key improvements needed
               - Must-have features
               - Success metrics

            Return your response in this JSON format:
            {
              "finalStatement": "A comprehensive, structured statement that covers all four sections above",
              "metadata": {
                "targetMarket": {
                  "demographics": ["List of target demographics"],
                  "regions": ["List of target regions"],
                  "industries": ["List of target industries"],
                  "companySizes": ["List of target company sizes"]
                },
                "currentSolution": "Description of current solutions",
                "keyProblems": ["List of key problems"],
                "desiredOutcomes": ["List of desired outcomes"]
              }
            }`
          },
          {
            role: 'user',
            content: `Conversation Summary:
Initial Problem: ${this.context.initialStatement}

Questions Asked:
${this.context.clarifyingQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

User Responses:
${this.context.userResponses.map((r, i) => `${i + 1}. Q: ${r.question}\n   A: ${r.response}`).join('\n\n')}

Key Insights:
${this.context.keyInsights.map(i => {
  if (typeof i === 'string') {
    try {
      const parsed = JSON.parse(i) as KeyInsight;
      return `- ${parsed.insight} (${parsed.confidence} confidence, source: ${parsed.source})`;
    } catch (e) {
      return `- ${i}`;
    }
  }
  const insight = i as KeyInsight;
  return `- ${insight.insight} (${insight.confidence} confidence, source: ${insight.source})`;
}).join('\n')}

Current Metadata:
- Target Market: ${JSON.stringify(this.context.metadata.targetMarket, null, 2)}
- Current Solution: ${this.context.metadata.currentSolution}
- Key Problems: ${JSON.stringify(this.context.metadata.keyProblems, null, 2)}
- Desired Outcomes: ${JSON.stringify(this.context.metadata.desiredOutcomes, null, 2)}

Generate a comprehensive final statement that synthesizes this information into a clear, structured format.`
          }
        ]
      });

      const content = result.choices[0].message.content || '';
      const parsedResponse = JSON.parse(content);
      
      return {
        finalStatement: parsedResponse.finalStatement,
        metadata: parsedResponse.metadata,
        context: this.context
      };
    } catch (error) {
      console.error('Error generating final statement:', error);
      return {
        finalStatement: 'Unable to generate final statement. Please review the conversation history and key insights.',
        metadata: this.context.metadata,
        context: this.context
      };
    }
  }

  public getContext(): ProblemUnderstandingContext {
    return this.context;
  }

  async resetContext(): Promise<void> {
    this.context = {
      projectId: this.projectId,
      initialStatement: '',
      clarifyingQuestions: [],
      userResponses: [],
      understandingLevel: 0,
      keyInsights: [],
      finalStatement: null,
      metadata: {
        targetMarket: {
          demographics: [],
          regions: [],
          industries: [],
          companySizes: []
        },
        currentSolution: '',
        keyProblems: [],
        desiredOutcomes: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await this.saveContext();
  }

  public async saveContext(): Promise<void> {
    try {
      const now = new Date().toISOString();
      console.log('Attempting to save context with project_id:', this.context.projectId);
      console.log('Current context clarifying_questions count:', this.context.clarifyingQuestions.length);
      
      // First try to get existing context
      const { data: existingContext } = await this.supabase
        .from('problem_understanding_context')
        .select('*')
        .eq('project_id', this.context.projectId)
        .single();

      let result;
      if (existingContext) {
        console.log('Existing context found. Current questions in DB:', existingContext.clarifying_questions.length);
        
        // To avoid duplicating questions, we'll ensure we only add new ones
        // This is critical to maintain our 2-question limit
        const existingQuestionsSet = new Set(existingContext.clarifying_questions);
        const newQuestions = this.context.clarifyingQuestions.filter(q => !existingQuestionsSet.has(q));
        
        console.log(`Found ${newQuestions.length} new questions to add`);
        
        // Similarly handle user responses to avoid duplicates
        const existingResponseQuestions = new Set(existingContext.user_responses.map((r: { question: string }) => r.question));
        const newResponses = this.context.userResponses.filter((r: { question: string }) => !existingResponseQuestions.has(r.question));
        
        console.log(`Found ${newResponses.length} new user responses to add`);
        
        // Keep track of existing insights to avoid duplicates
        const existingInsightTexts = new Set<string>();
        existingContext.key_insights.forEach((insight: any) => {
          if (typeof insight === 'string') {
            try {
              const parsed = JSON.parse(insight) as KeyInsight;
              existingInsightTexts.add(parsed.insight);
            } catch (e) {
              existingInsightTexts.add(insight);
            }
          } else if (insight && typeof insight === 'object' && 'insight' in insight) {
            existingInsightTexts.add(insight.insight);
          }
        });
        
        // Filter out duplicate insights
        const newInsights = this.context.keyInsights.filter((insight: any) => {
          if (typeof insight === 'string') {
            try {
              const parsed = JSON.parse(insight) as KeyInsight;
              return !existingInsightTexts.has(parsed.insight);
            } catch (e) {
              return !existingInsightTexts.has(insight);
            }
          }
          return insight && typeof insight === 'object' && 'insight' in insight ? !existingInsightTexts.has(insight.insight) : true;
        });
        
        console.log(`Found ${newInsights.length} new insights to add`);
        
        // Update existing context, carefully managing all fields
        result = await this.supabase
          .from('problem_understanding_context')
          .update({
            initial_statement: this.context.initialStatement || existingContext.initial_statement,
            
            // For questions, strictly enforce the 2-question limit
            clarifying_questions: existingContext.clarifying_questions.length >= 2 
              ? existingContext.clarifying_questions // If already at/over limit, don't add more
              : [...existingContext.clarifying_questions, ...newQuestions].slice(0, 2), // Only add up to 2 total
            
            // For user responses, add any new ones
            user_responses: [
              ...existingContext.user_responses,
              ...newResponses
            ],
            
            // Always update understanding level
            understanding_level: this.context.understandingLevel,
            
            // Add new insights while avoiding duplicates
            key_insights: [
              ...existingContext.key_insights,
              ...newInsights
            ],
            
            // Use new final statement if available, otherwise keep existing
            final_statement: this.context.finalStatement || existingContext.final_statement,
            
            // Merge metadata, keeping existing values if new ones not provided
            metadata: {
              targetMarket: {
                demographics: Array.from(new Set([
                  ...(existingContext.metadata?.targetMarket?.demographics || []),
                  ...(this.context.metadata.targetMarket.demographics || [])
                ])),
                regions: Array.from(new Set([
                  ...(existingContext.metadata?.targetMarket?.regions || []),
                  ...(this.context.metadata.targetMarket.regions || [])
                ])),
                industries: Array.from(new Set([
                  ...(existingContext.metadata?.targetMarket?.industries || []),
                  ...(this.context.metadata.targetMarket.industries || [])
                ])),
                companySizes: Array.from(new Set([
                  ...(existingContext.metadata?.targetMarket?.companySizes || []),
                  ...(this.context.metadata.targetMarket.companySizes || [])
                ]))
              },
              currentSolution: this.context.metadata.currentSolution || existingContext.metadata?.currentSolution || '',
              keyProblems: Array.from(new Set([
                ...(existingContext.metadata?.keyProblems || []),
                ...(this.context.metadata.keyProblems || [])
              ])),
              desiredOutcomes: Array.from(new Set([
                ...(existingContext.metadata?.desiredOutcomes || []),
                ...(this.context.metadata.desiredOutcomes || [])
              ]))
            },
            updated_at: now
          })
          .eq('project_id', this.context.projectId)
          .select()
          .single();
        
        // After saving, log the final question count for debugging
        if (result.data) {
          console.log(`After save, DB now has ${result.data.clarifying_questions.length} questions`);
        }
      } else {
        // Create new context
        console.log('No existing context found. Creating new context.');
        
        // For new contexts, strictly enforce the 2-question limit
        const clarifyingQuestions = this.context.clarifyingQuestions.slice(0, 2);
        
        result = await this.supabase
          .from('problem_understanding_context')
          .insert({
            project_id: this.context.projectId,
            initial_statement: this.context.initialStatement,
            clarifying_questions: clarifyingQuestions,
            user_responses: this.context.userResponses,
            understanding_level: this.context.understandingLevel,
            key_insights: this.context.keyInsights,
            final_statement: this.context.finalStatement,
            metadata: this.context.metadata,
            created_at: now,
            updated_at: now
          })
          .select()
          .single();
        
        // After creating, log the question count for debugging
        if (result.data) {
          console.log(`After create, DB now has ${result.data.clarifying_questions.length} questions`);
        }
      }

      if (result.error) {
        console.error('Error saving context:', result.error);
        throw result.error;
      }

      if (result.data) {
        console.log('Successfully saved context with ID:', result.data.id);
        this.context.id = result.data.id;
        this.context.createdAt = result.data.created_at;
        this.context.updatedAt = result.data.updated_at;
        
        // Update our local context with what's actually in the database
        this.context.clarifyingQuestions = result.data.clarifying_questions;
        console.log(`Local context updated. Question count: ${this.context.clarifyingQuestions.length}`);
      }
    } catch (error) {
      console.error('Error saving context:', error);
      throw error;
    }
  }

  public async loadContext(projectId: string): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('problem_understanding_context')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No context found, initialize with empty context
          this.context = {
            projectId: projectId,
            initialStatement: '',
            clarifyingQuestions: [],
            userResponses: [],
            understandingLevel: 0,
            keyInsights: [],
            finalStatement: null,
            metadata: {
              targetMarket: {
                demographics: [],
                regions: [],
                industries: [],
                companySizes: []
              },
              currentSolution: '',
              keyProblems: [],
              desiredOutcomes: []
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await this.saveContext();
          return;
        }
        throw error;
      }

      if (data) {
        console.log('Loaded context from database. Questions count:', data.clarifying_questions.length);
        this.context = {
          id: data.id,
          projectId: data.project_id,
          initialStatement: data.initial_statement,
          clarifyingQuestions: data.clarifying_questions,
          userResponses: data.user_responses,
          understandingLevel: data.understanding_level,
          keyInsights: data.key_insights,
          finalStatement: data.final_statement,
          metadata: data.metadata,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
        console.log('After loading context, questions count:', this.context.clarifyingQuestions.length);
      }
    } catch (error) {
      console.error('Error loading context:', error);
      throw error;
    }
  }
}
