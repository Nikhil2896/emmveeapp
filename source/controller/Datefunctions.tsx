export const formatDate = (timestamp: string | number): string => {
  const timestampNum =
    typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
  const date = new Date(timestampNum);
  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are 0-indexed
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const formatTime = (timestamp: string | number): string => {
  const timestampNum =
    typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
  const date = new Date(timestampNum);

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  let formattedTime: string;

  if (hours === 0) {
    formattedTime = `12:${formattedMinutes} AM`;
  } else if (hours < 12) {
    formattedTime = `${hours}:${formattedMinutes} AM`;
  } else if (hours === 12) {
    formattedTime = `12:${formattedMinutes} PM`;
  } else {
    formattedTime = `${hours - 12}:${formattedMinutes} PM`;
  }

  return formattedTime;
};
