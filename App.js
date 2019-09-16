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
    const playerScore = this.props.member.score;

    if(playerScore) {
      return (
          <View>
            <Text> => {playerName} (score: {playerScore})</Text>
          </View>
      )
    } else {
      return (
          <View>
            <Text> => {playerName}</Text>
            <Button title="+" onPress={() => this.props.onIncPlayerScore(teamName, playerName)}/>
          </View>
      )
    }
  }
}

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
                ({item}) => <TeamMember
                    member={item}
                    onIncPlayerScore={this.props.onIncPlayerScore}
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

  incPlayerScore(team, player) {
    Alert.alert(team + player);
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

  save() {
    fetch('https://peaceful-sierra-85970.herokuapp.com/games/simple/add', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + SECRET
      },
      body: JSON.stringify({
        teams: [this.state.blaus, this.state.grocs],
        tournament: '2019-2020'
      }),
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
                  onPlayerIncScore={this.incPlayerScore}
                  style={{backgroundColor: 'powderblue'}}/>
            <Team element={this.state.grocs}
                  availablePlayers={this.state.availablePlayers}
                  onAddPlayer={this.addPlayer}
                  onChangeScore={this.changeScore}
                  onIncPlayerScore={this.incPlayerScore}
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
  }
});

const App = () => {
  return (
      <Game/>
  );
};

export default App;
