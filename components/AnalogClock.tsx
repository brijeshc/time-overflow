import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Text,
  Falsy,
  RecursiveArray,
  RegisteredStyle,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";
import { ViewStyle } from "react-native/Libraries/StyleSheet/StyleSheetTypes";

const getNumberPosition = (hour: number) => {
  // Subtract 90 degrees to start at 12 o'clock position
  const angle = ((hour / 12) * 360 - 90) * (Math.PI / 180);
  const radius = 100;
  return {
    left: radius * Math.cos(angle) + 125 - 10, // Center offset (125) minus half of typical number width (10)
    top: radius * Math.sin(angle) + 125 - 10, // Center offset (125) minus half of typical number height (10)
  };
};

export const AnalogClock = (props: { style?: ViewStyle }) => {
  const [time, setTime] = useState(new Date());
  const secondRotation = new Animated.Value(0);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const formatDate = (date: Date) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    const suffix = ["th", "st", "nd", "rd"][
      day % 10 > 3 ? 0 : (day % 100) - (day % 10) != 10 ? day % 10 : 0
    ];

    return `${dayName} ${day}${suffix} ${month} ${year}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
      Animated.sequence([
        Animated.timing(secondRotation, {
          toValue: 360,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => {
        secondRotation.setValue(0);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDegrees = ((hours % 12) + minutes / 60) * 30;
  const minuteDegrees = minutes * 6;
  const secondDegrees = seconds * 6;

  return (
    <View style={[styles.container, props.style]}>
      <LinearGradient
        colors={[backgroundColor, "rgba(255,255,255,0.1)"]}
        style={[styles.clockFace, { borderColor: textColor }]}
      >
        {/* Hour Numbers */}
        {[...Array(12)].map((_, i) => {
          const hour = i + 1;
          const position = getNumberPosition(hour);
          return (
            <Text
              key={hour}
              style={[
                styles.hourNumber,
                {
                  color: textColor,
                  left: position.left,
                  top: position.top,
                },
              ]}
            >
              {hour}
            </Text>
          );
        })}

        {/* Hour Markers */}
        {[...Array(12)].map((_, i) => {
          const angle = ((i / 12) * 360 - 90) * (Math.PI / 180);
          const radius = 110;
          return (
            <View
              key={i}
              style={[
                styles.hourMarker,
                {
                  backgroundColor: textColor,
                  transform: [
                    {
                      rotate: `${i * 30}deg`,
                    },
                  ],
                },
              ]}
            />
          );
        })}

        {/* Hour hand */}
        <View style={styles.handContainer}>
          <Animated.View
            style={[
              styles.hourHand,
              { backgroundColor: textColor },
              { transform: [{ rotate: `${hourDegrees}deg` }] },
            ]}
          />
        </View>

        {/* Minute hand */}
        <View style={styles.handContainer}>
          <Animated.View
            style={[
              styles.minuteHand,
              { backgroundColor: textColor },
              { transform: [{ rotate: `${minuteDegrees}deg` }] },
            ]}
          />
        </View>

        {/* Second hand */}
        <View style={styles.handContainer}>
          <Animated.View
            style={[
              styles.secondHand,
              { backgroundColor: "#E74C3C" },
              { transform: [{ rotate: `${secondDegrees}deg` }] },
            ]}
          />
        </View>

        {/* Center dot */}
        <View style={[styles.centerDot, { backgroundColor: textColor }]} />
      </LinearGradient>
      <Text style={[styles.dateText, { color: textColor }]}>
        {formatDate(time)}
      </Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 20,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "500",
  },
  clockFace: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: "hidden",
  },
  hourNumber: {
    position: "absolute",
    fontSize: 16,
    fontWeight: "500",
  },
  hourMarker: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    top: 10,
    left: "50%",
    marginLeft: -2,
    transformOrigin: "center 115px",
  },
  marker: {
    position: "absolute",
    width: 240,
    height: 2,
    alignItems: "flex-end",
  },
  markerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  handContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  hourHand: {
    position: "absolute",
    width: 4,
    height: 80,
    borderRadius: 4,
    bottom: "50%",
    transformOrigin: "bottom",
  },
  minuteHand: {
    position: "absolute",
    width: 3,
    height: 110,
    borderRadius: 3,
    bottom: "50%",
    transformOrigin: "bottom",
  },
  secondHand: {
    position: "absolute",
    width: 2,
    height: 120,
    borderRadius: 2,
    bottom: "50%",
    transformOrigin: "bottom",
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: "absolute",
  },
});
