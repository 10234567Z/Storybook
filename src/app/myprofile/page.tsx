"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import MainProfileInfo from "../components/mainProfileInformation";

export default function Page() {
  const supabase = createClient();

  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>({});
  const [posts, setPosts] = useState<any[]>([]);

  const router = useRouter();

  async function getPosts() {
    const { data, error } = await supabase.from("posts").select("*").eq('user_id' , currentUser.id).order("i_at", { ascending: false });
    if (error) {
      console.error(error);
    } else {
      setPosts(data);
    }
  }

  useEffect(() => {
    async function checkSession() {
      const {
        data: { user: session },
      } = await supabase.auth.getUser();
      if (session) {
        setSignedIn(true);
        setLoading(false);
        setCurrentUser(session);
      } else {
        setSignedIn(false);
        router.push("/login");
      }
    }
    checkSession();
  }, []);

  useEffect(() => {
    if(currentUser.id){
      getPosts();
    }
  }, [currentUser])

  return loading ? (
    <div>
      <h1>Loading...</h1>
    </div>
  ) : (
    <>
      <Navbar signedIn={signedIn} />
      {signedIn ? (
        <div className="w-screen flex flex-col justify-center items-center gap-8">
          <MainProfileInfo user={currentUser} />
        </div>
      ) : (
        <>
          <h1>Redirecting...</h1>
        </>
      )}
    </>
  );
}
