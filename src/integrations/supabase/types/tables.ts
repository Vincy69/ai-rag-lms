import { Json } from './json';
import { UserRole } from './enums';

export interface Tables {
  block_enrollments: {
    Row: {
      block_id: string
      completed_at: string | null
      enrolled_at: string
      id: string
      progress: number | null
      status: string
      user_id: string
    }
    Insert: {
      block_id: string
      completed_at?: string | null
      enrolled_at?: string
      id?: string
      progress?: number | null
      status?: string
      user_id: string
    }
    Update: {
      block_id?: string
      completed_at?: string | null
      enrolled_at?: string
      id?: string
      progress?: number | null
      status?: string
      user_id?: string
    }
    Relationships: [
      {
        foreignKeyName: "block_enrollments_block_id_fkey"
        columns: ["block_id"]
        isOneToOne: false
        referencedRelation: "skill_blocks"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "block_enrollments_user_id_fkey"
        columns: ["user_id"]
        isOneToOne: false
        referencedRelation: "profiles"
        referencedColumns: ["id"]
      }
    ]
  }
  categories: {
    Row: {
      color: string
      created_at: string
      id: string
      name: string
    }
    Insert: {
      color: string
      created_at?: string
      id?: string
      name: string
    }
    Update: {
      color?: string
      created_at?: string
      id?: string
      name?: string
    }
    Relationships: []
  }
  chat_history: {
    Row: {
      answer: string
      created_at: string
      feedback: string | null
      feedback_embedding: string | null
      id: string
      question: string
      score: number
      user_id: string | null
    }
    Insert: {
      answer: string
      created_at?: string
      feedback?: string | null
      feedback_embedding?: string | null
      id?: string
      question: string
      score?: number
      user_id?: string | null
    }
    Update: {
      answer?: string
      created_at?: string
      feedback?: string | null
      feedback_embedding?: string | null
      id?: string
      question?: string
      score?: number
      user_id?: string | null
    }
    Relationships: [
      {
        foreignKeyName: "chat_history_user_id_fkey"
        columns: ["user_id"]
        isOneToOne: false
        referencedRelation: "profiles"
        referencedColumns: ["id"]
      }
    ]
  }
  documents: {
    Row: {
      category: string
      content_type: string
      created_at: string | null
      embedding: string | null
      file_path: string
      id: string
      name: string
      size: number
      updated_at: string | null
    }
    Insert: {
      category: string
      content_type: string
      created_at?: string | null
      embedding?: string | null
      file_path: string
      id?: string
      name: string
      size: number
      updated_at?: string | null
    }
    Update: {
      category?: string
      content_type?: string
      created_at?: string | null
      embedding?: string | null
      file_path?: string
      id?: string
      name?: string
      size?: number
      updated_at?: string | null
    }
    Relationships: [
      {
        foreignKeyName: "fk_category"
        columns: ["category"]
        isOneToOne: false
        referencedRelation: "categories"
        referencedColumns: ["name"]
      }
    ]
  }
  formation_enrollments: {
    Row: {
      completed_at: string | null
      enrolled_at: string
      formation_id: string
      id: string
      progress: number | null
      status: string
      user_id: string
    }
    Insert: {
      completed_at?: string | null
      enrolled_at?: string
      formation_id: string
      id?: string
      progress?: number | null
      status?: string
      user_id: string
    }
    Update: {
      completed_at?: string | null
      enrolled_at?: string
      formation_id?: string
      id?: string
      progress?: number | null
      status?: string
      user_id?: string
    }
    Relationships: [
      {
        foreignKeyName: "formation_enrollments_formation_id_fkey"
        columns: ["formation_id"]
        isOneToOne: false
        referencedRelation: "formations"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "formation_enrollments_user_id_fkey"
        columns: ["user_id"]
        isOneToOne: false
        referencedRelation: "profiles"
        referencedColumns: ["id"]
      }
    ]
  }
  formations: {
    Row: {
      category: string
      created_at: string
      description: string | null
      id: string
      name: string
      updated_at: string
    }
    Insert: {
      category: string
      created_at?: string
      description?: string | null
      id?: string
      name: string
      updated_at?: string
    }
    Update: {
      category?: string
      created_at?: string
      description?: string | null
      id?: string
      name?: string
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: "formations_category_fkey"
        columns: ["category"]
        isOneToOne: false
        referencedRelation: "categories"
        referencedColumns: ["name"]
      }
    ]
  }
  profiles: {
    Row: {
      created_at: string
      id: string
      role: UserRole
    }
    Insert: {
      created_at?: string
      id: string
      role?: UserRole
    }
    Update: {
      created_at?: string
      id?: string
      role?: UserRole
    }
    Relationships: []
  }
  skill_blocks: {
    Row: {
      created_at: string
      description: string | null
      formation_id: string
      id: string
      name: string
      order_index: number
      updated_at: string
    }
    Insert: {
      created_at?: string
      description?: string | null
      formation_id: string
      id?: string
      name: string
      order_index: number
      updated_at?: string
    }
    Update: {
      created_at?: string
      description?: string | null
      formation_id?: string
      id?: string
      name?: string
      order_index?: number
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: "skill_blocks_formation_id_fkey"
        columns: ["formation_id"]
        isOneToOne: false
        referencedRelation: "formations"
        referencedColumns: ["id"]
      }
    ]
  }
  skill_progress: {
    Row: {
      attempts: number | null
      created_at: string
      id: string
      last_attempt_at: string | null
      level: number | null
      score: number | null
      skill_id: string
      updated_at: string
      user_id: string
    }
    Insert: {
      attempts?: number | null
      created_at?: string
      id?: string
      last_attempt_at?: string | null
      level?: number | null
      score?: number | null
      skill_id: string
      updated_at?: string
      user_id: string
    }
    Update: {
      attempts?: number | null
      created_at?: string
      id?: string
      last_attempt_at?: string | null
      level?: number | null
      score?: number | null
      skill_id?: string
      updated_at?: string
      user_id?: string
    }
    Relationships: [
      {
        foreignKeyName: "skill_progress_skill_id_fkey"
        columns: ["skill_id"]
        isOneToOne: false
        referencedRelation: "skills"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "skill_progress_user_id_fkey"
        columns: ["user_id"]
        isOneToOne: false
        referencedRelation: "profiles"
        referencedColumns: ["id"]
      }
    ]
  }
  skills: {
    Row: {
      block_id: string
      created_at: string
      description: string | null
      id: string
      name: string
      order_index: number
      updated_at: string
    }
    Insert: {
      block_id: string
      created_at?: string
      description?: string | null
      id?: string
      name: string
      order_index: number
      updated_at?: string
    }
    Update: {
      block_id?: string
      created_at?: string
      description?: string | null
      id?: string
      name?: string
      order_index?: number
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: "skills_block_id_fkey"
        columns: ["block_id"]
        isOneToOne: false
        referencedRelation: "skill_blocks"
        referencedColumns: ["id"]
      }
    ]
  }
}