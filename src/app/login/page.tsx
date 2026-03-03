import { login, signup, signInWithGoogle } from './actions'

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFBF7] text-[#3C3833]">
            <div className="w-full max-w-sm p-8 bg-white border border-[#EAE5DF] rounded-2xl shadow-xl">
                <h2 className="mb-6 text-2xl font-semibold text-center text-[#3C3833]">Welcome to VibeCheck</h2>

                <form action={signInWithGoogle}>
                    <button
                        type="submit"
                        className="flex items-center justify-center w-full px-5 py-3 text-sm font-medium transition-colors bg-white border border-[#EAE5DF] text-[#3C3833] rounded-lg hover:bg-[#FCFAF8] shadow-sm"
                    >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>
                </form>

                <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-[#EAE5DF]"></div>
                    <span className="flex-shrink-0 mx-4 text-xs tracking-wider text-[#8A827A] uppercase">Or</span>
                    <div className="flex-grow border-t border-[#EAE5DF]"></div>
                </div>

                <form className="flex flex-col gap-4">
                    <div>
                        <label className="block mb-1 text-sm text-[#8A827A]" htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-3 text-sm bg-[#FCFAF8] border border-[#EAE5DF] rounded-lg focus:outline-none focus:border-[#A69B90] transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm text-[#8A827A]" htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-3 text-sm bg-[#FCFAF8] border border-[#EAE5DF] rounded-lg focus:outline-none focus:border-[#A69B90] transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                        <button
                            formAction={login}
                            className="w-full px-5 py-3 text-sm font-medium transition-all bg-[#D1C3B4] text-[#3C3833] rounded-lg hover:bg-[#C2B2A1]"
                        >
                            Log in
                        </button>
                        <button
                            formAction={signup}
                            className="w-full px-5 py-3 text-sm font-medium transition-colors bg-white border border-[#EAE5DF] text-[#8A827A] rounded-lg hover:bg-[#FCFAF8]"
                        >
                            Sign up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
