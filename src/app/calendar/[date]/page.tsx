import { DayDetailScreen } from "@/components/DayDetailScreen";

export default async function Page({ params }: PageProps<"/calendar/[date]">) {
  const { date } = await params;
  return <DayDetailScreen date={date} />;
}
