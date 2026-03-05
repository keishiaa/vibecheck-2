import { login, signup, signInWithGoogle } from './actions'
import Image from 'next/image'

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFBF7] text-[#3C3833] selection:bg-[#D1C3B4] selection:text-[#3C3833] p-6 relative overflow-hidden">

            {/* Soft background glow for aesthetics */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#E8DDD5] rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-in fade-in duration-1000"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#D1C3B4] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-in fade-in duration-1000 delay-300"></div>

            <div className="w-full max-w-sm z-10 animate-in slide-in-from-bottom-8 fade-in duration-700">
                <div className="flex justify-center mb-8">
                    <Image src="/vibecheck-logo.jpg" alt="VibeCheck" width={247} height={100} priority className="object-contain w-auto h-12 mix-blend-multiply drop-shadow-sm" />
                </div>

                <div className="p-8 bg-white/70 backdrop-blur-2xl border border-[#EAE5DF]/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <h2 className="mb-8 text-2xl font-light tracking-tight text-center text-[#3C3833]">
                        Welcome back
                    </h2>

                    <form action={signInWithGoogle}>
                        <button
                            type="submit"
                            className="flex items-center justify-center w-full px-5 py-3.5 text-sm font-medium transition-all active:scale-95 bg-white border border-[#EAE5DF] text-[#3C3833] rounded-xl hover:bg-[#FCFAF8] hover:border-[#D1C3B4] shadow-sm group"
                        >
                            <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>
                    </form>

                    <div className="flex items-center my-6">
                        <div className="flex-grow border-t border-[#EAE5DF]/60"></div>
                        <span className="flex-shrink-0 mx-4 text-[10px] sm:text-xs font-semibold tracking-widest text-[#8A827A] uppercase">Or stay classic</span>
                        <div className="flex-grow border-t border-[#EAE5DF]/60"></div>
                    </div>

                    <form className="flex flex-col gap-5">
                        <div className="flex flex-col gap-4">
                            <div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full px-4 py-3.5 text-sm bg-white/50 border border-[#EAE5DF] rounded-xl focus:outline-none focus:border-[#A69B90] focus:ring-4 focus:ring-[#D1C3B4]/10 transition-all placeholder:text-[#8A827A]/50 text-[#3C3833]"
                                    placeholder="Email address"
                                />
                            </div>

                            <div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full px-4 py-3.5 text-sm bg-white/50 border border-[#EAE5DF] rounded-xl focus:outline-none focus:border-[#A69B90] focus:ring-4 focus:ring-[#D1C3B4]/10 transition-all placeholder:text-[#8A827A]/50 text-[#3C3833]"
                                    placeholder="Password"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-2">
                            <button
                                formAction={login}
                                className="w-full px-5 py-3.5 text-sm font-medium transition-all active:scale-95 bg-[#D1C3B4] text-[#3C3833] rounded-xl hover:bg-[#C2B2A1] shadow-sm"
                            >
                                Log in
                            </button>
                            <button
                                formAction={signup}
                                className="w-full px-5 py-3.5 text-sm font-medium transition-all active:scale-95 bg-transparent border border-[#EAE5DF] text-[#8A827A] rounded-xl hover:bg-[#FCFAF8] hover:text-[#3C3833]"
                            >
                                Create an account
                            </button>
                        </div>
                    </form>
                </div>

                <footer className="w-full text-center py-8 text-[11px] text-[#8A827A]/70 group flex justify-center items-center gap-1 font-medium mt-4">
                    vibecoded by keishia
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">✨</span>
                </footer>
            </div>
        </div>
    )
}
