"use client";

import React, { useEffect, useState } from "react";
import { getChildSubjects, updateChildSubjects } from "../../../../lib/cmsApi";
import { useRouter } from "next/navigation";

export default function ChildSubjectsPage({ params }: { params: { childId: string } }) {
  const { childId } = params;
  const [subjects, setSubjects] = useState<Array<any>>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("cms_admin_token") || undefined;
    if (!token) return;
    getChildSubjects(childId, token).then((data) => setSubjects(data.subjects || [])).catch(() => {});
  }, [childId]);

  const toggle = (gtId: number) => {
    const token = localStorage.getItem("cms_admin_token") || undefined;
    if (!token) return;
    const next = subjects.map((s) => s.game_type_id === gtId ? { ...s, status: !s.status } : s);
    setSubjects(next);
    updateChildSubjects({ child_id: childId, subjects: next.map(s => ({ game_type_id: s.game_type_id, status: s.status })) }, token)
      .then(() => {})
      .catch(() => alert('Failed to save'));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Subjects — {childId}</h1>
      <button onClick={() => router.push('/admin/children')}>Back</button>
      <ul>
        {subjects.map((s) => (
          <li key={s.game_type_id}>
            {s.game_type_name} — <label><input type="checkbox" checked={!!s.status} onChange={() => toggle(s.game_type_id)} /> enabled</label>
          </li>
        ))}
      </ul>
    </div>
  );
}
