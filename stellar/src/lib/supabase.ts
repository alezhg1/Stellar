import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SQL schema for Supabase setup (run this in Supabase SQL Editor)
/*
-- Topics table with hierarchy
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES topics(id),
  weight INTEGER DEFAULT 1,
  fipi_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User diagnostics
CREATE TABLE diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  topic_id UUID REFERENCES topics(id),
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress rollup
CREATE TABLE user_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  predicted_score INTEGER DEFAULT 0,
  topics_mastery JSONB DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable pgvector for semantic search (optional for advanced features)
CREATE EXTENSION IF NOT EXISTS vector;

-- Topic embeddings for semantic similarity
CREATE TABLE topic_embeddings (
  topic_id UUID PRIMARY KEY REFERENCES topics(id),
  embedding vector(1536),
  content_text TEXT
);
*/

export async function saveDiagnosticResult(
  userId: string,
  topicId: string,
  isCorrect: boolean
) {
  const { error } = await supabase.from('diagnostics').insert({
    user_id: userId,
    topic_id: topicId,
    is_correct: isCorrect,
  });
  
  if (error) throw error;
}

export async function getUserProgress(userId: string) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updatePredictedScore(
  userId: string,
  score: number,
  topicsMastery: Record<string, number>
) {
  const { error } = await supabase.from('user_progress').upsert({
    user_id: userId,
    predicted_score: score,
    topics_mastery: topicsMastery,
    last_updated: new Date().toISOString(),
  });
  
  if (error) throw error;
}
