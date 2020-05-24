import React from 'react'
import Head from './head'

const Dummy = () => {
  const { planetId } = useParams()
  return (
    <div>
      <Head title="Hello" />
      <div className="flex items-center justify-center h-screen">
        <div className="bg-indigo-800 text-white font-bold rounded-lg border shadow-lg p-10">
          This is dummy component {planetId}
          <Link to="/dashboard"> Go to dashboard </Link>
          <div>
            <a href="/dashboard"> Go to dashboard href </a>
          </div>
        </div>
      </div>
    </div>
  )
}

Dummy.propTypes = {}

export default React.memo(Dummy)
