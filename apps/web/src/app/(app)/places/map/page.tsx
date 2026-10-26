import { Suspense } from "react";
import { DateMapHub } from "@/components/places/DateMapHub";
import { LoadingState } from "@/components/ui/LoadingState";

export default function PlacesMapPage() {
  return (
    <Suspense fallback={<LoadingState className="mx-auto max-w-lg py-16" />}>
      <DateMapHub />
    </Suspense>
  );
}
