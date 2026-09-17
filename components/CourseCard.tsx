"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock3, Star, Users, ArrowUpRight } from "lucide-react";
import { courses } from "@/lib/data";

export default function CourseCard({
  course,
}: {
  course: (typeof courses)[number];
}) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25 }}
      style={{ height: "100%" }}
    >
      <Link
        href={`/course/${course.slug}`}
        className="card"
        style={{
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div
          className="course-cover"
          style={{
            background: course.gradient,
            minHeight: 175,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 75% 25%, rgba(255,255,255,.18), transparent 28%), linear-gradient(135deg, transparent, rgba(0,0,0,.25))",
            }}
          />

          <span
            className="pill"
            style={{
              position: "relative",
              zIndex: 2,
              background: "rgba(0,0,0,.25)",
              backdropFilter: "blur(10px)",
            }}
          >
            {course.category}
          </span>

          <div
            style={{
              position: "absolute",
              right: 18,
              bottom: 12,
              fontSize: 54,
              fontWeight: 900,
              letterSpacing: -4,
              opacity: 0.18,
            }}
          >
            AMN
          </div>

          <div
            style={{
              position: "absolute",
              right: 18,
              top: 18,
              width: 38,
              height: 38,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "rgba(255,255,255,.12)",
              backdropFilter: "blur(10px)",
            }}
          >
            <ArrowUpRight size={18} />
          </div>
        </div>

        <div
          className="course-body"
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <div
            className="muted"
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {course.level}
          </div>

          <h3
            style={{
              margin: "8px 0 8px",
              fontSize: 20,
              lineHeight: 1.2,
            }}
          >
            {course.title}
          </h3>

          <div
            className="muted"
            style={{
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {course.description}
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 17,
              flexWrap: "wrap",
              fontSize: 12,
              color: "#aab3c7",
            }}
          >
            <span>
              <Clock3 size={13} style={{ verticalAlign: "middle" }} />{" "}
              {course.hours}
            </span>

            <span>
              <Star size={13} style={{ verticalAlign: "middle" }} />{" "}
              {course.rating}
            </span>

            <span>
              <Users size={13} style={{ verticalAlign: "middle" }} />{" "}
              {course.students}
            </span>
          </div>

          <div
            style={{
              marginTop: "auto",
              paddingTop: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span className="muted" style={{ fontSize: 11 }}>
                COURSE
              </span>
              <div style={{ fontSize: 23, fontWeight: 900 }}>
                ${course.price}
              </div>
            </div>

            <span
              className="btn btn-secondary"
              style={{
                padding: "9px 13px",
                fontSize: 12,
              }}
            >
              View course
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
