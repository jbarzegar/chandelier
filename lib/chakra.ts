import { withDefaultColorScheme, extendTheme } from '@chakra-ui/react'
import { ThemingProps } from '@chakra-ui/system'
import { transparentize } from '@chakra-ui/theme-tools'
import { Dict } from '@chakra-ui/utils'

/**
 * Applies a default color scheme and patches styles to improve changing color theme
 */
export const withDefaultColorTheme = (
  colorScheme: ThemingProps['colorScheme'] = 'blue'
) => {
  const patchShadowColor = (t: Dict) => {
    t.shadows.outline = `0 0 0 3px ${transparentize(
      t.colors[colorScheme]['500'],
      0.5
    )(t)}`

    return t
  }
  return extendTheme(withDefaultColorScheme({ colorScheme }), patchShadowColor)
}

export * from '@chakra-ui/react'
