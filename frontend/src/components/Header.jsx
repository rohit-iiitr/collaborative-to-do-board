"use client";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import "../styles/Header.css";

const Header = ({
  user,
  onCreateTask,
  onToggleActivityLog,
  showActivityLog,
}) => {
  const { logout } = useAuth();
  const { onlineUsers, isConnected } = useSocket();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Collaborative Todo Board
          </h1>
          {/* <div className="connection-status">
            <div className={`status-indicator ${isConnected ? "connected" : "disconnected"}`}></div>
            <span className="status-text">{isConnected ? "Connected" : "Disconnected"}</span>
          </div> */}
        </div>

        <div className="header-center">
          <div className="online-users">
            <span className="online-count">
              {onlineUsers.length + 1} online
            </span>
            <div className="user-avatars">
              <div className="user-avatar current-user" title={user.username}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              {onlineUsers.slice(0, 3).map((onlineUser) => (
                <div
                  key={onlineUser.userId}
                  className="user-avatar"
                  title={onlineUser.username}
                >
                  {onlineUser.username.charAt(0).toUpperCase()}
                </div>
              ))}
              {onlineUsers.length > 3 && (
                <div className="user-avatar more-users">
                  +{onlineUsers.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="header-right">
          <button className="btn gradient-button btn-lg" onClick={onCreateTask}>
            ➕ New Task
          </button>

          <button
            className="btn btn-lg  gradient-button"
            onClick={onToggleActivityLog}
          >
            📊 Activity
          </button>

          <div className="user-menu">
            <div className="user-info">
              {/* <span className="username ">{user.username}</span>
              <span className="user-email">{user.email}</span> */}
            </div>

            <button
              className="btn btn-secondary btn-lg "
              style={{ background: "#962323ff" }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
