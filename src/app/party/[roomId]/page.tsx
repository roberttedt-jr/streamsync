"use client";

import { useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

function PartyRedirectInner() {
  const router = useRouter();
  const params: any = useParams();
  const searchParams = useSearchParams();
  const roomId = params?.roomId ? String(params.roomId) : "hub";

  useEffect(() => {
    const query = searchParams ? searchParams.toString() : "";
    const target = `/room/${roomId}${query ? `?${query}` : ""}`;
    router.replace(target);
  }, [roomId, searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#090B10] text-white">
      <div className="flex items-center gap-3">
        <span className="w-3 h-3 rounded-full bg-purple-500 animate-ping" />
        <span className="text-sm font-semibold text-gray-300">Cargando sala StreamSync...</span>
      </div>
    </div>
  );
}

export default function PartyRedirect() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#090B10] text-white">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PartyRedirectInner />
    </Suspense>
  );
}
