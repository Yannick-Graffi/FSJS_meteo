import { StatusBar } from "expo-status-bar";
import { React, useEffect, useState } from "react";
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
  ImageBackground,
  Image,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

const window = Dimensions.get("window");

const apiKey = "2018d52ae3ff9931d3a3ae39690b8b31";

export default function App() {
  const [location, setLocation] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [cityInput, setCityInput] = useState("");
  const [meteoNow, setMeteoNow] = useState({});
  const [meteoWeek, setMeteoWeek] = useState({});
  const [meteoArray, setMeteoArray] = useState(null);

  const [nowButton, setNowButton] = useState(true);
  const [weeklyButton, setWeeklyButton] = useState(false);
  const [hourlyButton, setHourlyButton] = useState(false);

  useEffect(() => {
    //function to get the location's permission and setting the state
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg(
          "La permission d'accéder à la géolocalisation a été refusée"
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      await AsyncStorage.setItem(
        "latitude",
        JSON.stringify(location.coords.latitude)
      );
      await AsyncStorage.setItem(
        "longitude",
        JSON.stringify(location.coords.longitude)
      );
    })();
  }, []);

  //handle the input to get the city from the user's input
  const handleCityInput = (e) => {
    setCityInput(e);
  };

  // getting the lat and lon params with the user's input from API
  const getPosition = () => {
    return fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${cityInput}&appid=${apiKey}`
    )
      .then((response) => response.json())
      .then(async (json) => {
        await AsyncStorage.setItem("latitude", JSON.stringify(json[0].lat));
        await AsyncStorage.setItem("longitude", JSON.stringify(json[0].lon));

        getMeteoNow();
        getMeteoWeek();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // getting the weather infos from geolocation or user's input
  const getMeteoNow = async () => {
    let latitude = await AsyncStorage.getItem("latitude");
    let longitude = await AsyncStorage.getItem("longitude");

    return fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
    )
      .then((response) => response.json())
      .then((json) => {
        setMeteoNow({
          name: json.name,
          description: json.weather[0].description,
          icone: json.weather[0].icon,
          humidity: json.main.humidity,
          temp: json.main.temp,
          wSpeed: json.wind.speed,
          wDirection: json.wind.deg,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getMeteoWeek = async () => {
    let latitude = await AsyncStorage.getItem("latitude");
    let longitude = await AsyncStorage.getItem("longitude");

    return fetch(
      `https://api.openweathermap.org/data/2.5/forecast?&lat=${latitude}&lon=${longitude}&lang=fr&units=metric&appid=${apiKey}`
    )
      .then((response) => response.json())
      .then((json) => {
        const weekArray = json.list.filter((a) => a.dt_txt.includes("12:00"));

        setMeteoWeek(
          weekArray.map((e) => {
            return (
              <View key={e.dt}>
                <Text style={{ flex: 1, textAlign: "center" }}>{e.dt_txt}</Text>
                <View style={styles.hourlyContainer}>
                  <Image
                    style={{
                      flex: 2,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    source={{
                      uri: `http://openweathermap.org/img/wn/${e.weather[0].icon}@2x.png`,
                    }}
                  />
                  <View style={{ flex: 6 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                        alignItems: "center",
                      }}
                    >
                      <Text style={styles.temp}>{e.main.temp}°C</Text>
                      <Text>{e.main.humidity}%</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                      }}
                    >
                      <Image
                        style={{ height: 50, width: 50 }}
                        source={require("./assets/wind.png")}
                      />
                      <View>
                        <Text>{e.wind.speed}km/h</Text>
                        <Text>{e.wind.deg}°</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.status}>
                      {e.weather[0].description}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        );

        setMeteoArray(
          json.list.map((e) => {
            return (
              <View key={e.dt}>
                <Text style={{ flex: 1, textAlign: "center" }}>{e.dt_txt}</Text>
                <View style={styles.hourlyContainer}>
                  <Image
                    style={{
                      flex: 2,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    source={{
                      uri: `http://openweathermap.org/img/wn/${e.weather[0].icon}@2x.png`,
                    }}
                  />
                  <View style={{ flex: 6 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                        alignItems: "center",
                      }}
                    >
                      <Text style={styles.temp}>{e.main.temp}°C</Text>
                      <Text>{e.main.humidity}%</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                      }}
                    >
                      <Image
                        style={{ height: 50, width: 50 }}
                        source={require("./assets/wind.png")}
                      />
                      <View>
                        <Text>{e.wind.speed}km/h</Text>
                        <Text>{e.wind.deg}°</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.status}>
                      {e.weather[0].description}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        );
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    getMeteoNow();
    getMeteoWeek();
  }, [location]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <Text style={styles.city}>{meteoNow.name}</Text>
        <TextInput
          style={styles.searchBar}
          onChangeText={handleCityInput}
          placeholder="Saisissez une ville"
        />
        <Button title="OK" onPress={getPosition} />
      </View>
      <ImageBackground
        source={require("../atelier3-meteo/assets/bg.jpg")}
        style={styles.bgImg}
      >
        <View style={styles.periodes}>
          <Button
            title="Maintenant"
            onPress={() => {
              setWeeklyButton(false);
              setHourlyButton(false);
              setNowButton(true);
            }}
          />
          <Button
            title="Semaine"
            onPress={() => {
              setWeeklyButton(true);
              setHourlyButton(false);
              setNowButton(false);
            }}
          />
          <Button
            title="Par heure"
            onPress={() => {
              setNowButton(false);
              setWeeklyButton(false);
              setHourlyButton(true);
            }}
          />
        </View>

        {/* Displaying the weather infos using the current weather button */}

        {nowButton && (
          <View style={styles.meteoContainer}>
            <Text style={styles.status}>{meteoNow.description}</Text>
            <View style={styles.meteoInfosContainer}>
              <View>
                <Image
                  style={styles.icone}
                  source={{
                    uri: `http://openweathermap.org/img/wn/${meteoNow.icone}@2x.png`,
                  }}
                />
              </View>
              <View style={styles.meteoInfos}>
                <View>
                  <Text style={styles.temp}>{meteoNow.temp}°C</Text>
                </View>
                <View style={styles.vent}>
                  <Image
                    style={styles.icone}
                    source={require("./assets/wind.png")}
                  />
                  <Text>Vitesse : {meteoNow.wSpeed} km/h </Text>
                  <Text>Orientation : {meteoNow.wDirection}° </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Displaying the weather infos using the current weekly button */}

        {weeklyButton && (
          <View style={{ flex: 20 }}>
            <ScrollView>{meteoWeek}</ScrollView>
          </View>
        )}

        {/* Displaying the weather infos using the hourly button */}

        {hourlyButton && (
          <View style={{ flex: 20 }}>
            <ScrollView>{meteoArray}</ScrollView>
          </View>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
  },
  bgImg: {
    flex: 20,
    width: window.width,
    height: window.height,
  },
  navBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  city: {
    flex: 1,
  },
  searchBar: {
    flex: 1,
    backgroundColor: "#00f0ff",
  },
  periodes: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    padding: 5,
  },
  meteoContainer: {
    flex: 20,
  },
  status: {
    flex: 1,
    backgroundColor: "#2196F3",
    textAlign: "center",
    fontSize: 20,
  },
  meteoInfosContainer: {
    flex: 10,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  icone: {
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    height: 50,
  },
  temp: {
    fontSize: 30,
    paddingBottom: 10,
    textAlign: "center",
  },
  vent: {
    alignItems: "center",
  },
  date: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ff230c",
  },
  hourlyContainer: {
    flex: 1,
    justifyContent: "space-evenly",
    paddingVertical: 10,
    flexDirection: "row",
    borderBottomColor: "#2196F3",
    borderBottomWidth: 2,
  },
});
