import { Box } from "@chakra-ui/react"
import Link from 'next/link'
export function Header(props: HeaderProps) {
    return (
      <div>
        <Box fontWeight="bold" bg="white" w="100%" p={4} color="black">
            <Link href={props.url}>
              TosaLab
            </Link>
        </Box>
      </div>
    );
}

interface HeaderProps {
  url: string
}
