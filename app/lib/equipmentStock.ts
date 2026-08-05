import prisma from "@/app/lib/prisma";

/**
 * Recalculates and updates the `available` stock for equipment.
 * If equipmentId is provided, syncs that specific item. Otherwise, syncs all active equipment.
 */
export async function syncEquipmentStock(equipmentId?: string) {
  try {
    const equipmentList = equipmentId
      ? await prisma.equipment.findMany({ where: { id: equipmentId } })
      : await prisma.equipment.findMany();

    for (const eq of equipmentList) {
      // Find all order items for this equipment in active/processing orders
      const activeItems = await prisma.orderItem.findMany({
        where: {
          equipmentId: eq.id,
          order: {
            status: {
              in: ["PROCESSING", "ACTIVE"],
            },
          },
        },
        select: {
          quantity: true,
        },
      });

      const totalActiveRented = activeItems.reduce((sum, item) => sum + item.quantity, 0);
      const calculatedAvailable = Math.max(0, eq.stock - totalActiveRented);

      if (eq.available !== calculatedAvailable) {
        await prisma.equipment.update({
          where: { id: eq.id },
          data: { available: calculatedAvailable },
        });
      }
    }
  } catch (error) {
    console.error("Error syncing equipment stock:", error);
  }
}
