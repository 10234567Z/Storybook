"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../components/navbar";

export default function Page() {
  const supabase = createClient();

  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>({});

  const router = useRouter();

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

  return loading ? (
    <div>
      <h1>Loading...</h1>
    </div>
  ) : (
    <>
      <Navbar signedIn={signedIn} />
      {signedIn ? (
        <div className="w-screen flex flex-col justify-center items-center gap-8">
            <h1 className="text-3xl">Welcome to your profile</h1>
            <p>Here you can view your profile information and update it.</p>
        </div>
      ) : (
        <>
          <h1>Redirecting...</h1>
        </>
      )}
    </>
  );
}
