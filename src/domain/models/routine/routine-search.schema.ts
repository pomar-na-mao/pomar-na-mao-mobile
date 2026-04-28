import { z } from 'zod';

export const routineSearchSchema = z.object({
  region: z.string().min(1, 'Selecione uma zona').nullable(),
  occurrence: z.string().optional().nullable(),
});

export type RoutineFilter = z.infer<typeof routineSearchSchema>;
