const React = window.React;
const { useState } = React;
const ReactDOM = window.ReactDOM;
const FriendsPanel = window.FriendsPanel;
const Wall = window.Wall;
const ChatBox = window.ChatBox;
const FeedbackBox = window.FeedbackBox;
const FriendsProvider = window.FriendsProvider;
const KarmaProvider = window.KarmaProvider;
const RoomProvider = window.RoomProvider;

function App() {
  const [chatMinimized, setChatMinimized] = useState(false);
  const [feedbackMinimized, setFeedbackMinimized] = useState(true);
  const [showFriends, setShowFriends] = useState(false);

  return (
    <>
      <div className="app-container">
        <nav className="top-nav">
          <h1 className="rainbow-text">WebChat</h1>
          <button 
            className="friends-toggle"
            onClick={() => setShowFriends(!showFriends)}
          >
            👥 Friends
          </button>
        </nav>
        
        {showFriends && <FriendsPanel />}
        <Wall />
      </div>
      <ChatBox 
        minimized={chatMinimized}
        onToggle={() => setChatMinimized(!chatMinimized)}
      />
      <FeedbackBox 
        minimized={feedbackMinimized}
        onToggle={() => setFeedbackMinimized(!feedbackMinimized)}
      />
    </>
  );
}

ReactDOM.render(
  <RoomProvider>
    <FriendsProvider>
      <KarmaProvider>
        <App />
      </KarmaProvider>
    </FriendsProvider>
  </RoomProvider>,
  document.getElementById('app')
);