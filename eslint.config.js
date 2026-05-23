import antfu from '@antfu/eslint-config'
import { tanstackConfig } from '@tanstack/eslint-config'

export default antfu({
  ...tanstackConfig,
  rules: {
    'node/prefer-global/process': 'off',
    'no-console': 'off',
    'node/prefer-global/buffer': 'off',
  },
})
