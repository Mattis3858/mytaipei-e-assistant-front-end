import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between p-4 bg-cyan-100">
      <div className="text-xl font-bold">
        <Link href="/" className="">
          My Taipei eAssistant
        </Link>
      </div>
      <div className="text-xl">👤</div>
    </nav>
  );
};

export default Navbar;
