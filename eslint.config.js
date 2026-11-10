import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),

  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },

  {
    // Funções serverless da pasta api/ executam no Node.js
    files: ['api/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    // Configuração do servidor Node.js do projeto Cidade_sem_buracos
    files: ['mock-projects/Cidade_sem_buracos-main/server.js'],
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    // Permite variáveis de erro não utilizadas que começam com _
    files: [
      'mock-projects/Cidade_sem_buracos-main/painel/acesso.js',
      'mock-projects/Cidade_sem_buracos-main/painel/painel.js',
    ],
    rules: {
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^[A-Z_]',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
])