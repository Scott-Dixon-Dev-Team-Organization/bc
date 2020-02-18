import React, { Component } from "react"
import { Window, App, Text, Button, View, StyleSheet, TextInput } from "proton-native"
import OpenedTrades from "./components/OpenedTrades"
import SymbolPicker from "./components/SymbolPicker"
import ConnectionForm from "./components/ConnectionForm"
import IndicatorAddForm from "./components/IndicatorAddForm"

const Client = require("./js/Client")
const Orders = require("./js/Orders")
const StrategyManager = require("./js/StrategyManager")
const Indicators = require("./js/Indicators")

export default class MTClient extends Component {
  constructor(props) {
    super(props)

    // Global App State
    this.state = {
      connected: false,
      symbol: "EURUSD",
      reqPort: "5555",
      pullPort: "5556",
      timeframe: "3000",
      txtBid: "",
      txtAsk: "",
      indicators: [],
      openedTrades: [],
      symbolArr: [],
      client: undefined
    }
  
    ///
    /// Prepares Strategy Manager
    ///
    this.initStrategyManager = (client) => {
      return new StrategyManager(client, this.state.indicators)
    }

    ///
    /// Main Loop..
    ///
    this.mainLoop = (strategyManager) => {
      // Request for opened trades
      Orders.getOpenedTrades(this.state.client)
      //
      // Request for update symbol rates
      Orders.rates(this.state.client, this.state.symbol)

      const symbolArr = this.state.symbolArr
      const lastPrice = symbolArr[symbolArr.length - 1]
      const openedTrades = this.state.client.getOpenedTrades()
      
      if (lastPrice) {
        //
        // Sends event to all strategies
        strategyManager.sendEvent(openedTrades, symbolArr)
        //
        // Update app state
        this.setState({
          txtBid: lastPrice.bid,
          txtAsk: lastPrice.ask,
          openedTrades: Object.values(openedTrades)
        })
      }
    }
  }

  ///////////////////////////////////////////////////////////

  ///
  /// Connects to MT
  ///
  _connect() {
    if (this.state.connected) return

    // Create connection with MetaTrader - Setting global app state 
    this.setState({ connected: true,
                    client: new Client(this.state.reqPort, this.state.pullPort) })

    const symbol = this.state.symbol
    const client = this.state.client
    client.connect()

    // Set monitoring symbol & get reference on the array
    this.setState({symbolArr : client.setSymbolMonitoring(symbol)})

    // Create strategy manager which handles incomming events
    const strategyManager = this.initStrategyManager(client)

    // Create new strategy (id, symbol, usedIndicators)
    strategyManager.addStrategy(66, symbol, ["ma100"])

    //
    // TODO:
    //
    // CHECK IF THERE IS NO STRATEGIES INDENTIFIED BY SAME ID !!!
    // or
    // SEND ORDER TO CLOSE ALL POSITIONS WITH THIS ID
    // const openedTrades = this.state.client.getOpenedTrades() ..

    // Set monitored symbol's array length (don't need longer array than max timeframe)
    const maxTimeframe = Math.max(... this.state.indicators.map(i => i.timeframe))
    client.setDbMaxLength(maxTimeframe)

    // Fire main-event loop
    setInterval(() => { this.mainLoop(strategyManager) }, this.state.timeframe)
  }
  
  /////////////////////// UI Changes ////////////////////////

  addIndicator(name, timeframe, f) {
    
    // Check if indicator is unique
    for (let i of this.state.indicators) {
      console.log(i.name)
      if (i.name == name) throw Error("This indicator is already defined!")
    }

    this.state.indicators.push(
      {
        name: name,
        timeframe: timeframe,
        f: f
      }
    )
  }

  changeSymbol(symbol) {
    if (this.state.connected) return
    this.setState({symbol: symbol})
  } 

  changeReqPort(reqPort) {
    if (this.state.connected) return
    this.setState({reqPort: reqPort})
  }

  changePullPort(pullPort) {
    if (this.state.connected) return
    this.setState({pullPort: pullPort})
  }

  changeTimeframe(timeframe) {
    if (this.state.connected) return
    this.setState({timeframe: timeframe})
  }

  ///////////////////////////////////////////////////////////

  render() {
    const styles = StyleSheet.create({
      mainWindow: { padding: 20, width: 300, height: 500, backgroundColor: "#ece6df" }
    })

    return (
      <App>
        <Window style={ styles.mainWindow }>
          <IndicatorAddForm addIndicator={this.addIndicator.bind(this)} />
          <ConnectionForm 
            pullPort={this.state.pullPort} 
            reqPort={this.state.reqPort} 
            changeReqPort={this.changeReqPort.bind(this)}
            changePullPort={this.changePullPort.bind(this)}
          />
          <Text style={{ fontWeight: 'bold' }}> Timeframe: </Text> 
          <TextInput
            style={{ borderWidth: 1, width: '200px' }}  
            value={this.state.timeframe}
            onChangeText={ this.changeTimeframe.bind(this)} 
          />
          <Button style={{ width: '200px' }} title="Connect" onPress={ () => { this._connect() } } />
          <Text style={{ fontWeight: 'bold' }}> Symbol: </Text> 
          <SymbolPicker changeSymbol={ this.changeSymbol.bind(this) } />
          <View>
            <Text style={{ fontWeight: 'bold' }}> ask: {this.state.txtBid} </Text>
            <Text style={{ fontWeight: 'bold' }}> bid: {this.state.txtAsk} </Text>
          </View>
          <OpenedTrades trades={this.state.openedTrades} />
        </Window>
      </App>
    );
  }
}
