import { z } from 'zod';

/**
 * Gera um slug amigável a partir de um texto
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por hífens
    .replace(/^-+|-+$/g, ''); // Remove hífens do início e fim
};

/**
 * Schema de validação para slug
 */
export const slugSchema = z
  .string()
  .min(1, 'Slug não pode estar vazio')
  .max(100, 'Slug deve ter no máximo 100 caracteres')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug deve conter apenas letras minúsculas, números e hífens (sem espaços ou acentos)')
  .refine((slug) => !slug.startsWith('-') && !slug.endsWith('-'), {
    message: 'Slug não pode começar ou terminar com hífen'
  });

/**
 * Valida se um slug é válido
 */
export const validateSlug = (slug: string): { valid: boolean; error?: string } => {
  try {
    slugSchema.parse(slug);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: 'Erro ao validar slug' };
  }
};
