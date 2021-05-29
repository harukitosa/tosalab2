import Head from 'next/head'
import matter from "gray-matter"
import fs from "fs"
import { Container, Box, Text, Tag } from "@chakra-ui/react";
import Link from 'next/link';
import {Post, HomePageProps} from "../types/type";
import { getAllPostsData } from '../utils/getPostsData';

export default function Home(props: HomePageProps) {
  return (
    <div>
      <Head>
        <title>TosaLab</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {props.contents.map(item => {
            return <PostItem 
                {...item}
                key={"post-key-" + item.data.slug}
            />;
        })}
      </main>
      <footer>

      </footer>
    </div>
  )
}

function PostItem(props: Post) {
  return (
    <Box w="100vw" key={props.data.slug}>
      <Link href={"/posts/" + props.data.slug}>
        <Container padding="2">
          <Text color="gray.600">{props.data.date}</Text>
          <Text fontWeight="bold" _hover={{ color: "#1A0DAB"}}>{props.data.title}</Text>
          <Text>{props.data.description}</Text>
          {props.data.tags != null && props.data.tags.map(item => {
            return <Tag marginRight="1" key={item}>{item}</Tag>
          })}
        </Container>           
      </Link>
    </Box>
  );
}


export async function getStaticProps() {
  const path = "./posts/";
  const contents = getAllPostsData(path);
  return {
      props: {
        contents
      }
  }
}