import type { AppProps } from 'next/app'
import { ChakraProvider, extendTheme, withDefaultColorTheme } from 'lib/chakra'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={extendTheme(withDefaultColorTheme('purple'))}>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}
export default MyApp
