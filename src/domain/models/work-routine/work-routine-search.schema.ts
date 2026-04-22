import { z } from 'zod';

export const workRoutineSearchSchema = z.object({
  region: z.string().min(1, 'Selecione uma zona').nullable(),
  occurrence: z.string().optional().nullable(),
});

export type WorkRoutineFilter = z.infer<typeof workRoutineSearchSchema>;
