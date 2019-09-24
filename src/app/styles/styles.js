import {StyleSheet} from "react-native";

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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  grocsBackground: {
    backgroundColor: 'lightyellow'
  },
  blausBackground: {
    backgroundColor: 'powderblue'
  },
  neutralBackground: {
    backgroundColor: 'lightgray'
  }
});

export default styles;
