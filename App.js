/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Fragment, Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
    Picker,
    FlatList
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const PLAYERS = [
    "Guillem",
    "Ramon",
    "Albert",
    "Antonio",
    "Oriol"
]

class Team extends Component {
  state = { members: []}
  
  render() {
    return (
        <SafeAreaView style={{flex: 1, backgroundColor: this.props.backgroundColor}}>
        <Text>{this.props.name}</Text>
        <FlatList
          data={this.state.members}
          renderItem={
            ({ item }) => <Text> * {item} </Text>
          }
          keyExtractor={item => item}
          />

          <Picker
          onValueChange={(itemValue, itemIndex) =>
            this.setState({members: this.state.members.concat(itemValue)})
          }>
          <Picker.Item label="Choose a team member" value="" />
          {PLAYERS.map((item, index) => {
            return (<Picker.Item label={item} value={item} key={item}/>) 
          })}
          

        </Picker>      
              
              
        </SafeAreaView>

    )
  }
}

const App = () => {
  
  return (
      <View style={{flex: 1}}>
        <Team name="blaus" backgroundColor='powderblue'/>
        <Team name="grocs" backgroundColor='lightyellow'/>
      </View>
  );
};

export default App;
