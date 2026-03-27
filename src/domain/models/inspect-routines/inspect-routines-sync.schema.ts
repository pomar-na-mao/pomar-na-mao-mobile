import { z } from 'zod';

export const inspectRoutineSyncSchema = z.object({
  region: z.string().optional().nullable(),
  dateRange: z
    .object({
      start: z.date(),
      end: z.date(),
    })
    .optional()
    .refine(
      (data) => {
        // Se o objeto existir, valida a lógica de datas
        if (data?.start && data?.end) {
          return data.end >= data.start;
        }
        return true;
      },
      {
        message: 'A data fim deve ser maior ou igual à data início',
        // O path agora é relativo ao objeto 'periodoViagem'
        path: ['end'],
      },
    ),
});

export type InspectRoutinesSyncFilter = z.infer<typeof inspectRoutineSyncSchema>;
