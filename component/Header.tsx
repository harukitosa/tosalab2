import { Box, Flex } from "@chakra-ui/react"
import Link from 'next/link'
export function Header(props: HeaderProps) {
  return (
    <>
      <Flex as="nav">
        <Link href={props.url}>
          <a>
            <Box
              fontWeight="bold"
              bg="blue.800"
              w="100%"
              p={4}
              pr={6}
              color="white"
            >
              tosa.dev
            </Box>
          </a>
        </Link>
      </Flex>
      <Box h="42"></Box>
    </>
  );
}

interface HeaderProps {
  url: string
}
