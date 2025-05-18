import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between p-4 bg-gray-200">
      <div className="text-xl font-bold">
        <Link href="/">My Taipei eAssistant</Link>
      </div>
      <div className="text-xl">👤</div>
    </nav>
  );
};

export default Navbar;
