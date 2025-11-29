import { View, Text, StyleSheet } from 'react-native';

export default function TradeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Trading Terminal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
