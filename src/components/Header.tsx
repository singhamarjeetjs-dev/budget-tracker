export default function Header() {
  return (
    <header className="w-full bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Budget Tracker</h1>
        <nav className="text-sm text-gray-600">
          <a className="mr-4 hover:underline" href="#">
            Dashboard
          </a>
          <a className="hover:underline" href="#transactions">
            Transactions
          </a>
        </nav>
      </div>
    </header>
  );
}
