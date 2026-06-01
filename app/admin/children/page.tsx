"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listAdminChildren } from "../../../lib/cmsApi";

export default function ChildrenPage() {
  const [children, setChildren] = useState<string[]>([]);
  const [childInput, setChildInput] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("cms_admin_token") || undefined;
    if (!token) {
      router.push('/login');
      return;
    }

    listAdminChildren(token).then((data) => setChildren(data.children || [])).catch(() => {});
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Children</h1>
      <div>
        <input value={childInput} onChange={(e) => setChildInput(e.target.value)} placeholder="Enter child id" />{' '}
        {childInput && (
          <Link href={`/admin/children/${encodeURIComponent(childInput)}/subjects`}><button>Open</button></Link>
        )}
      </div>
      <ul>
        {children.map((c) => (
          <li key={c}>
            {c} — <Link href={`/admin/children/${encodeURIComponent(c)}/subjects`}>subjects</Link> • <Link href={`/admin/children/${encodeURIComponent(c)}/tasks`}>tasks</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
