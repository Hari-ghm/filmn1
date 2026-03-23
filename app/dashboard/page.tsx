import DashboardClient from "../dashboard/DashboardClient";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const name = typeof params.name === "string" ? params.name : "";
  const age = typeof params.age === "string" ? params.age : "";

  return <DashboardClient name={name} age={age} />;
}