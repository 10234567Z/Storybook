"use client";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import Navbar from "../components/navbar";
import useSignedIn from "@/hooks/useSignedIn";

export default function Login() {
    const [guestRegister, setGuestRegister] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [pending, setPending] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const supabase = createClient();
    const router = useRouter();

    const { signedIn } = useSignedIn();
    useEffect(() => {
        if (signedIn === true) {
            router.push("/");
        } else {
            setLoading(false);
        }
    }, [signedIn]);

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        setPending(true);
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;
        const cpassword = formData.get("cpassword") as string;
        if (password !== cpassword) {
            alert("Passwords do not match");
            setPending(false);
            return;
        }
        const {data: dupeU , error: errorU } = await supabase.from("users").select("*").eq("raw_user_meta_data->>name", username);
        console.log(dupeU)
        if (dupeU !== null) {
            setError("Username already in use");
            setPending(false);
            return;
        }

        const { data , error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: username,
                    display_name: username,
                    posts: 0,
                    comments: 0,
                    likedposts: 0,
                    likedcomments: 0,
                    bio: "",
                    profile_pic: "",
                }
            }
        });
        if (error) {
            setError(error.message);
        } else {
            router.push("/login");
        }
        setPending(false);
    };
    return loading ? (
        <div>
            <h1>Loading...</h1>
        </div>
    ) : (
        <>
            <Navbar signedIn={false} />
            <div className="p-4 px-auto">
                <form
                    onSubmit={handleLogin}
                    className="flex flex-col gap-4 max-w-[420px] m-0 mx-auto text-center"
                >
                    <label className="text-2xl">Email</label>
                    <input
                        type="email"
                        name="email"
                        className="border border-black p-2"
                    />
                    <label className="text-2xl">Username</label>
                    <input
                        type="text"
                        name="username"
                        className="border border-black p-2"
                    />
                    <label className="text-2xl">Password</label>
                    <input
                        type="password"
                        name="password"
                        className="border border-black p-2"
                    />
                    <label className="text-2xl">Confirm Password</label>
                    <input
                        type="password"
                        name="cpassword"
                        className="border border-black p-2"
                    />
                    <hr className="w-full border-1 border-black" />
                    <button
                        onClick={() => setGuestRegister(true)}
                        type="submit"
                        className="bg-blue-900 rounded-md transition-all hover:bg-blue-800 text-white p-2"
                        disabled={pending}
                    >
                        { pending ? "Registering..." : "Register"}
                    </button>
                    <p className="text-red-900">{error}</p>
                    <Link href="/login">
                        <p className="text-blue-900 transition-all hover:text-blue-600 text-center">
                            Already have an account? Login here
                        </p>
                    </Link>
                </form>
            </div>
        </>
    );
}
