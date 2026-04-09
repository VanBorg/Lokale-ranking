import { Link } from 'react-router-dom';
import { buttonVariants } from '../design/variants';

export const Dashboard = () => (
  <div className="flex flex-1 flex-col items-center justify-center bg-app px-4">
    <div className="w-full max-w-md rounded-xl border border-line bg-surface p-8 shadow-lg shadow-black/20">
      <h1 className="text-center text-xl font-semibold text-text">Pixel Blueprint</h1>
      <p className="mt-2 text-center text-sm text-muted">
        Start designing your floor plan in the Blueprint creator.
      </p>
      <Link
        to="/blueprint"
        className={`mt-8 flex w-full justify-center rounded-lg px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-app ${buttonVariants.primary}`}
      >
        Open Blueprint creator
      </Link>
    </div>
  </div>
);
