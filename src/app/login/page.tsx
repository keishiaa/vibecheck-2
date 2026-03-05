import { login, signup, signInWithGoogle } from './actions'
import Image from 'next/image'

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFBF7] text-[#3C3833] selection:bg-[#3C3833] selection:text-[#FDFBF7] p-6 relative overflow-hidden">

            {/* Elegant Atmospheric Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[radial-gradient(circle,rgba(209,195,180,0.3)_0%,transparent_70%)] animate-pulse" style={{ animationDuration: '8s' }}></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-[radial-gradient(circle,rgba(232,221,213,0.5)_0%,transparent_70%)] animate-pulse" style={{ animationDuration: '12s' }}></div>
                <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(255,255,255,0.8)_0%,transparent_70%)]"></div>
            </div>

            <div className="w-full max-w-[400px] z-10 animate-in slide-in-from-bottom-8 fade-in duration-1000">

                {/* Logo enclosed in a pristine white physical pill to mask the JPG background */}
                <div className="flex justify-center mb-10 relative">
                    <div className="absolute inset-0 bg-white/50 blur-xl opacity-60 rounded-full"></div>
                    <div className="bg-white px-8 py-4 sm:py-5 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-[#EAE5DF]/30 relative z-10 flex justify-center items-center w-full max-w-[260px]">
                        <Image src="/vibecheck-logo.jpg" alt="VibeCheck" width={247} height={100} priority className="object-contain w-full h-auto max-h-8 sm:max-h-9" />
                    </div>
                </div>

                <div className="p-8 sm:p-10 bg-white/70 backdrop-blur-3xl border border-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
                    <h2 className="mb-8 text-2xl font-light tracking-tight text-center text-[#3C3833]">
                        Welcome to the club.
                    </h2>

                    <form action={signInWithGoogle}>
                        <button
                            type="submit"
                            className="flex items-center justify-center w-full px-5 py-4 text-sm font-medium transition-all active:scale-95 bg-white border border-[#EAE5DF] text-[#3C3833] rounded-2xl hover:bg-[#FCFAF8] hover:border-[#D1C3B4] shadow-sm group"
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
                        <div className="flex-grow border-t border-[#EAE5DF]/80"></div>
                        <span className="flex-shrink-0 mx-4 text-[10px] sm:text-xs font-semibold tracking-widest text-[#8A827A] uppercase">Or stay classic</span>
                        <div className="flex-grow border-t border-[#EAE5DF]/80"></div>
                    </div>

                    <form className="flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            <div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full px-5 py-4 text-sm bg-white border border-[#EAE5DF]/80 rounded-2xl focus:outline-none focus:border-[#3C3833] focus:ring-1 focus:ring-[#3C3833] transition-all placeholder:text-[#8A827A]/50 text-[#3C3833]"
                                    placeholder="Email address"
                                />
                            </div>

                            <div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full px-5 py-4 text-sm bg-white border border-[#EAE5DF]/80 rounded-2xl focus:outline-none focus:border-[#3C3833] focus:ring-1 focus:ring-[#3C3833] transition-all placeholder:text-[#8A827A]/50 text-[#3C3833]"
                                    placeholder="Password"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-2">
                            <button
                                formAction={login}
                                className="w-full px-5 py-4 text-sm font-semibold tracking-wide transition-all active:scale-95 bg-[#3C3833] text-white rounded-2xl hover:bg-black shadow-[0_8px_20px_rgba(60,56,51,0.15)]"
                            >
                                Log in
                            </button>
                            <button
                                formAction={signup}
                                className="w-full px-5 py-4 text-sm font-medium transition-all active:scale-95 bg-transparent border border-[#EAE5DF] text-[#8A827A] rounded-2xl hover:bg-white hover:text-[#3C3833] shadow-sm"
                            >
                                Create an account
                            </button>
                        </div>
                    </form>
                </div>

                <footer className="w-full text-center py-8 text-[11px] text-[#8A827A]/70 group flex justify-center items-center gap-1 font-medium mt-6">
                    vibecoded by keishia
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">✨</span>
                </footer>
            </div>
        </div>
    )
}
