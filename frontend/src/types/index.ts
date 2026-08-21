export interface User {
  id: string;
  email: string;
  username: string;
  name?: string | null;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TechStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'MASTERED' | 'ON_HOLD';

export interface Technology {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  category?: string | null;
  status: TechStatus;
  progress: number;
  startDate?: string | null;
  targetDate?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    goals: number;
    resources: number;
    sessions: number;
    notes: number;
  };
}

export type GoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';

export interface Goal {
  id: string;
  userId: string;
  technologyId?: string | null;
  title: string;
  description?: string | null;
  targetMetric?: string | null;
  progress: number;
  deadline?: string | null;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  technology?: {
    id: string;
    name: string;
    status?: TechStatus;
    category?: string | null;
  } | null;
}

export type ResourceType =
  | 'COURSE'
  | 'DOCUMENTATION'
  | 'BOOK'
  | 'TUTORIAL'
  | 'VIDEO'
  | 'ARTICLE'
  | 'OTHER';

export type ResourceStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';

export interface LearningResource {
  id: string;
  userId: string;
  technologyId?: string | null;
  title: string;
  description?: string | null;
  url: string;
  type: ResourceType;
  status: ResourceStatus;
  progress: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  technology?: {
    id: string;
    name: string;
  } | null;
}

export interface LearningSession {
  id: string;
  userId: string;
  technologyId?: string | null;
  durationMinutes: number;
  topicsCovered: string;
  notes?: string | null;
  sessionDate: string;
  createdAt: string;
  technology?: {
    id: string;
    name: string;
    category?: string | null;
  } | null;
}

export interface Note {
  id: string;
  userId: string;
  technologyId?: string | null;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  technology?: {
    id: string;
    name: string;
  } | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  services: {
    api: string;
    database: {
      status: string;
      latencyMs: number;
    };
  };
}
