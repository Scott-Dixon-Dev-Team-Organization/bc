import React from 'react'

import Layout from '../components/Layout'


import IndicatorAddForm from '../components/IndicatorAddForm'

const CreateNewStrategy = () => {

  return (
    <Layout>
      <h1 className="display-3">Create New Strategy</h1>
      <p className="lead">This page shows after connecting to MetaTrader.</p>
      <hr className="my-4"/>
      <IndicatorAddForm />
    </Layout>
  )
}

export default CreateNewStrategy
