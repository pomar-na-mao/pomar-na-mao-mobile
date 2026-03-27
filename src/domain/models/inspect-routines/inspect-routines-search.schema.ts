import { z } from 'zod';

export const inspectRoutineSearchSchema = z.object({
  region: z.string().min(1, 'Selecione uma zona').nullable(),
  occurrence: z.string().optional().nullable(),
});

export type InspectRoutineFilter = z.infer<typeof inspectRoutineSearchSchema>;
