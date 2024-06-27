'use client'
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"

export default function useSignedIn() {
    const supabase = createClient()
    const [signedIn, setSignedIn] = useState<boolean>(false)

    useEffect(() => {
        async function checkSession() {
            const { data: { user: session } } = await supabase.auth.getUser()
            if (session) {
                setSignedIn(true)
            } else {
                setSignedIn(false)
            }
        }
        checkSession()
    }, [])

    return { signedIn }
}