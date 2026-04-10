import { InspectRoutineInActionDetectionProvider } from '@/ui/inspect-routines/view-models/useInspectRoutineInActionDetection';
import { InspectRoutineInActionDetectionView } from '@/ui/inspect-routines/view/inspect-routine-in-action-detection-view';

const InspectRoutineInActionDetection = () => {
  return (
    <InspectRoutineInActionDetectionProvider>
      <InspectRoutineInActionDetectionView />
    </InspectRoutineInActionDetectionProvider>
  );
};

export default InspectRoutineInActionDetection;
