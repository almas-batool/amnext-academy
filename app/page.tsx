"use client";

import Link from "next/link";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Sparkles,
  Code2,
  BrainCircuit,
  Cloud,
  Database,
  Shield,
  BarChart3
} from "lucide-react";
import { courses } from "@/lib/data";

const categories = [
  [Code2, "Development", "Build modern software"],
  [BrainCircuit, "AI & Machine Learning", "Create with AI"],
  [Cloud, "Cloud & DevOps", "Scale infrastructure"],
  [Database, "Data", "Turn data into insights"],
  [Shield, "Cybersecurity", "Protect what matters"],
  [BarChart3, "Business", "Grow your career"]
];

const paths = [
  ["Full-Stack Developer", "React, TypeScript, Node.js & PostgreSQL"],
  ["AI Engineer", "LLMs, Python, RAG & AI applications"],
  ["Cloud Engineer", "Cloud architecture, DevOps & deployment"]
];

export default function Home() {
  return (
    <main>

      {/* HERO */}
      <section style={{
        minHeight:"720px",
        display:"flex",
        alignItems:"center",
        position:"relative",
        overflow:"hidden",
        background:
          "radial-gradient(circle at 15% 30%,rgba(124,58,237,.25),transparent 35%),radial-gradient(circle at 85% 25%,rgba(34,211,238,.18),transparent 32%)"
      }}>

        <div style={{
          position:"absolute",
          inset:0,
          opacity:.22,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px)",
          backgroundSize:"55px 55px"
        }}/>

        <div className="container" style={{
          position:"relative",
          zIndex:1,
          paddingTop:90,
          paddingBottom:90
        }}>

          <div style={{maxWidth:850}}>

            <div className="pill" style={{
              display:"inline-flex",
              alignItems:"center",
              gap:7
            }}>
              <Sparkles size={13}/>
              Career-focused learning for the modern workforce
            </div>

            <h1 style={{
              fontSize:"clamp(48px,7vw,88px)",
              lineHeight:.98,
              letterSpacing:-4,
              margin:"25px 0 25px",
              maxWidth:900
            }}>
              Build skills that
              <br/>
              <span style={{
                background:"linear-gradient(90deg,#a78bfa,#22d3ee)",
                WebkitBackgroundClip:"text",
                color:"transparent"
              }}>
                move your career forward.
              </span>
            </h1>

            <p className="muted" style={{
              fontSize:18,
              lineHeight:1.7,
              maxWidth:680,
              marginBottom:30
            }}>
              Learn in-demand technology skills through expert-led
              courses, structured learning paths, hands-on assessments,
              and industry-recognized certificates.
            </p>

            <div style={{
              display:"flex",
              gap:12,
              flexWrap:"wrap"
            }}>
              <Link href="/courses" className="btn btn-primary"
                style={{padding:"14px 22px"}}>
                Explore courses
                <ArrowRight size={16}/>
              </Link>

              <Link href="/dashboard" className="btn btn-secondary"
                style={{padding:"14px 22px"}}>
                <Play size={15} fill="currentColor"/>
                View demo dashboard
              </Link>
            </div>

            <div style={{
              display:"flex",
              gap:24,
              flexWrap:"wrap",
              marginTop:35,
              fontSize:12
            }}>
              {[
                "Expert-designed curriculum",
                "Hands-on assessments",
                "Certificates included"
              ].map(x => (
                <span key={x} style={{
                  display:"flex",
                  gap:7,
                  alignItems:"center"
                }}>
                  <CheckCircle2 size={14}/>
                  {x}
                </span>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{
        borderTop:"1px solid rgba(255,255,255,.07)",
        borderBottom:"1px solid rgba(255,255,255,.07)"
      }}>
        <div className="container" style={{
          display:"grid",
          gridTemplateColumns:"repeat(4,1fr)",
          paddingTop:30,
          paddingBottom:30,
          gap:20
        }}>

          {[
            ["50K+", "Learners"],
            ["100+", "Expert courses"],
            ["25+", "Learning paths"],
            ["4.9/5", "Learner rating"]
          ].map(([number,label]) => (
            <div key={label} style={{textAlign:"center"}}>
              <div style={{fontSize:26,fontWeight:900}}>
                {number}
              </div>
              <div className="muted" style={{fontSize:11}}>
                {label}
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* COURSES */}
      <section className="container" style={{
        paddingTop:85,
        paddingBottom:85
      }}>

        <div style={{
          display:"flex",
          justifyContent:"space-between",
          alignItems:"end",
          gap:20,
          marginBottom:28,
          flexWrap:"wrap"
        }}>
          <div>
            <div className="muted" style={{
              fontSize:11,
              letterSpacing:1.5,
              fontWeight:700
            }}>
              FEATURED COURSES
            </div>
            <h2 style={{
              fontSize:"clamp(30px,4vw,45px)",
              margin:"8px 0"
            }}>
              Learn what is next.
            </h2>
            <p className="muted" style={{margin:0}}>
              Practical skills for today's fastest-growing careers.
            </p>
          </div>

          <Link href="/courses" className="btn btn-secondary">
            View all courses <ArrowRight size={15}/>
          </Link>
        </div>

        <div className="course-grid">

          {courses.slice(0,3).map(course => (
            <Link
              href={`/course/${course.slug}`}
              className="card"
              key={course.id}
              style={{overflow:"hidden",padding:0}}
            >

              <div style={{
                height:180,
                background:course.gradient,
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                position:"relative"
              }}>
                <div style={{
                  width:65,
                  height:65,
                  borderRadius:"50%",
                  background:"rgba(0,0,0,.25)",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center"
                }}>
                  <Play size={23} fill="white"/>
                </div>

                <div style={{
                  position:"absolute",
                  left:16,
                  bottom:15
                }}>
                  <span className="pill">
                    {course.category}
                  </span>
                </div>
              </div>

              <div style={{padding:21}}>

                <div className="muted" style={{fontSize:11}}>
                  {course.level} · {course.hours}
                </div>

                <h3 style={{
                  fontSize:19,
                  lineHeight:1.3,
                  margin:"8px 0"
                }}>
                  {course.title}
                </h3>

                <div style={{
                  display:"flex",
                  justifyContent:"space-between",
                  fontSize:12,
                  marginTop:17
                }}>
                  <span>★ {course.rating}</span>
                  <span className="muted">
                    {course.students} learners
                  </span>
                </div>

              </div>
            </Link>
          ))}

        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{
        background:"rgba(255,255,255,.025)",
        borderTop:"1px solid rgba(255,255,255,.06)",
        borderBottom:"1px solid rgba(255,255,255,.06)"
      }}>
        <div className="container" style={{
          paddingTop:75,
          paddingBottom:75
        }}>

          <div style={{textAlign:"center",marginBottom:35}}>
            <div className="muted" style={{
              fontSize:11,
              letterSpacing:1.5
            }}>
              EXPLORE BY SKILL
            </div>
            <h2 style={{fontSize:35,margin:"8px 0"}}>
              Find your next skill.
            </h2>
          </div>

          <div className="course-grid">

            {categories.map(([Icon,title,desc]) => {
              const I = Icon as typeof Code2;

              return (
                <Link
                  href="/courses"
                  className="glass"
                  key={String(title)}
                  style={{
                    padding:20,
                    borderRadius:15,
                    display:"block"
                  }}
                >
                  <I size={21}/>

                  <h3 style={{
                    fontSize:16,
                    margin:"15px 0 5px"
                  }}>
                    {String(title)}
                  </h3>

                  <p className="muted" style={{
                    fontSize:12,
                    margin:0
                  }}>
                    {String(desc)}
                  </p>
                </Link>
              );
            })}

          </div>
        </div>
      </section>

      {/* PATHS */}
      <section className="container" style={{
        paddingTop:85,
        paddingBottom:85
      }}>

        <div style={{
          display:"grid",
          gridTemplateColumns:"1fr 1fr",
          gap:50,
          alignItems:"center"
        }}>

          <div>
            <div className="muted" style={{
              fontSize:11,
              letterSpacing:1.5
            }}>
              LEARNING PATHS
            </div>

            <h2 style={{
              fontSize:"clamp(32px,4vw,48px)",
              lineHeight:1.1,
              margin:"10px 0 15px"
            }}>
              Follow a path.
              <br/>
              Build a career.
            </h2>

            <p className="muted" style={{
              lineHeight:1.7,
              maxWidth:520
            }}>
              Structured collections of courses designed to take you
              from fundamentals to job-ready skills.
            </p>

            <Link href="/paths" className="btn btn-primary"
              style={{marginTop:15}}>
              Explore learning paths
              <ArrowRight size={15}/>
            </Link>
          </div>

          <div style={{display:"grid",gap:13}}>

            {paths.map(([title,desc],i) => (
              <Link
                href="/paths"
                className="card"
                key={title}
                style={{
                  padding:20,
                  display:"flex",
                  gap:17,
                  alignItems:"center"
                }}
              >
                <div style={{
                  width:45,
                  height:45,
                  flexShrink:0,
                  borderRadius:12,
                  background:"linear-gradient(135deg,#7c3aed,#0891b2)",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  fontWeight:900
                }}>
                  0{i+1}
                </div>

                <div style={{flex:1}}>
                  <h3 style={{fontSize:16,margin:"0 0 4px"}}>
                    {title}
                  </h3>
                  <p className="muted" style={{
                    fontSize:11,
                    margin:0
                  }}>
                    {desc}
                  </p>
                </div>

                <ArrowRight size={16}/>
              </Link>
            ))}

          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="container" style={{
        paddingBottom:90
      }}>
        <div className="card" style={{
          padding:"65px 35px",
          textAlign:"center",
          overflow:"hidden",
          position:"relative",
          background:
            "radial-gradient(circle at 50% 0%,rgba(124,58,237,.25),transparent 55%),rgba(255,255,255,.025)"
        }}>

          <div className="pill">
            <Sparkles size={13}/> AMNext Academy
          </div>

          <h2 style={{
            fontSize:"clamp(32px,5vw,55px)",
            margin:"15px 0 10px"
          }}>
            Your next skill starts here.
          </h2>

          <p className="muted" style={{
            maxWidth:560,
            margin:"0 auto 25px",
            lineHeight:1.6
          }}>
            Start learning today and build skills that create
            opportunities tomorrow.
          </p>

          <Link href="/courses" className="btn btn-primary">
            Start learning <ArrowRight size={16}/>
          </Link>

        </div>
      </section>

    </main>
  );
}
