"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthorized(true);
    } else {
      router.replace("/admin/login");
    }
  }, [router]);

  if (isAuthorized === null) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}
