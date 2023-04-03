import React from 'react'
import { Route } from 'react-router-dom'

import Home from './Home'
import Game from './Game'

const App = () => (
  <div>
    <Route exact path='/' component={Home} />
    <Route exact path='/game' component={Game} />
  </div>
)

export default App
