import { z } from 'zod';

export const occurrencesRouteSearchSchema = z.object({
  region: z.string().min(1, 'Selecione uma zona').nullable(),
  occurrence: z.string().optional().nullable(),
});

export type OccurrencesRouteFilter = z.infer<typeof occurrencesRouteSearchSchema>;
