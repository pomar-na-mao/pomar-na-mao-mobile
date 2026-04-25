import type { HorizontalTab } from '@/domain/models/shared/horizontal-tab.model';
import type { BooleanKeys } from '@/domain/models/shared/plant-data.model';

export const PLANT_COLLECT_STORAGE = 'storage/v1/object/public/plant-collect/uploads';

export const fieldWorks: HorizontalTab[] = [
  {
    key: 'inspect-annotation',
    label: 'Insp. anotação',
    isDisabled: false,
    showFilters: true,
  },
  {
    key: 'pulverization',
    label: 'Pulverização',
    isDisabled: false,
    showFilters: false,
  },
  {
    key: 'inspect-route',
    label: 'Insp. rota',
    isDisabled: false,
    showFilters: false,
  },
  {
    key: 'harvest',
    label: 'Colheita',
    isDisabled: false,
    showFilters: false,
  },
];

export const occurenceKeys: BooleanKeys[] = [
  'anthill',
  'broken_branch',
  'burnt_branch',
  'drill',
  'empty_collection_box_near',
  'fertilization_or_manuring',
  'in_experiment',
  'is_dead',
  'mites',
  'stick',
  'struck_by_lightning',
  'thrips',
  'vine_growing',
  'weeds_in_the_basin',
  'is_new',
  'non_existent',
  'frost',
  'flowers',
  'buds',
  'dehydrated',
];

export const occurencesLabels: Record<string, string> = {
  stick: 'Galho Seco',
  broken_branch: 'Galho Quebrado',
  vine_growing: 'Cipó crescendo',
  burnt_branch: 'Queimado',
  struck_by_lightning: 'Atingido por raio',
  drill: 'Broca',
  anthill: 'Formigueiro',
  in_experiment: 'Em experimento/teste',
  weeds_in_the_basin: 'Mato na bacia',
  is_dead: 'Planta Morta',
  mites: 'Presença de ácaro',
  thrips: 'Presença de tripes',
  empty_collection_box_near: 'Caixa de colheita vazia perto',
  fertilization_or_manuring: 'Parada de pulverização/adubação',

  is_new: 'Pé novo',
  non_existent: 'Pé Inexistente',
  frost: 'Atingido por Geada',
  flowers: 'Presença de Flores',
  buds: 'Presença de Brotos',
  dehydrated: 'Pé Desidratado',
};

export const varieties = [
  { label: 'Tutti-Frutti', value: 'Tutti-Frutti' },
  { label: 'Ouro', value: 'Ouro' },
  { label: 'Laranja', value: 'Laranja' },
  { label: 'Gigante', value: 'Gigante' },
  { label: 'Fogo', value: 'Fogo' },
  { label: 'Crocante', value: 'Crocante' },
  { label: 'Coração', value: 'Coração' },
  { label: 'Clássica', value: 'Clássica' },
];

export const plantDataTabs: HorizontalTab[] = [
  {
    key: 'occurrences',
    label: 'Ocorrências',
    isDisabled: false,
    showFilters: false,
  },
  {
    key: 'information',
    label: 'Informações',
    isDisabled: false,
    showFilters: false,
  },
];
