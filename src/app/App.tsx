import { AppRoutes } from '@/routes/AppRoutes';
import { ScrollToAnchor } from '@/components/ScrollToAnchor';

export default function App() {
  return (
    <>
      <ScrollToAnchor />
      <AppRoutes />
    </>
  );
}
