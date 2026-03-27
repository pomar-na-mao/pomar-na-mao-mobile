import { regionsService } from '@/data/services/regions/regions-service';

class RegionsRepository {
  async findAll() {
    const { data, error } = await regionsService.findAll();
    return { data, error };
  }
}

export const regionsRepository = new RegionsRepository();
