import * as Location from 'expo-location';

const getCurrentLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return;
  }
  
  const location = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = location.coords;
console.log(longitude, latitude);
  return { latitude, longitude };
};

export default getCurrentLocation;