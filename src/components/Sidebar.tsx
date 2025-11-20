import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="hidden lg:block w-64 p-4">
      <div className="space-y-4">
        <div className="text-sm text-gray-500">Overview</div>
        <ul className="space-y-2">
          <li>
            <Link
              to="/"
              className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/transactions"
              className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Transactions
            </Link>
          </li>
        </ul>

        <div className="pt-4 border-t"></div>

        <div className="text-sm text-gray-500">Shortcuts</div>
        <button className="w-full text-left px-3 py-2 rounded-md bg-indigo-50 text-indigo-600">
          Add Transaction
        </button>
      </div>
    </aside>
  );
}
