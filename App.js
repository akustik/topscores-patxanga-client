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
  "Albert",
  "Antonio",
  "Arnau",
  "Erik",
  "Fede",
  "Fran",
  "Guillem",
  "Jordi",
  "Marc",
  "Ramon",
  "Ricard",
  "Sergi",
  "Uri",
  "Victor",
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
  grocs: teamFor('grocs'),
  serverStatus: 'DOWN',
  availablePlayers: PLAYERS
};

class TeamMember extends Component {
  render() {
    const teamName = this.props.team;
    const playerName = this.props.member.name;
    const playerGoals = this.props.member.goals || 0;

    return (
        <View style={styles.actionsContainer}>
          <View style={styles.playerContainer}>
            <Text style={styles.playerText}>{'\u2022 ' + playerName} ({playerGoals})</Text>
          </View>
          <View style={styles.playerContainer}>
            <Button title="+" onPress={() => this.props.onIncPlayerGoals(teamName, playerName)}/>
          </View>
        </View>
    )
  }
}

class Team extends Component {
  render() {
    const teamName = this.props.element.team;
    const combineStyles = StyleSheet.flatten(
        [styles.teamContainer, this.props.style]);
    return (
        <View style={combineStyles}>
          <View style={styles.actionsContainer}>
            <View style={styles.teamTitleElement}>
              <Text style={styles.titleText}>{teamName} ({this.props.element.score})</Text>
            </View>
            <View style={styles.teamTitleElement}>
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
            </View>
          </View>
          <View style={{flex: 6}}>
            <FlatList
                data={this.props.element.players}
                renderItem={
                  ({item}) => <TeamMember
                      member={item}
                      onIncPlayerGoals={this.props.onIncPlayerGoals}
                      team={teamName}>

                  </TeamMember>
                }
                keyExtractor={item => item.name}
            />

            <Picker
                onValueChange={(itemValue) =>
                    this.props.onAddPlayer(teamName, itemValue)
                }>
              <Picker.Item label="Add a team player" value=""/>
              {this.props.availablePlayers.map((item) => {
                return (<Picker.Item label={item} value={item} key={item}/>)
              })}
            </Picker>
          </View>
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
    this.save = this.save.bind(this);
    this.updateServerStatus = this.updateServerStatus.bind(this);
    this.incPlayerGoals = this.incPlayerGoals.bind(this);
  }

  state = INITIAL_STATE;

  componentDidMount() {
    setInterval(() => {
      this.updateServerStatus();
    }, 60000);
    this.updateServerStatus();
  }

  addPlayer(team, player) {
    this.setState((previous) => {
      let updated = {};
      updated[team] = teamFor(team, previous[team].score,
          previous[team].players.concat({
            name: player
          }));
      updated.availablePlayers = previous.availablePlayers.filter((v) => { return v !== player} );
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

  incPlayerGoals(team, player) {
    this.setState((previous) => {
      let updated = {};
      updated[team] = teamFor(team, previous[team].score,
          previous[team].players.map((p => {
            if(p.name === player) {
              //TODO: Clone
              return {
                name: player,
                goals: (p.goals || 0) + 1
              }
            } else {
              return p;
            }
          })));
      return updated;
    })
  }

  updateServerStatus() {
    fetch('https://peaceful-sierra-85970.herokuapp.com/health', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }).then((responseJson) => {
      if (responseJson.status !== 200) {
        this.setState(() => {
          return {serverStatus: 'DOWN'};
        })
      } else {
        responseJson.json().then((json) => {
          this.setState(() => {
            return {serverStatus: json.status};
          });
        });
      }
    }).catch((error) => {
      this.setState(() => {
        return {serverStatus: 'DOWN'};
      })
    });
  }

  toParty(element) {
    let party = {
      team: {
        name: element.team
      },
      score: element.score,
      members: element.players.map((p) => {
        return {name: p.name};
      }),
      metrics: element.players.map((p) => {
        return {name: 'goals' + ':' + p.name, value: p.goals}
      })
    };

    return party;
  }

  toGame() {
    let game = {
      tournament: '2019-2020',
      parties: [
          this.toParty(this.state.blaus),
          this.toParty(this.state.grocs)
      ]
    };

    return game;
  }

  save() {
    fetch('https://peaceful-sierra-85970.herokuapp.com/games/add', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + SECRET
      },
      body: JSON.stringify(this.toGame()),
    }).then((responseJson) => {
      if (responseJson.status !== 200) {
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
            <Team element={this.state.blaus}
                  availablePlayers={this.state.availablePlayers}
                  onAddPlayer={this.addPlayer}
                  onChangeScore={this.changeScore}
                  onIncPlayerGoals={this.incPlayerGoals}
                  style={{backgroundColor: 'powderblue'}}/>
            <Team element={this.state.grocs}
                  availablePlayers={this.state.availablePlayers}
                  onAddPlayer={this.addPlayer}
                  onChangeScore={this.changeScore}
                  onIncPlayerGoals={this.incPlayerGoals}
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
                  disabled={this.state.serverStatus !== 'UP'}
                  title={this.state.serverStatus === 'UP'? 'Submit': 'Loading...'}
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
  },
  teamTitleElement: {
    flex: 1,
    padding: 2
  },
  playerContainer: {
    flex: 1,
    padding: 2
  },
  titleText: {
    fontFamily: 'Cochin',
    fontSize: 18,
    fontWeight: 'bold'
  },
  playerText: {
    fontFamily: 'Cochin',
    fontSize: 16
  },
});

const App = () => {
  return (
      <Game/>
  );
};

export default App;
