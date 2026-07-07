import "server-only";
import { db } from "@/lib/db";

export async function getSimulationMode(): Promise<boolean> {
  const settings = await db.settings.findUnique({
    where: { id: "singleton" },
  });
  return settings?.simulationMode ?? false;
}

export async function setSimulationMode(enabled: boolean): Promise<void> {
  await db.settings.upsert({
    where: { id: "singleton" },
    update: { simulationMode: enabled },
    create: { id: "singleton", simulationMode: enabled },
  });
}
