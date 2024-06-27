"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "./components/navbar";
import { useCookies } from "next-client-cookies";
import PostCard from "./components/postCard";

export default function Page() {
  const supabase = createClient();

  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [user, setUser] = useState<any>();

  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const {
        data: { user: session },
      } = await supabase.auth.getUser();
      if (session) {
        setSignedIn(true);
        setLoading(false);
        setUser(session);
      } else {
        setSignedIn(false);
        router.push("/login");
      }
    }

    async function getRandomPosts() {
      const { data, error } = await supabase.from("posts").select("*").order("i_at", { ascending: false }).limit(10);
      if (error) {
        console.error(error);
      } else {
        setPosts(data);
      }
    }

    getRandomPosts();
    checkSession();
  }, []);

  return loading ? (
    <div>
      <h1>Loading...</h1>
    </div>
  ) : (
    <>
      <Navbar signedIn={signedIn} />
      {signedIn ? (
        <div className="w-screen flex flex-col justify-center items-center gap-8">
          {posts.map((post) => (
            <PostCard key={post.post_id} post={post} />
          ))}
        </div>
      ) : (
        <>
          <h1>Redirecting...</h1>
        </>
      )}
    </>
  );
}
