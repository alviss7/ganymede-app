import { LinguiConfig } from '@lingui/conf'

export default {
  locales: ['en', 'es', 'fr', 'pt'],
  sourceLocale: 'fr',
  catalogs: [
    {
      path: '<rootDir>/src/locales/{locale}/messages',
      include: ['src'],
    },
  ],
  format: 'po',
} satisfies LinguiConfig
