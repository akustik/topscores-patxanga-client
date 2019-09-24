import {FlatList, Picker, StyleSheet, Text, View} from "react-native";
import Slider from "@react-native-community/slider";
import React, {Component} from 'react';
import TeamMember from "./team_member";
import styles from "../styles/styles";

class Team extends Component {
  render() {
    const teamName = this.props.element.team;
    const combineStyles = StyleSheet.flatten(
        [styles.teamContainer, this.props.style]);
    return (
        <View style={combineStyles}>
          <View style={styles.actionsContainer}>
            <View style={styles.teamTitleElement}>
              <Text
                  style={styles.titleText}>{teamName} ({this.props.element.score})</Text>
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

export default Team;
