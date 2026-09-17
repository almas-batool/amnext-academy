"use client";

import Link from "next/link";
import {
  Award,
  BookOpen,
  Clock3,
  LayoutDashboard,
  LogOut,
  Settings,
  Target,
  TrendingUp,
  Flame,
  Play,
  ChevronRight
} from "lucide-react";
import { courses } from "@/lib/data";

export default function Dashboard() {
  const current = courses[0];

  return (
    <main className="dashboard-layout">

      <aside className="sidebar">
        <Link href="/" className="logo">
          AM<span>Next</span>
        </Link>

        <div style={{marginTop:35}}>
          <Link href="/dashboard" className="side-link active">
            <LayoutDashboard size={16}/> Dashboard
          </Link>

          <Link href="/courses" className="side-link">
            <BookOpen size={16}/> Explore Courses
          </Link>

          <Link href="/paths" className="side-link">
            <Target size={16}/> Learning Paths
          </Link>

          <Link href="/certificate" className="side-link">
            <Award size={16}/> Certificates
          </Link>

          <Link href="/pricing" className="side-link">
            <Settings size={16}/> Account
          </Link>
        </div>

        <div style={{
          position:"absolute",
          bottom:25,
          left:20,
          right:20
        }}>
          <Link href="/" className="side-link">
            <LogOut size={16}/> Exit
          </Link>
        </div>
      </aside>

      <section className="dash-main">

        <div style={{
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center",
          gap:20,
          flexWrap:"wrap"
        }}>
          <div>
            <div className="muted" style={{
              fontSize:11,
              letterSpacing:1.5,
              fontWeight:700
            }}>
              LEARNER DASHBOARD
            </div>

            <h1 style={{
              margin:"7px 0 4px",
              fontSize:"clamp(30px,4vw,42px)",
              letterSpacing:-1.5
            }}>
              Welcome back, Alex.
            </h1>

            <p className="muted" style={{margin:0}}>
              Keep building your skills. You are doing great.
            </p>
          </div>

          <div className="glass" style={{
            padding:"11px 15px",
            borderRadius:12,
            display:"flex",
            alignItems:"center",
            gap:9
          }}>
            <Flame size={18}/>
            <div>
              <b>7 day streak</b>
              <div className="muted" style={{fontSize:10}}>
                Keep it going
              </div>
            </div>
          </div>
        </div>

        <div className="dash-grid" style={{marginTop:28}}>

          <div className="card" style={{padding:22}}>
            <TrendingUp size={18}/>
            <div style={{fontSize:30,fontWeight:900,marginTop:13}}>
              72%
            </div>
            <div className="muted" style={{fontSize:12}}>
              Overall progress
            </div>
          </div>

          <div className="card" style={{padding:22}}>
            <Clock3 size={18}/>
            <div style={{fontSize:30,fontWeight:900,marginTop:13}}>
              14h 32m
            </div>
            <div className="muted" style={{fontSize:12}}>
              Learning time
            </div>
          </div>

          <div className="card" style={{padding:22}}>
            <Award size={18}/>
            <div style={{fontSize:30,fontWeight:900,marginTop:13}}>
              3
            </div>
            <div className="muted" style={{fontSize:12}}>
              Certificates earned
            </div>
          </div>

        </div>

        <div
          className="card"
          style={{
            marginTop:20,
            overflow:"hidden"
          }}
        >
          <div style={{
            height:8,
            background:"linear-gradient(90deg,#7c3aed,#22d3ee)"
          }}/>

          <div style={{padding:26}}>

            <div className="muted" style={{
              fontSize:11,
              letterSpacing:1,
              fontWeight:700
            }}>
              CONTINUE LEARNING
            </div>

            <div style={{
              display:"flex",
              justifyContent:"space-between",
              alignItems:"center",
              gap:25,
              marginTop:8,
              flexWrap:"wrap"
            }}>

              <div style={{flex:1,minWidth:260}}>
                <h2 style={{
                  margin:"5px 0 7px",
                  fontSize:25
                }}>
                  {current.title}
                </h2>

                <p className="muted" style={{
                  margin:0,
                  fontSize:13
                }}>
                  Module 6 of 9 · Authentication & Security
                </p>

                <div className="progress" style={{
                  marginTop:20,
                  maxWidth:650
                }}>
                  <span style={{width:"72%"}}/>
                </div>

                <div className="muted" style={{
                  marginTop:8,
                  fontSize:11
                }}>
                  72% complete · 17h 36m remaining
                </div>
              </div>

              <Link
                href="/learn/full-stack-web-development"
                className="btn btn-primary"
              >
                <Play size={15} fill="currentColor"/>
                Continue
              </Link>

            </div>
          </div>
        </div>

        <div style={{marginTop:32}}>

          <div style={{
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center",
            marginBottom:15
          }}>
            <div>
              <h2 style={{margin:"0 0 5px"}}>
                Your learning
              </h2>
              <p className="muted" style={{margin:0,fontSize:13}}>
                Courses you are currently taking
              </p>
            </div>

            <Link href="/courses" className="muted" style={{fontSize:12}}>
              Browse all <ChevronRight size={13}/>
            </Link>
          </div>

          <div className="course-grid">

            {courses.slice(0,3).map((course) => (
              <Link
                href={`/course/${course.slug}`}
                className="card"
                style={{padding:18}}
                key={course.id}
              >
                <div style={{
                  height:7,
                  borderRadius:8,
                  background:course.gradient
                }}/>

                <div className="muted" style={{
                  fontSize:10,
                  marginTop:17,
                  textTransform:"uppercase",
                  letterSpacing:1
                }}>
                  {course.category}
                </div>

                <h3 style={{
                  margin:"7px 0",
                  fontSize:17
                }}>
                  {course.title}
                </h3>

                <div className="progress" style={{marginTop:16}}>
                  <span style={{
                    width:`${course.progress || 0}%`
                  }}/>
                </div>

                <div style={{
                  display:"flex",
                  justifyContent:"space-between",
                  marginTop:8,
                  fontSize:11
                }}>
                  <span className="muted">
                    {course.progress || 0}% complete
                  </span>
                  <span className="muted">
                    {course.hours}
                  </span>
                </div>
              </Link>
            ))}

          </div>
        </div>

        <div style={{marginTop:32}}>
          <h2 style={{marginBottom:15}}>
            Recommended next
          </h2>

          <div className="path-grid">

            {[
              ["Generative AI & LLM Engineering","AI & Machine Learning"],
              ["Cloud Engineering Foundations","Cloud"],
              ["Cybersecurity Fundamentals","Cybersecurity"]
            ].map(([title,category]) => (
              <div className="glass" style={{
                padding:20,
                borderRadius:15
              }} key={title}>

                <div className="pill">
                  {category}
                </div>

                <h3 style={{
                  fontSize:17,
                  margin:"15px 0 7px"
                }}>
                  {title}
                </h3>

                <p className="muted" style={{
                  fontSize:12,
                  lineHeight:1.5
                }}>
                  Continue developing the skills that matter for your career.
                </p>

                <Link
                  href="/courses"
                  className="muted"
                  style={{fontSize:12}}
                >
                  Explore course →
                </Link>

              </div>
            ))}

          </div>
        </div>

      </section>
    </main>
  );
}
