import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from "@chakra-ui/react"
import { Header } from "../component/Header"

function MyApp({ Component, pageProps }: AppProps) {
  return (
      <ChakraProvider>
        <Header/>
        <Component {...pageProps} />
      </ChakraProvider>
  );
}

export default MyApp
