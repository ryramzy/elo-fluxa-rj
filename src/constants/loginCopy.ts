/**
 * Login page copy variants for A/B testing
 * Following low-friction, task-focused UX principles
 */

export const LOGIN_COPY_VARIANTS = {
  A: {
    header: 'Bem-vindo de volta 👋',
    subheader: 'Entre para continuar suas aulas de inglês',
    microTagline: 'Fale inglês de verdade'
  },
  B: {
    header: 'Bem-vindo de volta 👋',
    subheader: 'Continue evoluindo no seu inglês',
    microTagline: 'Fale inglês de verdade'
  },
  C: {
    header: 'Bem-vindo de volta 👋',
    subheader: 'Continue praticando inglês com seu professor nativo 🇺🇸',
    microTagline: 'Fale inglês de verdade'
  }
} as const;

export type LoginCopyVariant = keyof typeof LOGIN_COPY_VARIANTS;

export const DEFAULT_LOGIN_VARIANT: LoginCopyVariant = 'A';
