import { prisma } from "../../config/database.js";
import type { UpdateSettingInput } from "./setting.validation.js";

export const settingService = {
  getSettings: async () => {
    let settings = await prisma.clubSetting.findFirst();

    if (!settings) {
      settings = await prisma.clubSetting.create({
        data: {
          clubName: "Mailbaria Brothers Group Savings Club",
          monthlySavingAmount: 1000,
          paymentDeadlineDay: 10,
          reminderEnabled: true,
        },
      });
    }

    return settings;
  },

  updateSettings: async (payload: UpdateSettingInput) => {
    const settings = await settingService.getSettings();

    return prisma.clubSetting.update({
      where: {
        id: settings.id,
      },
      data: payload,
    });
  },
};