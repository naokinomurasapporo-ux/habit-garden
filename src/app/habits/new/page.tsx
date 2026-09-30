import { Suspense } from "react";
import { Loading } from "@/components/Loading";
import { NewHabitWizard } from "@/components/NewHabitWizard";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <NewHabitWizard />
    </Suspense>
  );
}
