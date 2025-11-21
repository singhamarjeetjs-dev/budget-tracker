// File: src/components/Sidebar.tsx
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="space-y-4">
        <div className="text-sm muted">Overview</div>

        <ul className="space-y-2">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md ${isActive ? 'active' : ''}`
              }
            >
              Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md ${isActive ? 'active' : ''}`
              }
            >
              Transactions
            </NavLink>
          </li>
        </ul>

        <div className="pt-4 border-t" />

        <div className="text-sm muted">Shortcuts</div>
        <button className="mt-2 w-full btn btn-primary">Add Transaction</button>
      </div>
    </aside>
  );
}
