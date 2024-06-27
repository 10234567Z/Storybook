import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function Logout() {
    const createCookies = cookies()
    const supabase = createClient(createCookies)
    const { error } = await supabase.auth.signOut()
    if (error) {
        console.error(error)
    }
    else{
        redirect('/login')
    }

    return (
        <> Logging out....</>
    )
}