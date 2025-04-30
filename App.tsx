/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type {PropsWithChildren} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { NavigationContainer, useNavigation, useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginPage from './components/LoginPage';
import UserPage from './components/UserPage';
import ViewMap from './components/ViewMap';

const Stack = createNativeStackNavigator();



function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  /*
   * To keep the template simple and small we're adding padding to prevent view
   * from rendering under the System UI.
   * For bigger apps the recommendation is to use `react-native-safe-area-context`:
   * https://github.com/AppAndFlow/react-native-safe-area-context
   *
   * You can read more about it here:
   * https://github.com/react-native-community/discussions-and-proposals/discussions/827	
   */
  const safePadding = '5%';

  return (
	<NavigationContainer>
	      <Stack.Navigator>
		<Stack.Screen name="Market Mapper" component={LoginPage} />
		<Stack.Screen name="Maps" component={UserPage} />
		<Stack.Screen name="ViewMap" component={ViewMap} />
	      </Stack.Navigator>
	    </NavigationContainer>
  );
}
	
const styles = StyleSheet.create({
  
});

export default App;
