"use client";

import React, { useEffect, useState } from "react";
import { getRecommendations, assignTask, getAssignedTasks } from "../../../../../lib/cmsApi";
import { useRouter } from "next/navigation";

export default function ChildTasksPage({ params }: { params: { childId: string } }) {
  const { childId } = params;
  const [recs, setRecs] = useState<any[]>([]);
  const [assigned, setAssigned] = useState<any[]>([]);
  const router = useRouter();

  const load = () => {
    const token = localStorage.getItem("cms_admin_token") || undefined;
    if (!token) {
      router.push('/login');
      return;
    }

    getRecommendations(childId, token).then((d) => setRecs(d.recommendations || [])).catch(() => {});
    getAssignedTasks(childId, token).then((d) => setAssigned(d.assigned_tasks || [])).catch(() => {});
  };

  useEffect(() => { load(); }, [childId]);

  const doAssign = (content_id: number, game_type_id: number) => {
    const token = localStorage.getItem("cms_admin_token") || undefined;
    if (!token) return;
    assignTask(childId, { content_id, game_type_id }, token).then(() => {
      load();
    }).catch((e) => alert('Assign failed'));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Tasks — {childId}</h1>
      <button onClick={() => router.push('/admin/children')}>Back</button>

      <h2>Recommendations</h2>
      <ul>
        {recs.map((r, i) => (
          <li key={i}>
            {r.title || `content ${r.content_id}`} — {r.reason} — <button onClick={() => doAssign(r.content_id, r.game_type_id)}>Assign</button>
          </li>
        ))}
      </ul>

      <h2>Assigned Tasks</h2>
      <ul>
        {assigned.map((t: any) => (
          <li key={t.id}>{t.content?.title || t.content_id} — {t.status} — {t.assigned_at}</li>
        ))}
      </ul>
    </div>
  );
}
