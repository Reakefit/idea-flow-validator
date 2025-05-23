import { ProblemUnderstandingAgent, ProblemUnderstandingContext, ProblemUnderstandingMetadata, ProblemUnderstandingResult } from './types.js';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '../supabase/types';
import { toast } from 'sonner';

interface KeyInsight {
  insight: string;
  confidence: string;
  source: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

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
  private userId: string;
  private MAX_CLARIFYING_QUESTIONS: number = 3; // Updated to 3 questions total
  private tokenUsage: { prompt: number; completion: number } = { prompt: 0, completion: 0 };

  constructor(projectId: string, supabaseClient: typeof supabase, userId: string) {
    console.log('Initializing OpenAIProblemUnderstandingAgent with projectId:', projectId);
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }

    this.openai = new OpenAI({
      apiKey: "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",
      dangerouslyAllowBrowser: true
    });
    
    this.projectId = projectId;
    this.context.projectId = projectId;
    this.supabase = supabaseClient;
    this.userId = userId;
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    retries = MAX_RETRIES
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      if (retries === 0) throw error;
      
      if (error.status === 429) { // Rate limit
        const retryAfter = error.headers?.['retry-after'] || RETRY_DELAY;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      } else {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
      
      return this.retryWithBackoff(operation, retries - 1);
    }
  }

  private async trackTokenUsage(promptTokens: number, completionTokens: number) {
    this.tokenUsage.prompt += promptTokens;
    this.tokenUsage.completion += completionTokens;
    
    try {
      await this.supabase
        .from('token_usage')
        .insert({
          user_id: this.userId,
          project_id: this.projectId,
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: promptTokens + completionTokens,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error tracking token usage:', error);
    }
  }

  async understandProblem(description: string): Promise<ProblemUnderstandingResult> {
    try {
      // Reset context for new problem understanding session
      console.log("Starting fresh problem understanding");
      
      this.context.initialStatement = description;
      this.context.understandingLevel = 0;
      this.context.clarifyingQuestions = [];
      this.context.userResponses = [];
      this.context.keyInsights = [];
      this.context.finalStatement = null;
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
        max_completion_tokens: 12000,
        reasoning_effort: 'high',
        messages: [
          {
            role: 'system',
            content: `You are a problem understanding assistant helping a startup founder who is building a product/service to solve a problem for other businesses.
Your goal is to deeply understand the problem that the target customers (other businesses) face.

IMPORTANT RULES:
1. You will generate ONE essential question that focuses on understanding the target market and customer pain points
2. The question must be high-impact and uncover multiple insight
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
            content: `Initial Problem Statement: ${this.context.initialStatement}

Generate ONE essential question that will help us understand the target customers' businesses and their problems.`
          }
        ]
      });

      console.log('Raw OpenAI response:', JSON.stringify(result, null, 2));
      const content = result.choices[0].message.content || '';
      
      // Directly parse the JSON response
      const parsedResponse = JSON.parse(content);
      
      // Add the question to our context
      this.context.clarifyingQuestions = [parsedResponse.question.text];
      console.log("Added initial question. Total question count:", this.context.clarifyingQuestions.length);
      
      this.context.understandingLevel = 100;
      this.context.keyInsights = parsedResponse.keyInsights;
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
      
      await this.saveContext();
      
      return {
        nextQuestion: this.context.clarifyingQuestions[0],
        isComplete: false,
        completionMessage: null,
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

      if (this.context.userResponses.length > this.MAX_CLARIFYING_QUESTIONS) {
        console.log(`Reached question limit (${this.MAX_CLARIFYING_QUESTIONS}). Completing problem understanding.`);
        
        if (!this.context.finalStatement) {
          this.context.finalStatement = await this.generateFinalStatement().then(result => result.finalStatement);
        }
        
        await this.saveContext();
        
        return {
          nextQuestion: null,
          isComplete: true,
          completionMessage: "We've gathered enough information to proceed with the analysis.",
          understandingLevel: this.context.understandingLevel,
          keyInsights: this.context.keyInsights,
          context: this.context
        };
      }
      
      // Generate next question based on all previous responses
      const result = await this.openai.chat.completions.create({
        model: 'o3-mini',
        max_completion_tokens: 12000,
        reasoning_effort: 'high',
        messages: [
          {
            role: 'system',
            content: `You are a problem understanding assistant helping a startup founder who is building a product/service to solve a problem for other businesses.
Your goal is to deeply understand the problem that the target customers (other businesses) face.

IMPORTANT RULES:
1. You will generate ONE follow-up question based on all previous responses
2. The question must build upon previous answers and uncover new insights
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

Generate ONE follow-up question that builds upon the previous responses and helps us understand the target customers' businesses and their problems better.`
          }
        ]
      });

      const content = result.choices[0].message.content || '';
      const parsedResponse = JSON.parse(content);
      
      // Add new question only if under limit
      if (this.context.clarifyingQuestions.length < this.MAX_CLARIFYING_QUESTIONS) {
        this.context.clarifyingQuestions = [
          ...this.context.clarifyingQuestions,
          parsedResponse.question.text
        ];
      }
      
      this.context.understandingLevel = 100;
      this.context.keyInsights = [
        ...this.context.keyInsights,
        ...parsedResponse.keyInsights
      ];
      
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
      
      await this.saveContext();
      
      const isComplete = this.context.clarifyingQuestions.length > this.MAX_CLARIFYING_QUESTIONS;
      
      if (isComplete && !this.context.finalStatement) {
        this.context.finalStatement = await this.generateFinalStatement().then(r => r.finalStatement);
        await this.saveContext();
      }
      
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
        max_completion_tokens: 12000,
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
        max_completion_tokens: 12000,
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
      
      // Try to get existing context
      const { data: existingContext } = await this.supabase
        .from('problem_understanding_context')
        .select('*')
        .eq('project_id', this.context.projectId)
        .single();

      let result;
      if (existingContext) {
        console.log('Existing context found. Current questions in DB:', existingContext.clarifying_questions.length);
        
        const existingQuestionsSet = new Set(existingContext.clarifying_questions);
        const newQuestions = this.context.clarifyingQuestions.filter(q => !existingQuestionsSet.has(q));
        
        console.log(`Found ${newQuestions.length} new questions to add`);
        
        const existingResponseQuestions = new Set(existingContext.user_responses.map((r: { question: string }) => r.question));
        const newResponses = this.context.userResponses.filter((r: { question: string }) => !existingResponseQuestions.has(r.question));
        
        console.log(`Found ${newResponses.length} new user responses to add`);
        
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
        
        result = await this.supabase
          .from('problem_understanding_context')
          .update({
            initial_statement: this.context.initialStatement || existingContext.initial_statement,
            clarifying_questions: existingContext.clarifying_questions.length >= this.MAX_CLARIFYING_QUESTIONS
              ? existingContext.clarifying_questions
              : [...existingContext.clarifying_questions, ...newQuestions].slice(0, this.MAX_CLARIFYING_QUESTIONS),
            user_responses: [
              ...existingContext.user_responses,
              ...newResponses
            ],
            understanding_level: this.context.understandingLevel,
            key_insights: [
              ...existingContext.key_insights,
              ...newInsights
            ],
            final_statement: this.context.finalStatement || existingContext.final_statement,
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

        if (result.data) {
          console.log(`After save, DB now has ${result.data.clarifying_questions.length} questions`);
        }
      } else {
        // Create new context
        console.log('No existing context found. Creating new context.');

        const clarifyingQuestions = this.context.clarifyingQuestions.slice(0, this.MAX_CLARIFYING_QUESTIONS);

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
          // No context found, initialize empty context and save
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

  async compileFinalStatement(): Promise<{ finalStatement: string | null }> {
    try {
      const context = this.getContext();
      if (!context.initialStatement || context.userResponses.length < 3) {
        throw new Error("Insufficient context for final statement compilation");
      }

      const result = await this.openai.chat.completions.create({
        model: 'o3-mini',
        messages: [
          {
            role: 'system',
            content: `You are a problem understanding assistant helping a startup founder who is building a product/service to solve a problem for other businesses.
Your task is to compile a comprehensive problem statement based on the conversation history.
Focus on:
1. The target market and their pain points
2. Current solutions and their limitations
3. The opportunity for a new solution
4. Key insights from the conversation

Format the statement in a clear, concise manner that captures the essence of the problem.`
          },
          {
            role: 'user',
            content: `Based on our conversation, please compile a comprehensive problem statement. Here's the context:

Initial Statement: ${context.initialStatement}

Responses to Questions:
${context.userResponses.map((r, i) => `Q${i + 1}: ${context.clarifyingQuestions[i]}\nA${i + 1}: ${r.response}`).join('\n\n')}`
          }
        ]
      });

      const finalStatement = result.choices[0]?.message?.content || null;
      
      if (finalStatement) {
        // Update the final_statement in the problem_understanding_context table
        const { error } = await this.supabase
          .from('problem_understanding_context')
          .update({
            final_statement: finalStatement,
            updated_at: new Date().toISOString()
          })
          .eq('project_id', this.projectId);

        if (error) {
          console.error("Error storing final statement:", error);
          throw error;
        }
      }

      return { finalStatement };
    } catch (error) {
      console.error("Error compiling final statement:", error);
      return { finalStatement: null };
    }
  }
}
