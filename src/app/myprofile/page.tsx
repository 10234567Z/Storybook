"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import Navbar from "../components/navbar";
import MainProfileInfo from "../components/mainProfileInformation";
import { Drawer, useMediaQuery } from "@mui/material";
import Image from "next/image";
import moment from "moment";

export default function Page() {
  const supabase = createClient();

  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>({});
  const [openPostDrawer, setOpenPostDrawer] = useState<boolean>(false);
  const [posts, setPosts] = useState<any[]>([]);

  const router = useRouter();

  const isMobile = useMediaQuery('(max-width: 768px)');

  async function getPosts() {
    const { data, error } = await supabase.from("posts").select("*").eq('user_id', currentUser.id).order("i_at", { ascending: false });
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
    if (currentUser.id) {
      getPosts();
    }
  }, [currentUser])

  function handleOpenPostDrawer() {
    setOpenPostDrawer(!openPostDrawer)
  }

  async function handlePost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const caption = formData.get("caption") as string;
    const content = formData.get("content") as string;
    const { data, error } = await supabase.from("posts").insert({ caption: caption, content: content, user_id: currentUser.id, date: moment().format('MMMM Do YYYY, h:mm:ss a'), i_at: new Date() });
    if (error) {
      console.error(error);
    } else {
      setOpenPostDrawer(false);
      router.push("/myprofile");
    }
  }

  return loading ? (
    <div>
      <h1>Loading...</h1>
    </div>
  ) : (
    <>
      <Drawer anchor="right" open={openPostDrawer} onClose={handleOpenPostDrawer} PaperProps={{
        sx: {
          width: isMobile ? "100vw" : "50vw",
        }
      }}>
        <button onClick={handleOpenPostDrawer} className="flex flex-row justify-start">
          <Image src="/comments/close.svg" width={35} height={35} alt="CloseLogo" className=" m-4 hover:bg-slate-200 focus:bg-slate-400 rounded-full transition-all" />
        </button>
        <form className="flex flex-col gap-4 p-4" onSubmit={handlePost}>
          <h1 className="text-2xl font-bold">Create Post</h1>
          <input type="text" name="caption" placeholder="Caption" className="p-2 rounded-md border border-slate-800" minLength={1} required />
          <textarea name="content" placeholder="Content" className="p-2 rounded-md border border-slate-800 resize-none h-[500px]" minLength={10} required />
          <button type="submit" className="p-2 px-6 rounded-md bg-slate-800 text-white transition-all hover:bg-slate-700" >Post</button>
        </form>
      </Drawer>
      <Navbar signedIn={signedIn} />
      {signedIn ? (
        <div className="w-screen flex flex-col justify-center items-center gap-8">
          <MainProfileInfo user={currentUser} />
          <button onClick={handleOpenPostDrawer} className=" p-4 px-6 rounded-md bg-slate-800 text-white transition-all hover:bg-slate-700">Create Post</button>
        </div>
      ) : (
        <>
          <h1>Redirecting...</h1>
        </>
      )}
    </>
  );
}
