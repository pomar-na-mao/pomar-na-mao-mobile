import type { FarmRegion } from '@/domain/models/shared/farm-regions.model';
import type { DropdownItem } from '@/domain/models/shared/forms.model';
import type { Occurrence } from '@/domain/models/shared/occurrences.model';
import type { iUser } from '@/domain/models/shared/user.model';
import type { Variety } from '@/domain/models/shared/varieties.model';

export const generateListOfVarieties = (varieties: Variety[]): DropdownItem[] => {
  return varieties?.map((variety) => {
    return { label: variety.name, value: variety.name };
  });
};

export const generateListOfFarmRegions = (farmRegions: FarmRegion[]): DropdownItem[] => {
  const uniqueRegions = new Set(farmRegions?.map((item) => item.region)) as Set<string>;

  const uniqueRegionsArray = Array.from(uniqueRegions) as string[];

  return uniqueRegionsArray?.map((region) => {
    return { label: region, value: region };
  });
};

export const generateListOfOccurrences = (occurrences: Occurrence[]): DropdownItem[] => {
  return occurrences?.map((occurrence) => {
    return { label: occurrence.name, value: occurrence.code };
  });
};

export const generateListOfUsers = (users: iUser[]): DropdownItem[] => {
  return users?.map((user) => {
    return { label: user.full_name, value: user.id };
  });
};
