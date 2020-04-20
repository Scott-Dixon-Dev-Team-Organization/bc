import React, { useState, useEffect } from 'react'

import Layout from '../components/Layout'
import StrategyList from '../components/StrategyList'

import { Link } from '../router'
import { Button } from 'react-bootstrap'

const fs = require('fs').promises

///
/// UseExistingStrategy component let user to choose from saved strategies
///
const UseExistingStrategy = () => {

  ////// GUI
  //
  // initially disabled button which redirects user to trading page 
  const [disabledStart, setDisabledStart] = useState(true)

  ////// Data
  //
  // initially disabled button which redirects user to trading page 
  const [strategies, setStrategies] = useState([])

  ///
  /// Loads strategies immediately when component is loaded 
  ///
  useEffect(() => {
    const init = async() => {
      await loadStrats();
    }

    init();    
  }, [])

  //////////////////////////////////////////////////////////

  ///
  /// Function loads saved strategies
  ///
  const loadStrats = async () => {
    console.log("Loading strats..")

    const res = fs.readFile('./strategies.json', 'utf8')

    const json = await res.then(
      (data) => { return JSON.parse(data) }
    ).catch(
      (err) => console.error("File read failed:", err)
    )

    setStrategies(json)
  }

  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////

  return (
    <Layout>
      
      <div>
   
      
        <h3>Use Existing Strategy</h3>
        <hr className="my-2"/>

        <StrategyList strategies={strategies}/>
        <Link className="App-link" href="/connected">
          <button type="button" className="btn btn-primary">Back</button>
        </Link>
      </div>
    </Layout>
  )
}

export default UseExistingStrategy
