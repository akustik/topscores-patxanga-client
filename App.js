/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
  Alert,
  Button,
  FlatList,
  Picker,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';

const PLAYERS = [
  "Guillem",
  "Ramon",
  "Albert",
  "Antonio",
  "Oriol"
];

const teamFor = (name, score, members) => {
  return {
    name: name,
    score: score || 0,
    members: members || []
  }
};

const INITIAL_STATE = {
  blaus: teamFor('blaus'),
  grocs: teamFor('grocs')
};

class Team extends Component {
  render() {
    const combineStyles = StyleSheet.flatten(
        [styles.teamContainer, this.props.style]);
    return (
        <View style={combineStyles}>
          <Text>{this.props.element.name}: {this.props.element.score}</Text>
          <FlatList
              data={this.props.element.members}
              renderItem={
                ({item}) => <Text> * {item} </Text>
              }
              keyExtractor={item => item}
          />

          <Picker
              onValueChange={(itemValue, itemIndex) =>
                  this.props.onAddMember(this.props.element.name, itemValue)
              }>
            <Picker.Item label="Add a team member" value=""/>
            {PLAYERS.map((item, index) => {
              return (<Picker.Item label={item} value={item} key={item}/>)
            })}
          </Picker>
        </View>
    )
  }
}

class Game extends Component {

  constructor(props) {
    super(props)

    this.addMember = this.addMember.bind(this)
    this.reset = this.reset.bind(this)
  }

  state = INITIAL_STATE;

  addMember(team, name) {
    this.setState((previous) => {
      let updated = {};
      updated[team] = teamFor(team, previous[team].score,
          previous[team].members.concat(name));
      return updated;
    })
  }

  save() {
    Alert.alert('Simple Button pressed')
  }

  reset() {
    this.setState(() => INITIAL_STATE)
  }

  render() {
    return (
        <SafeAreaView style={{flex: 1}}>
          <View style={{flex: 14}}>
            <Team element={this.state.blaus} onAddMember={this.addMember} style={{backgroundColor: 'powderblue'}}/>
            <Team element={this.state.grocs} onAddMember={this.addMember} style={{backgroundColor: 'lightyellow'}}/>
          </View>
          <View style={styles.actionsContainer}>
            <View style={styles.buttonContainer}>
              <Button style={styles.button}
                      title="Reset"
                      onPress={this.reset}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                  title="Submit"
                  onPress={this.save}
              />
            </View>
          </View>
        </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  teamContainer: {
    flex: 1,
    margin: 5,
    padding: 5,
    backgroundColor: 'lightgray',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'white'
  },
  actionsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flex: 1,
    padding: 20
  }
});

const App = () => {
  return (
      <Game/>
  );
};

export default App;
