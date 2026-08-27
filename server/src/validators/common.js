const { z } = require('zod');

const coordinate = z.coerce.number().finite();
const hoursSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  opensAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(),
  closesAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(),
  isClosed: z.boolean().default(false),
});

module.exports = { coordinate, hoursSchema, z };
