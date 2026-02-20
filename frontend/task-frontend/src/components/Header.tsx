import React from "react";
import { useUser } from "../contexts/UserContext";

const Header: React.FC = () => {
  const { user } = useUser();

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Dashboard</h1>
      {user ? <p className="text-gray-700">Welcome, {user.username}!</p> : null}
    </header>
  );
};

export default Header;
