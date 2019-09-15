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

import Slider from '@react-native-community/slider';

const SECRET = 'base64-basic-auth-token';

const PLAYERS = [
  "Guillem",
  "Ramon",
  "Albert",
  "Antonio",
  "Oriol"
];

const teamFor = (team, score, players) => {
  return {
    team: team,
    score: score || 0,
    players: players || []
  }
};

const INITIAL_STATE = {
  blaus: teamFor('blaus'),
  grocs: teamFor('grocs')
};

class Team extends Component {
  render() {
    const teamName = this.props.element.team;
    const combineStyles = StyleSheet.flatten(
        [styles.teamContainer, this.props.style]);
    return (
        <View style={combineStyles}>
          <Text>{teamName}: {this.props.element.score}</Text>
          <Slider
              minimumValue={0}
              maximumValue={15}
              step={1}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
              onValueChange={
                (score) => this.props.onChangeScore(teamName, score)
              }
          />
          <FlatList
              data={this.props.element.players}
              renderItem={
                ({item}) => <Text> * {item} </Text>
              }
              keyExtractor={item => item}
          />

          <Picker
              onValueChange={(itemValue) =>
                  this.props.onAddPlayer(teamName, itemValue)
              }>
            <Picker.Item label="Add a team player" value=""/>
            {PLAYERS.map((item) => {
              return (<Picker.Item label={item} value={item} key={item}/>)
            })}
          </Picker>
        </View>
    )
  }
}

class Game extends Component {

  constructor(props) {
    super(props);

    this.addPlayer = this.addPlayer.bind(this);
    this.reset = this.reset.bind(this);
    this.changeScore = this.changeScore.bind(this);
  }

  state = INITIAL_STATE;

  addPlayer(team, player) {
    this.setState((previous) => {
      let updated = {};
      updated[team] = teamFor(team, previous[team].score,
          previous[team].players.concat(player));
      return updated;
    })
  }

  changeScore(team, score) {
    this.setState((previous) => {
      let updated = {};
      updated[team] = teamFor(team, score,
          previous[team].players);
      return updated;
    })
  }

  save() {
    fetch('https://peaceful-sierra-85970.herokuapp.com/games/simple/add', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + SECRET
      },
      body: JSON.stringify({
        teams: this.state,
        tournament: '2019-2020'
      }),
    }).then((responseJson) => {
      if(responseJson.status !== 200) {
        Alert.alert('Failed', JSON.stringify(responseJson));
      } else {
        Alert.alert('Game added');
      }
    }).catch((error) => {
      Alert.alert('Failed', JSON.stringify(error));
    });
  }

  reset() {
    this.setState(() => INITIAL_STATE)
  }

  render() {
    return (
        <SafeAreaView style={{flex: 1}}>
          <View style={{flex: 14}}>
            <Team element={this.state.blaus} onAddPlayer={this.addPlayer}
                  onChangeScore={this.changeScore}
                  style={{backgroundColor: 'powderblue'}}/>
            <Team element={this.state.grocs} onAddPlayer={this.addPlayer}
                  onChangeScore={this.changeScore}
                  style={{backgroundColor: 'lightyellow'}}/>
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
