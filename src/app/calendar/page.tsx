import { Suspense } from "react";
import { CalendarScreen } from "@/components/CalendarScreen";
import { Loading } from "@/components/Loading";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <CalendarScreen />
    </Suspense>
  );
}
