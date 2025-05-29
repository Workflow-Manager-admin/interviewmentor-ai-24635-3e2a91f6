import React, { useState } from 'react';
import './App.css';

// PUBLIC_INTERFACE
function Sidebar({ selectedRole, setSelectedRole, selectedIndustry, setSelectedIndustry, roles, industries, isInterviewActive, onStartInterview }) {
  /** This is a public function. 
      Sidebar for job role/industry selection and interview start action 
  */
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Set Up Your Interview</h2>
      <div className="sidebar-section">
        <label htmlFor="role-select">Job Role</label>
        <select
          id="role-select"
          value={selectedRole}
          onChange={e => setSelectedRole(e.target.value)}
          disabled={isInterviewActive}
        >
          {roles.map(role => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>
      <div className="sidebar-section">
        <label htmlFor="industry-select">Industry</label>
        <select
          id="industry-select"
          value={selectedIndustry}
          onChange={e => setSelectedIndustry(e.target.value)}
          disabled={isInterviewActive}
        >
          {industries.map(ind => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>
      <button
        className="btn btn-primary sidebar-btn"
        onClick={onStartInterview}
        disabled={isInterviewActive}
      >
        {isInterviewActive ? "Interview In Progress" : "Start Interview"}
      </button>
      <div className="sidebar-footer">
        <small>Powered by InterviewMentor AI</small>
      </div>
    </aside>
  );
}

// PUBLIC_INTERFACE
function ChatWindow({ messages, onSendMessage, userInput, setUserInput, isInterviewActive, onEndInterview }) {
  /** This is a public function.
      Central chat window for interview simulation
   */
  const handleSend = () => {
    if (userInput.trim()) {
      onSendMessage(userInput.trim());
      setUserInput('');
    }
  };

  // Handle enter key press in input box
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="chat-window">
      <div className="chat-messages" id="chat-scroll-anchor">
        {messages.length === 0 && (
          <div className="chat-placeholder">
            <p>
              👋 Ready to ace your next job interview?<br />
              Select a role & industry on the left, then start a practice session!
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-message ${msg.sender === 'user' ? 'user' : 'mentor'}`}
          >
            <div className="chat-message-bubble">
              <span>{msg.text}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <textarea
          className="chat-input"
          placeholder={isInterviewActive ? "Type your response..." : "Start or resume your interview"}
          disabled={!isInterviewActive}
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          rows={2}
        />
        <button
          className="btn btn-primary chat-send-btn"
          onClick={handleSend}
          disabled={!isInterviewActive || !userInput.trim()}
          title={isInterviewActive ? "Send response" : "Interview not started"}
        >
          Send
        </button>
      </div>
      {isInterviewActive && (
        <button className="btn btn-secondary end-btn" onClick={onEndInterview}>
          End Interview
        </button>
      )}
    </section>
  );
}

// PUBLIC_INTERFACE
function FeedbackPanel({ feedback, onClose }) {
  /** This is a public function.
      Feedback panel shown after each response
   */
  if (!feedback) return null;
  return (
    <div className="feedback-panel">
      <div className="feedback-header">
        <span role="img" aria-label="feedback">⭐</span>
        <h4>Instant Feedback</h4>
      </div>
      <div className="feedback-body">
        <p>{feedback}</p>
      </div>
      <button className="btn btn-accent feedback-close-btn" onClick={onClose}>
        Close
      </button>
    </div>
  );
}

const INTERVIEW_QUESTIONS = {
  // Example pool of questions by job and industry
  "Software Engineer": {
    "Technology": [
      "Tell me about a challenging coding project you completed.",
      "How do you approach debugging a difficult problem?",
      "Can you explain the concept of closure in JavaScript?"
    ],
    "Finance": [
      "How would you approach building a secure trading platform?",
      "Describe a time you handled a data-sensitive issue in your project."
    ]
  },
  "Product Manager": {
    "Technology": [
      "Describe your process for gathering requirements from stakeholders.",
      "How do you prioritize features when building a roadmap?"
    ],
    "Retail": [
      "Tell me about a time you improved a product experience for customers.",
      "Describe how you handled conflicting priorities among teams."
    ]
  }
};

const FEEDBACK_TEMPLATES = [
  // Basic demonstration—this would use AI in production
  "Good job! Your answer was clear and to the point. Remember to provide concrete examples where possible.",
  "That was a good start, but try to elaborate more on your reasoning.",
  "Great! You showed effective problem solving. Consider discussing potential challenges as well.",
  "Nice! To further strengthen your answer, reference a past experience.",
  "Solid response. If possible, highlight the impact of your actions."
];

// PUBLIC_INTERFACE
function MainContainer() {
  /** This is a public function.
      Main container managing layout and state for InterviewMentor AI
   */
  // State
  const jobRoles = Object.keys(INTERVIEW_QUESTIONS);
  const industries = Array.from(
    new Set(Object.values(INTERVIEW_QUESTIONS).flatMap(roleObj => Object.keys(roleObj)))
  );
  const [selectedRole, setSelectedRole] = useState(jobRoles[0]);
  const [selectedIndustry, setSelectedIndustry] = useState(industries[0]);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [pendingQuestionIdx, setPendingQuestionIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);

  // PUBLIC_INTERFACE
  function startInterview() {
    /** This is a public function.
        Begin interview: reset messages, start state, and ask first question.
    */
    const question = getInterviewQuestion(0);
    setMessages([{ sender: 'mentor', text: question }]);
    setIsInterviewActive(true);
    setPendingQuestionIdx(0);
    setShowFeedback(false);
    setCurrentFeedback(null);
    setUserInput('');
  }

  // PUBLIC_INTERFACE
  function endInterview() {
    /** This is a public function.
        Ends interview and resets related state.
    */
    setIsInterviewActive(false);
    setMessages(prev =>
      prev.concat([{ sender: 'mentor', text: "The interview session has ended. Want to try again? Select your role/industry and start a new one!" }])
    );
    setPendingQuestionIdx(0);
    setShowFeedback(false);
    setCurrentFeedback(null);
    setUserInput('');
  }

  // PUBLIC_INTERFACE
  function getInterviewQuestion(idx) {
    /** This is a public function.
        Retrieves the question at the specified index based on role/industry.
    */
    const questions =
      INTERVIEW_QUESTIONS[selectedRole] &&
      INTERVIEW_QUESTIONS[selectedRole][selectedIndustry];
    if (questions && idx < questions.length) {
      return questions[idx];
    }
    return "That's all the questions we have for this session! Would you like to start another interview?";
  }

  // PUBLIC_INTERFACE
  function simulateFeedback(userReply) {
    /** This is a public function.
        Simulates feedback for user input - demo uses random sample.
    */
    // Ideally, call AI/ML backend - for demo, rotate through static messages.
    const index = userReply.length % FEEDBACK_TEMPLATES.length;
    return FEEDBACK_TEMPLATES[index];
  }

  // PUBLIC_INTERFACE
  function handleSendMessage(userReply) {
    /** This is a public function.
        Processes user response: adds message, gives feedback, and advances session.
    */
    setMessages(prev => prev.concat([{ sender: 'user', text: userReply }]));

    // Generate feedback
    const feedback = simulateFeedback(userReply);
    setCurrentFeedback(feedback);
    setShowFeedback(true);

    // Ask next question after feedback
    setTimeout(() => {
      setShowFeedback(false);
      const nextIdx = pendingQuestionIdx + 1;
      setPendingQuestionIdx(nextIdx);
      const nextQuestion = getInterviewQuestion(nextIdx);
      setMessages(prevMessages => prevMessages.concat([
        { sender: 'mentor', text: nextQuestion }
      ]));
      setUserInput('');
    }, 2000); // Show feedback for 2 seconds
  }

  // PUBLIC_INTERFACE
  function handleCloseFeedback() {
    /** This is a public function.
        Closes feedback panel and moves on.
    */
    setShowFeedback(false);
    const nextIdx = pendingQuestionIdx + 1;
    setPendingQuestionIdx(nextIdx);
    const nextQuestion = getInterviewQuestion(nextIdx);
    setMessages(prevMessages => prevMessages.concat([
      { sender: 'mentor', text: nextQuestion }
    ]));
    setUserInput('');
  }

  return (
    <div className="main-container">
      <Sidebar
        selectedRole={selectedRole}
        setSelectedRole={role => {
          setSelectedRole(role);
          setSelectedIndustry(Object.keys(INTERVIEW_QUESTIONS[role])[0]);
        }}
        selectedIndustry={selectedIndustry}
        setSelectedIndustry={setSelectedIndustry}
        roles={jobRoles}
        industries={
          INTERVIEW_QUESTIONS[selectedRole]
            ? Object.keys(INTERVIEW_QUESTIONS[selectedRole])
            : industries
        }
        isInterviewActive={isInterviewActive}
        onStartInterview={startInterview}
      />

      <div className="central-zone">
        <div className="welcome-header">
          <h1 className="title brand-blue">InterviewMentor AI</h1>
          <p className="description light">
            Practice real interviews, get personalized tips, and receive instant feedback.<br />
            24/7 interview coaching for any role or industry!
          </p>
        </div>
        <div className="main-chat-panel">
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            userInput={userInput}
            setUserInput={setUserInput}
            isInterviewActive={isInterviewActive}
            onEndInterview={endInterview}
          />
          <FeedbackPanel
            feedback={showFeedback ? currentFeedback : null}
            onClose={handleCloseFeedback}
          />
        </div>
      </div>
    </div>
  );
}

export default MainContainer;
