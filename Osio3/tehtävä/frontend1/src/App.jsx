import { useState, useEffect } from 'react'
function App() {
  const [userName, setUserName] = useState('')
  const [allQuestions, setAllQuestions] = useState([])
  const [phase, setPhase] = useState('topic')
  const [topic, setTopic] = useState(null)
  const [score, setScore] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    users();
  }, []);

  useEffect(() => {
    let timer
    if (isRunning) {
      timer = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isRunning])

  const showQuestions = async () => {
    const response = await fetch('/questions')
    if (response.ok) {
      const json = await response.json()
      setAllQuestions(json)
    }
  }

  const users = async () => {
    const response = await fetch('/users');
    if (response.ok) {
      const json = await response.json();
      setAllUsers(json);
    }
  };

  const saveUser = async () => {
    const user = { username: userName, score: score, topic: topic, time: seconds }
    const response = await fetch('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    })
    if (response.ok) {
      const json = await response.json()
      console.log('User added:', json)
      setUserName('')
    }
  }

  const handleAnswer = (selectedAnswer, correctid) => {
    if (selectedAnswer === correctid) {
      setScore(prevScore => prevScore + 1);
    }
    setCurrentQuestion(prev => prev + 1); 
  }

  return (
    <div>
      {phase === 'topic' && (
        <>
          <h1>Welcome to the Quiz</h1>
          <h2>Quiz topics:</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => { setTopic('History'); setPhase('start'); }}>History</button>
            <button onClick={() => { setTopic('Science'); setPhase('start'); }}>Science</button>
            <button onClick={() => { setTopic('FullStack'); setPhase('start'); }}>FullStack</button>
            <br></br>
          </div>
          <h2>Top scorers:</h2>
          <div>
            {allUsers.sort((a, b) => b.score - a.score).slice(0, 10).map(user => (
              <div key={user.userid} style={{ display: 'flex', justifyContent: 'left', alignItems: 'left' }}>
                <h3>Username: {user.username} - Score: {user.score} - Topic: {user.topic}</h3>
              </div>
            ))}
          </div>
        </>
      )}
      <div>
        {phase === 'start' && (
          <button onClick={async () => { await showQuestions(); setPhase('quiz'); setSeconds(0); setIsRunning(true); setCurrentQuestion(0); }}> Start </button>
        )}
      </div>
      <br></br>
      {phase === 'quiz' && (
        <div>
          <h2>This quiz is about {topic}</h2>
          <h2>Your score: {score}</h2>

          {/* --- CHATGPT KOODIA, mutta ymmärrän mitä tekee.  --- */}
          {currentQuestion < allQuestions.filter(question => question.topic === topic).length ? (() => {
            const currentquestion = allQuestions.filter(question => question.topic === topic)[currentQuestion];
            return (
              <div>
                <h3>Question: {currentquestion.question}</h3>
                <ul>
                  {currentquestion.questionanswer.map((answer, index) => (
                    <li key={index}>
                      {answer}
                      <button onClick={() => handleAnswer(index, currentquestion.correctid)}>Choose</button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })() : (
            <div>
              <button onClick={() => { setPhase('end'); setIsRunning(false) }}>End Quiz</button>
            </div>
          )}
        </div>
      )}

      {phase === 'end' && (
        <div>
          <h2>Quiz ended! Your final score is {score} out of {allQuestions.filter(q => q.topic === topic).length}</h2>
          <br></br>
          <form>
            <input type="text" placeholder="Username" value={userName} onChange={e => setUserName(e.target.value)}
              style={{ background: 'white', textAlign: 'center', border: 'none' }} />
          </form>
          <br></br>
          <button onClick={() => { saveUser(); setPhase('topic'); setTopic(null); setScore(0); setCurrentQuestion(0); }}>Back to start</button>
        </div>
      )}
    </div>
  )
}

export default App
