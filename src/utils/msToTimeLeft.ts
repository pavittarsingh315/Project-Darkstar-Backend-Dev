function millisecondsToTimeLeft(milliseconds: number) {
   let seconds = <number>(<unknown>(milliseconds / 1000).toFixed(2));
   let minutes = <number>(<unknown>(milliseconds / (1000 * 60)).toFixed(2));
   let hours = <number>(<unknown>(milliseconds / (1000 * 60 * 60)).toFixed(2));
   let days = (milliseconds / (1000 * 60 * 60 * 24)).toFixed(2);
   if (seconds < 60) return seconds + " seconds";
   else if (minutes < 60) return minutes + " minutes";
   else if (hours < 24) return hours + " hours";
   else return days + " days";
}

export default millisecondsToTimeLeft;
