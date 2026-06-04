import type { Role } from "../../generated/prisma/enums.js";

declare global {
  namespace Express {
    interface User {
      id: string;
      name: string;
      email: string;
      role: Role;
      isActive: boolean;
      imageUrl?: string | null;
      phone?: string | null;
      address?: string | null;
      occupation?: string | null;
      dateOfBirth?: string | null;
      emergencyContactName?: string | null;
      emergencyContactPhone?: string | null;
      bio?: string | null;
      createdAt: Date;
      updatedAt: Date;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
