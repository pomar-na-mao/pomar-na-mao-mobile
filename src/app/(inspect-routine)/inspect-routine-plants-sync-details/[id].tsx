import { InspectRoutinePlantsSyncDetailsProvider } from '@/ui/inspect-routines/view-models/useInspectRoutinePlantsSyncDetails';
import { InspectRoutinePlantsSyncDetailsView } from '@/ui/inspect-routines/view/inspect-routine-plants-sync-details-view';

const InspectRoutinePlantsSyncDetails = () => {
  return (
    <InspectRoutinePlantsSyncDetailsProvider>
      <InspectRoutinePlantsSyncDetailsView />
    </InspectRoutinePlantsSyncDetailsProvider>
  );
};

export default InspectRoutinePlantsSyncDetails;
