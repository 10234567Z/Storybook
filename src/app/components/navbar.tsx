'use client'
import Link from "next/link";
import Image from "next/image";
import './navbar.css';
import React, { useEffect, useState } from "react";
import useSignedIn from "@/hooks/useSignedIn";
import { createClient } from "@/utils/supabase/client";
interface NavbarProps {
    signedIn: boolean
}

const Navbar: React.FC<NavbarProps> = ({ signedIn }) => {
    const TOP_OFFSET = 10;
    const [showBackground, setShowBackground] = useState(false)
    const supabase = createClient()
    useEffect(() => {
        if (window.scrollY >= TOP_OFFSET) setShowBackground(true)
        const handleScroll = () => {
            if (window.scrollY >= TOP_OFFSET) {
                setShowBackground(true)
            } else {
                setShowBackground(false)
            }
        }
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        }
    }, []);

    async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const searchQuery = formData.get('q') as string
        window.location.href = `/search?q=${searchQuery}`
    }
    return (
        <>
            <nav className={`text-blue-900 py-1 mt-[10px] flex flex-col gap-2 text-xs sm:text-sm sticky top-0 z-10 transition-all duration-300 pb-4`} style={{ backgroundColor: showBackground ? "#e2e8f0" : undefined }}>
                <div className="flex flex-row justify-around items-center">
                    <Link href="/" className="hidden sm:inline-block ">
                        <Image src="/logo.png" alt="Storybook Logo" width={125} height={125} className=" hover:border transition-all hover:border-black border-solid p-2" />
                    </Link>
                    <div className={`flex flex-row gap-3 justify-center items-center px-2 font-normal`}>
                        {
                            signedIn && 
                            <form action="/search" method="get" className="flex flex-row gap-2">
                                <input type="text" name="q" placeholder="Search" className="p-2 rounded-md outline-none w-[75px] md:w-auto" />
                                <button type="submit" className="p-2 md:px-4 rounded-md bg-slate-800 text-white transition-all hover:bg-slate-700">Search</button>
                            </form>
                        }
                        <Link href="/">
                            <button className="m-2 lg:text-3xl md:text-2xl sm:text-xl text-xs">
                                <p className="navControl">Home</p>
                            </button>
                        </Link>
                        {
                            signedIn ? (
                                <>
                                    <Link href="/myprofile">
                                        <button className="m-2 lg:text-3xl md:text-2xl sm:text-xl text-xs">
                                            <p className="navControl">My Profile</p>
                                        </button>
                                    </Link>
                                    <Link href="/logout">
                                        <button className="m-2 lg:text-3xl md:text-2xl sm:text-xl text-xs">
                                            <p className="navControl">Logout</p>
                                        </button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <button className="m-2 lg:text-3xl md:text-2xl sm:text-xl text-xs">
                                            <p className="navControl">Login</p>
                                        </button>
                                    </Link>
                                    <Link href="/register">
                                        <button className="m-2 lg:text-3xl md:text-2xl sm:text-xl text-xs">
                                            <p className="navControl">Register</p>
                                        </button>
                                    </Link>
                                </>
                            )
                        }
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Navbar;