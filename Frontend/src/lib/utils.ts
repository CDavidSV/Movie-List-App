import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 
 * @param date 
 * Returns the relative date from today
 */
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const delta = Math.abs(date.getTime() - now.getTime());

  const time: {[key: string]: number} = {
      Seconds: Math.floor(delta / 1000),
      Minutes: Math.floor(delta / 1000 / 60),
      Hours: Math.floor(delta / 1000 / 60 / 60),
      Days: Math.floor(delta / 1000 / 60 / 60 / 24),
      Months: Math.floor(delta / 1000 / 60 / 60 / 24 / 30),
      Years: Math.floor(delta / 1000 / 60 / 60 / 24 / 365)
  };
  
  if (time.Seconds <= 59) return "Now"

  let relativeIdentifier: string = '';
  let relativeTime: number = 0;
  Object.keys(time).forEach((key: string) => {
      if (time[key] > 0) {
          relativeIdentifier = key;
          relativeTime = time[key];
          if (time[key] <= 1) {
              relativeIdentifier = relativeIdentifier.substring(0, relativeIdentifier.length - 1);
          }
      }
  });
  
  if (date > now) {
      return `In ${relativeTime} ${relativeIdentifier}`;
  } else {
      return `${relativeTime} ${relativeIdentifier} ago`;
  }
}