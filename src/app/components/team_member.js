import {Button, Text, View} from "react-native";
import React, {Component} from 'react';
import styles from "../styles/styles";

class TeamMember extends Component {
  render() {
    const teamName = this.props.team;
    const playerName = this.props.member.name;
    const playerGoals = this.props.member.goals || 0;

    return (
        <View style={styles.actionsContainer}>
          <View style={styles.playerContainer}>
            <Text style={styles.playerText}>{'\u2022 '
            + playerName} ({playerGoals})</Text>
          </View>
          <View style={styles.playerContainer}>
            <Button title="+"
                    onPress={() => this.props.onIncPlayerGoals(teamName,
                        playerName)}/>
          </View>
        </View>
    )
  }
}

export default TeamMember;
