import { useState } from "react";

const Sidebar = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const [chats, setChats] = useState([
        { id: 1, name: 'Chat 1' },
        { id: 2, name: 'Chat 2' },
        { id: 3, name: 'Chat 3' },
    ]);
    return (
        <div className={`bg-gray-800 text-white p-4 transition-all duration-300 ease-in-out   ${sidebarOpen ? 'w-64' : 'w-0 p-0'} ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
            <h2 className="text-xl font-bold mb-4">Deache</h2>
            <button onClick={toggleSidebar} className="mr-4 text-gray-500 hover:text-gray-700 bg-gray-300 p-2 rounded-md cursor-pointer">
                {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
            <ul>
                {chats.map((chat) => (
                    <li key={chat.id} className="mb-2 cursor-pointer hover:bg-gray-700 p-2 rounded">
                        {chat.name}
                    </li>
                ))}
            </ul>
        </div>
    )
}
export default Sidebar;
