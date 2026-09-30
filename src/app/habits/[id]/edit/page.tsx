import { HabitEditScreen } from "@/components/HabitEditScreen";

export default async function Page({ params }: PageProps<"/habits/[id]/edit">) {
  const { id } = await params;
  return <HabitEditScreen id={id} />;
}
