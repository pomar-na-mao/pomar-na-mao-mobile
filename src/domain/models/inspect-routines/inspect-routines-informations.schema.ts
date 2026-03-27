import { z } from 'zod';

export const inspectRoutineInformationsSchema = z.object({
  variety: z.string().nullable(),
  mass: z.string().optional(),
  lifeOfTree: z.string().optional(),
  harvest: z.string().optional(),
  plantingDate: z.date().refine(
    (date) => {
      // Valida se a data é válida
      return !isNaN(date.getTime());
    },
    {
      message: 'Data de plantio inválida',
      path: ['plantingDate'],
    },
  ),
  description: z.string().optional(),
});

export type PlantInformation = z.infer<typeof inspectRoutineInformationsSchema>;
