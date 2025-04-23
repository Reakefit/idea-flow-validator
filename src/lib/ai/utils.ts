import { Persona } from './types';
import { CustomerPersona } from '@/types';

export function convertToCustomerPersona(persona: Persona, projectId: string): CustomerPersona {
  return {
    id: persona.id,
    project_id: projectId,
    name: persona.name,
    description: persona.description,
    demographics: {
      age: persona.demographics.age,
      gender: persona.demographics.gender,
      location: persona.demographics.location,
      occupation: persona.demographics.occupation,
      income: persona.demographics.income,
      education: persona.demographics.education
    },
    pain_points: persona.painPoints,
    goals: persona.goals,
    behaviors: persona.behaviors,
    created_at: persona.createdAt,
    updated_at: persona.updatedAt
  };
}

export function convertToPersona(data: any): Persona {
  return {
    id: data.id,
    projectId: data.project_id,
    name: data.name,
    description: data.description,
    demographics: {
      age: data.demographics.age,
      gender: data.demographics.gender,
      location: data.demographics.location,
      occupation: data.demographics.occupation,
      income: data.demographics.income,
      education: data.demographics.education
    },
    painPoints: data.pain_points,
    goals: data.goals,
    behaviors: data.behaviors,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export function convertFromPersona(persona: Persona): any {
  return {
    id: persona.id,
    project_id: persona.projectId,
    name: persona.name,
    description: persona.description,
    demographics: {
      age: persona.demographics.age,
      gender: persona.demographics.gender,
      location: persona.demographics.location,
      occupation: persona.demographics.occupation,
      income: persona.demographics.income,
      education: persona.demographics.education
    },
    pain_points: persona.painPoints,
    goals: persona.goals,
    behaviors: persona.behaviors,
    created_at: persona.createdAt,
    updated_at: persona.updatedAt
  };
}

export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    return date;
  }
  return date.toISOString();
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

export function validatePersona(persona: Persona): boolean {
  return (
    typeof persona.id === 'string' &&
    typeof persona.projectId === 'string' &&
    typeof persona.name === 'string' &&
    typeof persona.description === 'string' &&
    typeof persona.demographics.age === 'string' &&
    typeof persona.demographics.gender === 'string' &&
    typeof persona.demographics.location === 'string' &&
    typeof persona.demographics.occupation === 'string' &&
    typeof persona.demographics.income === 'string' &&
    typeof persona.demographics.education === 'string' &&
    Array.isArray(persona.painPoints) &&
    Array.isArray(persona.goals) &&
    Array.isArray(persona.behaviors) &&
    typeof persona.createdAt === 'string' &&
    typeof persona.updatedAt === 'string'
  );
}

export class AgentError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: any
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

export function handleAgentError(error: unknown): never {
  if (error instanceof AgentError) {
    throw error;
  }
  if (error instanceof Error) {
    throw new AgentError(error.message, 'UNKNOWN_ERROR', { originalError: error });
  }
  throw new AgentError('An unknown error occurred', 'UNKNOWN_ERROR', { error });
}

export function createEmptyContext<T extends { id: string; projectId: string; createdAt: string; updatedAt: string }>(
  projectId: string
): T {
  return {
    id: crypto.randomUUID(),
    projectId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as T;
}

export function updateContextTimestamp<T extends { updatedAt: string }>(context: T): T {
  return {
    ...context,
    updatedAt: new Date().toISOString()
  };
}
