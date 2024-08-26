const Topbar = () => {
    return (
        <div className="bg-[#444952] backdrop-blur-lg shadow p-4 items-center flex text-gray-200 sticky">
            <div className="flex justify-center w-full">
                <div className="w-10 h-10 rounded-full mr-3">
                    <img src="/logo.png" alt="Profile" className="w-10 h-10 object-contain" />
                </div>
                <div>
                    <h2 className="font-bold">DEACHE BOT</h2>
                    <p className="text-sm">Online</p>
                </div>
            </div>
        </div>
    )
}
export default Topbar