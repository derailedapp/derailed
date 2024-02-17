import { FormEvent, useState } from "react"
import JSON from "json-bigint"
import { useNavigate } from "@tanstack/react-router"

export default () => {
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    var currentlyInvoking = false

    async function onInvoke(event: FormEvent) {
        event.preventDefault()

        if (currentlyInvoking) {
            return
        }

        currentlyInvoking = true

        // @ts-ignore
        const data = new FormData(event.target)

        const response = await fetch(
            import.meta.env.VITE_API_URL + "/login",
            {
                mode: "cors",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: data.get("username")!,
                    password: data.get("password")!
                })
            }
        )

        const respData = await response.json()

        if (response.status !== 200) {
            console.error(respData)
            setError(respData.message)
        } else {
            localStorage.setItem("token", respData._token)
            await navigate({to: "/channels/@me"})
        }

        currentlyInvoking = false
    }

    return (
        <div className="flex bg-gradient-to-bl bg-[conic-gradient(at_right,_var(--tw-gradient-stops))] from-indigo-200 via-slate-600 to-indigo-200 min-h-screen text-white font-primary">
            <form onSubmit={onInvoke} className="bg-gradient-to-bl from-gray-700 via-gray-900 to-black flex flex-col justify-center text-center gap-6 m-auto rounded-3xl p-20">
                <section>
                    <h1 className="font-light text-3xl max-w-sm">
                        Welcome back to your platform.<br />Welcome back to Derailed.
                    </h1>
                    <i className="text-[#007aff] font-extralight">
                        <a href="/register">
                            Trying to make an account instead?
                        </a>
                    </i>
                </section>
                <section>
                    <input id="username" name="username" className="outline-none placeholder-gray-900 text-gray-900 bg-gradient-to-bl bg-[conic-gradient(at_right,_var(--tw-gradient-stops))] from-indigo-200 via-slate-600 to-indigo-200 outline-1 font-light outline rounded-lg p-2 text-lg" type="text" size={30} placeholder="Username" minLength={3} maxLength={32} required />
                </section>
                <section>
                    <input id="password" name="password" className="outline-none placeholder-gray-900 text-gray-900 bg-gradient-to-bl bg-[conic-gradient(at_right,_var(--tw-gradient-stops))] from-indigo-200 via-slate-600 to-indigo-200 outline-1 font-light outline rounded-lg p-2 text-lg" type="password" size={30} placeholder="Password" minLength={8} maxLength={128} required />
                </section>
                <button type="submit" className="text-xl placeholder-gray-900 text-gray-900 bg-gradient-to-bl bg-[conic-gradient(at_right,_var(--tw-gradient-stops))] from-indigo-200 via-slate-600 to-indigo-200 rounded-2xl py-2 hover:scale-110 transition duration-700 ease-in-out">
                    Login
                </button>
                <p className="text-red-600 font-bold">
                    {error && error}
                </p>
            </form>
        </div>
    )
}