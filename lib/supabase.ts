import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Custom error class para erros da API
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Helper para lidar com erros do Supabase
 */
export async function handleSupabaseError<T>(
  promise: Promise<{ data: T | null; error: any }>
): Promise<T> {
  const { data, error } = await promise;

  if (error) {
    console.error('Supabase Error:', error);
    throw new ApiError(error.code || 'UNKNOWN_ERROR', error.message, error);
  }

  if (!data) {
    throw new ApiError('NO_DATA', 'Nenhum dado retornado');
  }

  return data;
}

/**
 * Helper para queries que podem retornar null (não é erro)
 */
export async function handleSupabaseQuery<T>(
  promise: Promise<{ data: T | null; error: any }>
): Promise<T | null> {
  const { data, error } = await promise;

  if (error) {
    console.error('Supabase Error:', error);
    throw new ApiError(error.code || 'UNKNOWN_ERROR', error.message, error);
  }

  return data;
}
