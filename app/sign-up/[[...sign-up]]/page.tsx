import { SignUp } from "@clerk/nextjs";
import { Shield } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#080b12] flex items-center justify-center px-6">
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="relative flex flex-col items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="font-bold text-xl tracking-tight">
            Cyber<span className="text-cyan-400">Quest</span> <span className="text-slate-400 font-normal text-base">AI</span>
          </span>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
