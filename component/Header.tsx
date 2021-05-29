import { Box } from "@chakra-ui/react"
import Link from 'next/link'
export function Header(props: HeaderProps) {
    return (
      <div>
        <Link href={props.url}>
          <Box fontWeight="bold" bg="white" w="100%" p={4} color="black">
                tosa.dev
          </Box>
        </Link>
      </div>
    );
}

interface HeaderProps {
  url: string
}
