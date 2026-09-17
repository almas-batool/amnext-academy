import Link from "next/link";
import { ArrowRight } from "lucide-react";
export default function Nav(){
  return <header className="container nav">
    <Link href="/" className="logo">AM<span>Next</span> Academy</Link>
    <nav className="navlinks"><Link href="/courses">Courses</Link><Link href="/paths">Learning Paths</Link><Link href="/pricing">Pricing</Link><Link href="/dashboard">Dashboard</Link></nav>
    <div style={{display:"flex",gap:8}}><Link className="btn btn-secondary" href="/login">Log in</Link><Link className="btn btn-primary" href="/courses">Get Started <ArrowRight size={15}/></Link></div>
  </header>
}