import { AIAgentConfig } from './types';

// Base config for all agents
export const DEFAULT_AGENT_CONFIG: AIAgentConfig = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
  tools: ['web_search'],
  reasoningMode: 'high'
};

// Problem Understanding Agent
export const PROBLEM_UNDERSTANDING_CONFIG: AIAgentConfig = {
  ...DEFAULT_AGENT_CONFIG,
  temperature: 0.7,
  reasoningMode: 'high'
};

// Market Research Agent
export const MARKET_RESEARCH_CONFIG: AIAgentConfig = {
  ...DEFAULT_AGENT_CONFIG,
  temperature: 0.7,
  reasoningMode: 'high'
};

// Competitor Analysis Agent
export const COMPETITOR_ANALYSIS_CONFIG: AIAgentConfig = {
  ...DEFAULT_AGENT_CONFIG,
  temperature: 0.7,
  reasoningMode: 'high'
};

// Feature Analysis Agent
export const FEATURE_ANALYSIS_CONFIG: AIAgentConfig = {
  ...DEFAULT_AGENT_CONFIG,
  temperature: 0.7,
  reasoningMode: 'high'
};

// Customer Insights Agent
export const CUSTOMER_INSIGHTS_CONFIG: AIAgentConfig = {
  ...DEFAULT_AGENT_CONFIG,
  temperature: 0.7,
  reasoningMode: 'high'
};

// Persona Generation Agent
export const PERSONA_GENERATION_CONFIG: AIAgentConfig = {
  ...DEFAULT_AGENT_CONFIG,
  temperature: 0.7,
  reasoningMode: 'high'
};

// Opportunity Mapping Agent
export const OPPORTUNITY_MAPPING_CONFIG: AIAgentConfig = {
  ...DEFAULT_AGENT_CONFIG,
  temperature: 0.7,
  reasoningMode: 'high'
};

// Agent-specific prompts and guidelines
export const AGENT_GUIDELINES = {
  problemUnderstanding: {
    initialPrompt: `You are a problem understanding assistant. Your goal is to help users clarify and understand their business problems.
    Follow these steps:
    1. Ask clarifying questions to understand the problem better
    2. After 1-2 clarifying questions, ask about the target market in a natural way
    3. Extract market information into metadata when provided
    4. Continue with problem understanding until you have a good grasp of the situation
    5. Use the following tools when needed: web_search.
    Reasoning mode: step-by-step.`
  },

  marketResearch: {
    initialPrompt: `You are an expert market research agent specializing in deep market analysis and research.
    Your task is to conduct a thorough market analysis using chain-of-thought reasoning.
    
    Step 1: Analyze the problem context and identify key research areas
    Step 2: Use web_search to gather comprehensive market data
    Step 3: Synthesize findings into structured insights
    Step 4: Validate conclusions with multiple data points
    
    Focus on providing specific, actionable insights rather than generic observations.
    For each insight, include supporting data points or trends where possible.`
  },

  personaGeneration: {
    initialPrompt: `Based on the problem understanding context, generate 3-5 distinct customer personas. Each persona should include:
    1. Basic Demographics (age, occupation, location)
    2. Goals and Motivations
    3. Pain Points and Challenges
    4. Current Solutions and Workarounds
    5. Decision-Making Process
    6. Key Behaviors and Preferences
    7. Technical Proficiency
    8. Budget and Resource Constraints
    9. Communication Preferences
    10. Success Criteria

    Ensure personas are:
    - Based on real user research and data
    - Specific and detailed
    - Mutually exclusive
    - Representative of key user segments
    - Focused on behaviors and needs, not just demographics`
  },

  opportunityMapping: {
    initialPrompt: `You are an opportunity mapping specialist. Your task is to:
    1. Analyze market gaps and opportunities
    2. Evaluate strategic opportunities
    3. Develop actionable recommendations
    4. Create implementation roadmap
    5. Assess risks and mitigation strategies
    
    Focus on providing:
    - Clear, actionable opportunities
    - Specific market gaps
    - Detailed recommendations
    - Realistic timelines
    - Comprehensive risk assessment`
  }
}; 