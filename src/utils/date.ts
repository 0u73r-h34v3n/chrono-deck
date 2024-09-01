export const dateToUnixTimestamp = (date: Date) => {
  return Math.floor(date.getTime() / 1000);
};
