import React, {Component} from 'react';

import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Linking,
  SafeAreaView,
  Text,
  View
} from 'react-native';

import {SECRET, URL} from '../config/config';
import Team from './team'
import styles from "../styles/styles";

const PLAYERS = [
  "Albert",
  "Antonio",
  "Arnau",
  "Arturo",
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

class Game extends Component {

  constructor(props) {
    super(props);

    this.addPlayer = this.addPlayer.bind(this);
    this.reset = this.reset.bind(this);
    this.changeScore = this.changeScore.bind(this);
    this.list = this.list.bind(this);
    this.save = this.save.bind(this);
    this.changePage = this.changePage.bind(this);
    this.updateServerStatus = this.updateServerStatus.bind(this);
    this.incPlayerGoals = this.incPlayerGoals.bind(this);
  }

  state = {
    page: 'loading',
    games: [],
    serverStatus: 'DOWN',
    blaus: teamFor('blaus'),
    grocs: teamFor('grocs'),
    availablePlayers: PLAYERS
  };

  componentDidMount() {
    setInterval(() => {
      this.updateServerStatus();
    }, 60000);
    this.list();
  }

  addPlayer(team, player) {
    this.setState((previous) => {
      let updated = {};
      updated[team] = teamFor(team, previous[team].score,
          previous[team].players.concat({
            name: player
          }));
      updated.availablePlayers = previous.availablePlayers.filter((v) => {
        return v !== player
      });
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

  changePage(page) {
    this.setState(() => {
      return {page: page}
    });
  }

  incPlayerGoals(team, player) {
    this.setState((previous) => {
      let updated = {};
      updated[team] = teamFor(team, previous[team].score,
          previous[team].players.map((p => {
            if (p.name === player) {
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
    fetch(URL + 'health', {
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

  toDate(epoch) {
    return new Date(epoch).toLocaleString("es-ES", {timeZone: "Europe/Madrid"})
  }

  toGameEntry(item) {
    let blaus = item.parties.find(p => p.team.name === 'blaus');
    let grocs = item.parties.find(p => p.team.name === 'grocs');

    let backgroundColor = styles.neutralBackground;

    if(blaus.score > grocs.score) {
      backgroundColor = styles.blausBackground;
    } else if (grocs.score > blaus.score) {
      backgroundColor = styles.grocsBackground;
    }

    return (
        <View style={[styles.teamContainer, backgroundColor]}>
          <Text>{item.tournament + ' | ' + this.toDate(
              item.timestamp)}</Text>
          <Text>
            {blaus.team.name + ' ('
            + blaus.score + ') - '
            + grocs.team.name + ' ('
            + grocs.score + ')'}
          </Text>
        </View>
    );
  }

  save() {
    this.changePage('loading');
    fetch(URL + 'games/add', {
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
        this.changePage('add');
      } else {
        this.reset();
        this.list();
      }
    }).catch((error) => {
      Alert.alert('Failed', JSON.stringify(error));
      this.changePage('add');
    });
  }

  list() {
    fetch(URL + 'games/list', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + SECRET
      }
    }).then((responseJson) => {
      if (responseJson.status !== 200) {
        Alert.alert('Failed', JSON.stringify(responseJson));
      } else {
        responseJson.json().then((jsonArray) => {
          this.setState(() => {
            return {
              games: jsonArray,
              serverStatus: 'UP',
              page: 'list'
            };
          });
        });
      }
    }).catch((error) => {
      Alert.alert('Failed', JSON.stringify(error));
    });
  }

  reset() {
    this.setState(() => {
      return {
        blaus: teamFor('blaus'),
        grocs: teamFor('grocs'),
        availablePlayers: PLAYERS
      }
    })
  }

  open() {
    Linking.openURL(URL);
  }

  render() {
    if (this.state.page === 'list') {
      return (
          <SafeAreaView style={{flex: 1}}>
            <View style={{flex: 14}}>
              <FlatList
                  data={this.state.games}
                  renderItem={
                    ({item}) => this.toGameEntry(item)
                  }
                  keyExtractor={item => this.toDate(item.timestamp)}
              />
            </View>
            <View style={styles.actionsContainer}>
              <View style={styles.buttonContainer}>
                <Button style={styles.button}
                        title="Web"
                        onPress={this.open}
                />
              </View>
              <View style={styles.buttonContainer}>
                <Button
                    title={'Add game'}
                    onPress={() => this.changePage('add')}
                />
              </View>
            </View>
          </SafeAreaView>
      );
    } else if (this.state.page === 'add') {
      return (
          <SafeAreaView style={{flex: 1}}>
            <View style={{flex: 14}}>
              <Team element={this.state.blaus}
                    availablePlayers={this.state.availablePlayers}
                    onAddPlayer={this.addPlayer}
                    onChangeScore={this.changeScore}
                    onIncPlayerGoals={this.incPlayerGoals}
                    style={styles.blausBackground}/>
              <Team element={this.state.grocs}
                    availablePlayers={this.state.availablePlayers}
                    onAddPlayer={this.addPlayer}
                    onChangeScore={this.changeScore}
                    onIncPlayerGoals={this.incPlayerGoals}
                    style={styles.grocsBackground}/>
            </View>
            <View style={styles.actionsContainer}>

              <View style={styles.buttonContainer}>
                <Button style={styles.button}
                        title="Cancel"
                        onPress={() => {
                          this.reset();
                          this.changePage('list');
                        }}
                />
              </View>

              <View style={styles.buttonContainer}>
                <Button
                    disabled={this.state.serverStatus !== 'UP'}
                    title={this.state.serverStatus === 'UP' ? 'Submit'
                        : 'Loading...'}
                    onPress={this.save}
                />
              </View>
            </View>
          </SafeAreaView>
      );
    } else {
      return (
          <View style={styles.centeredContainer}>
            <ActivityIndicator size="large" color="#0000ff"/>
          </View>
      );
    }
  }
}

export default Game;
