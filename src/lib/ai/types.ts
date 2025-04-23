export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIAgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  tools?: string[];
  reasoningMode?: 'low' | 'medium' | 'high';
}

export interface ProblemUnderstandingMetadata {
  targetMarket: {
    demographics: string[];
    regions: string[];
    industries: string[];
    companySizes: string[];
  };
  currentSolution: string;
  keyProblems: string[];
  desiredOutcomes: string[];
}

export interface MarketTarget {
  countries: string[];
  regions: string[];
  demographics: string[];
  industries: string[];
  companySizes: string[];
}

export interface ProblemUnderstandingContext {
  id?: string;
  projectId: string;
  initialStatement: string;
  clarifyingQuestions: string[];
  userResponses: { question: string; response: string }[];
  understandingLevel: number;
  keyInsights: string[];
  finalStatement: string | null;
  metadata: ProblemUnderstandingMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface ProblemUnderstandingResult {
  nextQuestion: string | null;
  isComplete: boolean;
  completionMessage: string | null;
  understandingLevel: number;
  keyInsights: string[];
  context: ProblemUnderstandingContext;
}

export interface ProblemUnderstandingAgent {
  understandProblem(description: string): Promise<ProblemUnderstandingResult>;
  processUserResponse(question: string, response: string): Promise<ProblemUnderstandingResult>;
  generateFinalStatement(): Promise<{ finalStatement: string; metadata: ProblemUnderstandingMetadata; context: ProblemUnderstandingContext }>;
  getContext(): ProblemUnderstandingContext;
  resetContext(): Promise<void>;
  saveContext(): Promise<void>;
  loadContext(projectId: string): Promise<void>;
}

export interface ProcessResponseResult {
  nextQuestion: string;
  isComplete: boolean;
  completionMessage: string | null;
  understandingLevel: number;
  keyInsights: string[];
}

export interface Persona {
  id: string;
  projectId: string;
  name: string;
  description: string;
  demographics: {
    age: string;
    gender: string;
    location: string;
    occupation: string;
    income: string;
    education: string;
  };
  painPoints: string[];
  goals: string[];
  behaviors: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PersonaGenerationContext {
  projectId: string;
  problemContext: ProblemUnderstandingContext;
  personas: Persona[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonaGenerationResult {
  personas: Persona[];
  next_question: string | null;
  is_complete: boolean;
}

export interface PersonaRefinementResult {
  updated_persona: Persona;
  next_question: string | null;
  is_complete: boolean;
}

export interface PersonaGenerationAgent {
  generatePersonas(problemContext: ProblemUnderstandingContext): Promise<PersonaGenerationResult>;
  refinePersona(persona: Persona, feedback: string): Promise<PersonaRefinementResult>;
  getContext(): PersonaGenerationContext | null;
  resetContext(): Promise<void>;
  saveContext(): Promise<void>;
  loadContext(projectId: string): Promise<void>;
}

export interface MarketResearchMetadata {
  marketSize: string;
  growthRate: string;
  keyTrends: string[];
  customerSegments: string[];
}

export interface Competitor {
  id: string;
  name: string;
  description: string;
  strengths: string[];
  features: string[];
  weaknesses: string[];
  pricing: string;
  marketShare: string;
  targetAudience: string;
}

export interface MarketResearchContext {
  id: string;
  projectId: string;
  problemContext: ProblemUnderstandingContext | null;
  competitors: Competitor[];
  marketInsights: string[];
  opportunities: string[];
  metadata: MarketResearchMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface MarketResearchResult {
  competitors: Competitor[];
  marketInsights: string[];
  opportunities: string[];
  nextQuestion: string | null;
  isComplete: boolean;
  context: MarketResearchContext;
}

export interface MarketResearchAgent {
  analyzeMarket(problemContext: ProblemUnderstandingContext): Promise<MarketResearchResult>;
  refineAnalysis(feedback: string): Promise<MarketResearchResult>;
  getContext(): MarketResearchContext | null;
  resetContext(): Promise<void>;
  saveContext(): Promise<void>;
  loadContext(projectId: string): Promise<void>;
}

export interface CustomerNeed {
  id: string;
  description: string;
  importance: number;
  evidence: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  demographics: string[];
  behaviors: string[];
  needs: string[];
  painPoints: string[];
  preferences: string[];
}

export interface PainPoint {
  id: string;
  segment: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  frequency: 'high' | 'medium' | 'low';
  currentSolutions: string[];
  gaps: string[];
}

export interface Opportunity {
  id: string;
  segment: string;
  description: string;
  potentialValue: 'high' | 'medium' | 'low';
  feasibility: 'high' | 'medium' | 'low';
  requiredCapabilities: string[];
  timeToMarket: 'short' | 'medium' | 'long';
}

export interface FeedbackAnalysis {
  segment: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  keyThemes: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface CustomerInsightsContext {
  id: string;
  projectId: string;
  featureAnalysisContextId: string | null;
  painPoints: PainPoint[];
  satisfactionMetrics: SatisfactionMetric[];
  featureRequests: FeatureRequest[];
  sentimentAnalysis: SentimentAnalysis[];
  usagePatterns: UsagePattern[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInsightsResult {
  painPoints: PainPoint[];
  satisfactionMetrics: SatisfactionMetric[];
  featureRequests: FeatureRequest[];
  sentimentAnalysis: SentimentAnalysis[];
  usagePatterns: UsagePattern[];
  nextQuestion: string | null;
  isComplete: boolean;
}

export interface CustomerInsightsAgent {
  analyzeCustomerInsights(
    competitorAnalysisContext: CompetitorAnalysisContext,
    featureAnalysisContext: FeatureAnalysisContext
  ): Promise<CustomerInsightsResult>;
  refineAnalysis(feedback: string): Promise<CustomerInsightsResult>;
  getContext(): CustomerInsightsContext | null;
  resetContext(): Promise<void>;
  saveContext(): Promise<void>;
  loadContext(projectId: string): Promise<void>;
}

export interface CompetitorAnalysisContext {
  id: string;
  projectId: string;
  marketResearchContextId: string | null;
  competitorProfiles: Competitor[];
  featureMatrices: FeatureMatrix[];
  reviewAnalysis: ReviewAnalysis[];
  pricingAnalysis: PricingAnalysis[];
  marketPositionAnalysis: MarketPositionAnalysis[];
  createdAt: string;
  updatedAt: string;
}

export interface CompetitorProfile {
  id: string;
  name: string;
  description: string;
  coreFeatures: string[];
  strengths: string[];
  weaknesses: string[];
  pricingModel: string;
  marketShare: string;
  customerFeedback: string[];
  recentUpdates: string[];
}

export interface FeatureMatrix {
  feature: string;
  competitors: Array<{
    name: string;
    implementation: string;
    differentiation: string;
  }>;
  marketGap: string;
}

export interface ReviewAnalysis {
  competitor: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  keyThemes: string[];
  strengths: string[];
  weaknesses: string[];
  sampleQuotes: string[];
}

export interface PricingAnalysis {
  competitor: string;
  pricingModel: string;
  pricePoints: string[];
  valueProposition: string;
  differentiation: string;
}

export interface MarketPositionAnalysis {
  competitor: string;
  position: 'leader' | 'challenger' | 'follower' | 'niche';
  marketShare: string;
  growthRate: string;
  keyAdvantages: string[];
  vulnerabilities: string[];
}

export interface CompetitorAnalysisResult {
  competitorProfiles: Competitor[];
  featureMatrices: FeatureMatrix[];
  reviewAnalysis: ReviewAnalysis[];
  pricingAnalysis: PricingAnalysis[];
  marketPositionAnalysis: MarketPositionAnalysis[];
  nextQuestion: string | null;
  isComplete: boolean;
}

export interface CompetitorAnalysisAgent {
  analyzeCompetitors(marketResearchContext: MarketResearchContext): Promise<CompetitorAnalysisResult>;
  refineAnalysis(feedback: string): Promise<CompetitorAnalysisResult>;
  getContext(): CompetitorAnalysisContext | null;
  resetContext(): Promise<void>;
  saveContext(): Promise<void>;
  loadContext(projectId: string): Promise<void>;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  complexity: 'high' | 'medium' | 'low';
  dependencies: string[];
  userValue: string;
  technicalRequirements: string[];
}

export interface ImplementationAnalysis {
  feature: string;
  technicalApproach: string;
  requiredTechnologies: string[];
  developmentEffort: 'high' | 'medium' | 'low';
  potentialChallenges: string[];
  mitigationStrategies: string[];
}

export interface TechnicalAnalysis {
  feature: string;
  architecture: string;
  scalability: 'high' | 'medium' | 'low';
  security: 'high' | 'medium' | 'low';
  performance: 'high' | 'medium' | 'low';
  integrationPoints: string[];
}

export interface FeatureAnalysisContext {
  id: string;
  projectId: string;
  competitorAnalysisContextId: string | null;
  featureComparisonMatrix: FeatureMatrix[];
  capabilityAnalysis: Array<{
    capability: string;
    description: string;
    importance: 'high' | 'medium' | 'low';
    complexity: 'high' | 'medium' | 'low';
    dependencies: string[];
  }>;
  documentationAnalysis: Array<{
    feature: string;
    documentationQuality: 'excellent' | 'good' | 'fair' | 'poor';
    gaps: string[];
    recommendations: string[];
  }>;
  technicalSpecifications: Array<{
    feature: string;
    requirements: string[];
    constraints: string[];
    architecture: string;
  }>;
  integrationAnalysis: Array<{
    feature: string;
    integrationPoints: string[];
    dependencies: string[];
    challenges: string[];
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureAnalysisResult {
  featureComparisonMatrix: FeatureMatrix[];
  capabilityAnalysis: Array<{
    capability: string;
    description: string;
    importance: 'high' | 'medium' | 'low';
    complexity: 'high' | 'medium' | 'low';
    dependencies: string[];
  }>;
  documentationAnalysis: Array<{
    feature: string;
    documentationQuality: 'excellent' | 'good' | 'fair' | 'poor';
    gaps: string[];
    recommendations: string[];
  }>;
  technicalSpecifications: Array<{
    feature: string;
    requirements: string[];
    constraints: string[];
    architecture: string;
  }>;
  integrationAnalysis: Array<{
    feature: string;
    integrationPoints: string[];
    dependencies: string[];
    challenges: string[];
  }>;
  nextQuestion: string | null;
  isComplete: boolean;
}

export interface FeatureAnalysisAgent {
  analyzeFeatures(competitorAnalysisContext: CompetitorAnalysisContext): Promise<FeatureAnalysisResult>;
  refineAnalysis(feedback: string): Promise<FeatureAnalysisResult>;
  getContext(): FeatureAnalysisContext | null;
  resetContext(): Promise<void>;
  saveContext(): Promise<void>;
  loadContext(projectId: string): Promise<void>;
}

export interface SatisfactionMetric {
  metric: string;
  score: number;
  feedback: string[];
}

export interface FeatureRequest {
  id: string;
  description: string;
  priority: string;
  requestedBy: string[];
  useCases: string[];
}

export interface SentimentAnalysis {
  source: string;
  overallSentiment: string;
  keyThemes: string[];
  sentimentScores: {
    theme: string;
    score: number;
  }[];
}

export interface UsagePattern {
  pattern: string;
  frequency: string;
  context: string;
  painPoints: string[];
  opportunities: string[];
}

export interface OpportunityMappingContext {
  id: string;
  projectId: string;
  marketResearchContextId: string | null;
  competitorAnalysisContextId: string | null;
  featureAnalysisContextId: string | null;
  customerInsightsContextId: string | null;
  marketGaps: Array<{
    gap: string;
    description: string;
    potential: 'small' | 'medium' | 'large';
  }>;
  strategicOpportunities: Array<{
    opportunity: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  recommendations: Array<{
    description: string;
    rationale: string;
    priority: 'high' | 'medium' | 'low';
    estimatedEffort: string;
    expectedOutcome: string;
    dependencies: string[];
    risks: string[];
  }>;
  riskAssessment: Array<{
    risk: string;
    impact: 'high' | 'medium' | 'low';
    probability: 'high' | 'medium' | 'low';
    mitigation: string[];
    affectedAreas: string[];
    earlyWarningSigns: string[];
  }>;
  implementationRoadmap: Array<{
    step: string;
    description: string;
    timeline: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface MarketGap {
  id: string;
  description: string;
  size: string;
  urgency: string;
  competitors: string[];
}

export interface StrategicOpportunity {
  id: string;
  description: string;
  marketGapId: string;
  potentialImpact: string;
  requiredResources: string[];
  timeline: string;
}

export interface Recommendation {
  id: string;
  description: string;
  rationale: string;
  priority: string;
  dependencies: string[];
}

export interface RiskAssessment {
  id: string;
  risk: string;
  impact: 'low' | 'medium' | 'high';
  probability: 'low' | 'medium' | 'high';
  mitigation: string[];
  affectedAreas: string[];
  earlyWarningSigns: string[];
}

export interface ImplementationRoadmap {
  phase: string;
  objectives: string[];
  deliverables: string[];
  timeline: string;
  dependencies: string[];
}

export interface OpportunityMappingResult {
  marketGaps: MarketGap[];
  strategicOpportunities: StrategicOpportunity[];
  recommendations: Recommendation[];
  riskAssessment: RiskAssessment[];
  implementationRoadmap: ImplementationRoadmap[];
  nextQuestion: string | null;
  isComplete: boolean;
}

export interface OpportunityMappingAgent {
  mapOpportunities(
    marketResearchContext: MarketResearchContext,
    competitorAnalysisContext: CompetitorAnalysisContext,
    featureAnalysisContext: FeatureAnalysisContext,
    customerInsightsContext: CustomerInsightsContext
  ): Promise<OpportunityMappingResult>;
  refineAnalysis(feedback: string): Promise<OpportunityMappingResult>;
  getContext(): OpportunityMappingContext | null;
  resetContext(): Promise<void>;
  saveContext(): Promise<void>;
  loadContext(projectId: string): Promise<void>;
}

export interface CustomerPersona {
  name: string;
  age: number;
  occupation: string;
  goals: string;
  painPoints: string;
  behaviors: string;
  preferences: string;
  quotes: string;
  usageScenarios: string;
}

export interface CustomerPersonaContext {
  id: string;
  projectId: string;
  personas: CustomerPersona[];
  marketResearchContext?: MarketResearchContext | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPersonaResult {
  personas: CustomerPersona[];
  nextQuestion: string | null;
  isComplete: boolean;
  context: CustomerPersonaContext;
}

export interface CustomerPersonaAgent {
  generatePersonas(marketResearchContext: MarketResearchContext): Promise<CustomerPersonaResult>;
  getContext(): Promise<CustomerPersonaContext | null>;
  resetContext(): Promise<void>;
  loadContext(projectId: string): Promise<void>;
  saveContext(): Promise<void>;
} 