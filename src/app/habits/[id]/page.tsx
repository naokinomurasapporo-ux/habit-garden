import { HabitDetail } from "@/components/HabitDetail";

export default async function Page({ params }: PageProps<"/habits/[id]">) {
  const { id } = await params;
  return <HabitDetail id={id} />;
}
