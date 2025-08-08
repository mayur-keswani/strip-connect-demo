export interface Event {
  id: string;
  name: string;
  description: string;
  price: string;
  date: string;
}

const EVENTS_KEY = 'events';

export const getEvents = (): Event[] => {
  if (typeof window === 'undefined') return [];
  const events = localStorage.getItem(EVENTS_KEY);
  return events ? JSON.parse(events) : [];
};

export const saveEvent = (event: Omit<Event, 'id'>): Event => {
  const newEvent = {
    ...event,
    id: Date.now().toString(),
  };
  
  const events = getEvents();
  events.push(newEvent);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  
  return newEvent;
};

export const getEventById = (id: string): Event | undefined => {
  const events = getEvents();
  console.log({events});
  return events.find(event => event.id === id);
};
