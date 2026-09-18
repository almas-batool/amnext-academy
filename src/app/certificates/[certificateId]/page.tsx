//src/app/certificates/[certificateId]/page.tsx

import { notFound } from "next/navigation";

interface Props {
  params: {
    certificateId: string;
  };
}

export default async function CertificatePage({ params }: Props) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/certificates/${params.certificateId}`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) {
    notFound();
  }

  const json = await res.json();
  const cert = json.data;

  return (
    <div className="container mx-auto max-w-5xl py-10">
      <h1 className="text-3xl font-bold mb-8">Certificate Details</h1>

      <div className="rounded-xl border p-6 space-y-4">
        <div>
          <strong>Student:</strong> {cert.studentName}
        </div>

        <div>
          <strong>Course:</strong> {cert.certificationTitle}
        </div>

        <div>
          <strong>Certificate ID:</strong> {cert.certificateId}
        </div>

        <div>
          <strong>Score:</strong> {cert.score}%
        </div>

        <div>
          <strong>Issued:</strong>{" "}
          {new Date(cert.issuedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
