import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Head from './head'

const Home = () => {
  const [counter, setCounterNew] = useState(0)

  return (
    <div>
      <Head title="Hello" />
      <button type="button" onClick={() => setCounterNew(counter + 1)}>
        updateCounter
      </button>

      <div className="flex items-center justify-center h-screen">
        <div className="bg-indigo-800 text-white font-bold rounded-lg border shadow-lg p-10">
          Hello World Dashboard {counter}
          <Link to="/">Go to root</Link>
          <div>
            <a href="/">Go to root href</a>
          </div>
        </div>
      </div>
    </div>
  )
}

Home.propTypes = {}

export default Home
