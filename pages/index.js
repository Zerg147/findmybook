import Head from "next/head";
import Image from "next/image";
import localFont from "next/font/local";
import styles from "@/styles/Home.module.css";
import BooksList from "@/components/BooksList";


export default function Home() {
  return (
    <>
      <Head>
        <title>Find Your Book!</title>
        <meta name="description" content="For the Geeks, by the Geeks" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <BooksList/>
    </>
  );
}
